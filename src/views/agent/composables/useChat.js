import { ref } from "vue";
import { chatStream } from "@/api/agent";

// 聊天状态管理组合式函数：封装消息列表、流式请求、历史记录等逻辑，供 index.vue 使用
export function useChat() {
  // 欢迎语(首次进入或无历史时使用)
  const WELCOME_MESSAGE = {
    role: "assistant",
    content:
      "**有什么我能帮你的吗？**\n\n告诉我\~ 你可以直接问我问题，或者发送一段内容让我帮你处理。",
  };
  const messages = ref([]); // 所有聊天消息(用户 + AI)，驱动界面渲染
  const isStreaming = ref(false); // 是否正在流式接收 AI 回复(控制输入框禁用/按钮切换)
  const currentContent = ref(""); // 当前流式回复的累积内容
  let abortController = null; // 用于「停止」按钮中断正在进行的 fetch 请求

  // 若消息列表为空则插入欢迎语
  function ensureWelcome() {
    if (!messages.value.length) {
      messages.value = [WELCOME_MESSAGE];
    }
  }

  // 从 localStorage 读取上次保存的聊天记录
  function getHistory() {
    const raw = localStorage.getItem("agent_history");
    return raw ? JSON.parse(raw) : [];
  }

  // 把当前消息写入 localStorage：每条截断到 2000 字、只保留最近 40 条，防止超量
  function saveHistory() {
    const msgs = messages.value
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 2000),
      }))
      .slice(-40);
    localStorage.setItem("agent_history", JSON.stringify(msgs));
  }

  // 发送一条用户消息，流式接收 AI 回复并逐字填充到消息列表
  async function send(userText) {
    if (!userText.trim() || isStreaming.value) return;
    messages.value.push({ role: "user", content: userText });
    isStreaming.value = true;
    currentContent.value = "";
    messages.value.push({ role: "assistant", content: "" });
    const idx = messages.value.length - 1;
    abortController = new AbortController();

    try {
      const payload = messages.value
        .filter((m) => !m.content.startsWith("[error]")) // 过滤掉之前出现的错误消息，避免污染上下文
        .slice(0, -1) // 去掉刚 push 的那条空 AI 消息(它是占位，还没内容)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      const stream = await chatStream(payload, abortController.signal);
      // 这一行做三件事，目的是得到一个"能逐块读字符串"的读取器：
      //   1) stream       —— response.body 是 ReadableStream，吐出来的是原始字节(Uint8Array)
      //   2) .pipeThrough(new TextDecoderStream()) —— 在管道中间插一个解码器，把字节按 UTF-8 转成文字，接回去继续往后传
      //   3) .getReader() —— 给这个"文字流"装一个读取句柄，之后就能反复调 reader.read() 一块块读出来
      // 结果：reader.read() 拿到的 value 就是字符串片段(如 "data: {...}")，可直接拼进 buffer 解析 SSE
      const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

      // 下面这段是在手动解析 SSE(Server-Sent Events)流：
      // 后端 stream:true 时按 SSE 协议分块返回，每块形如 "data: {json}\n\n"
      // 循环逐块读到字节 → 拼进 buffer → 按 \n 切行 → 只处理以 "data: " 开头的行
      // buffer 保留最后一行(可能是被截断的半行 SSE)，等下一块拼完整后再解析
      // data: {"choices":[{"delta":{"content":"你"}}]}
      // data: {"choices":[{"delta":{"content":"好"}}]}
      // data: [DONE];
      let buffer = "";
      while (true) {
        // reader.read() 每次读取一个数据块（字符串片段），done=true 表示流已读完
        const { done, value } = await reader.read();
        if (done) break;
        // 将本次收到的片段追加到 buffer
        buffer += value;
        // 按换行符拆分：前面都是完整行，最后一行可能残缺（没有 \n 结尾）
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 最后一行可能是不完整的，留到下一轮
        // 遍历所有完整行
        for (const line of lines) {
          // 只处理 "data: " 开头的行，跳过其他（如 event:、空行等）
          // data: [DONE] 是流结束标记，跳过
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            // 去掉 "data: " 前缀（6个字符），解析 JSON
            const json = JSON.parse(line.slice(6));
            // 每一行以 data:  开头，内容是 JSON，delta.content 是本次新增的几个字。我们要一行一行读完、解析出来、拼到 AI 回复里。
            // 取增量文本，追加到 AI 消息
            const delta = json.choices?.[0]?.delta?.content || "";
            currentContent.value += delta;
            messages.value[idx].content = currentContent.value;
          } catch (e) {}
        }
      }
    } catch (e) {
      // 用户点「停止」抛出的 AbortError 不记录为错误；其他异常把错误信息写进这条 AI 消息
      if (e.name !== "AbortError") {
        messages.value[idx].content =
          "[error] " + (e.message || "request failed");
      }
    } finally {
      // 无论成功/失败/中止，都结束流式状态并持久化聊天记录
      isStreaming.value = false;
      abortController = null;
      saveHistory();
    }
  }

  // 停止当前流式请求(用户点「停止」按钮)
  function stop() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  }

  // 清除全部聊天记录(界面重置为欢迎语 + 删除 localStorage 存档)
  function clearHistory() {
    messages.value = [WELCOME_MESSAGE];
    localStorage.removeItem("agent_history");
  }

  // 从 localStorage 恢复聊天记录；没有存档则显示欢迎语
  function loadHistory() {
    const msgs = getHistory();
    if (msgs.length) {
      messages.value = msgs;
    } else {
      ensureWelcome();
    }
  }

  // 将消息列表强制重置为欢迎语(不清 localStorage，供外部按需调用)
  function replaceWithWelcome() {
    messages.value = [WELCOME_MESSAGE];
  }

  return {
    messages,
    isStreaming,
    currentContent,
    send,
    stop,
    clearHistory,
    loadHistory,
    ensureWelcome,
    replaceWithWelcome,
  };
}
