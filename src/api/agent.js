// AI 聊天接口封装：调用 agnes-3.0-flash 模型
// 走 vite 代理把 /agnes-api 转发到真实后端，避免浏览器跨域（CORS）
const AGNES_BASE_URL = "/agnes-api";
// const AGNES_API_KEY = "sk-H6eiUwwkHjUrbKzS5mzrs0XnwMfdbjYXEUw5O2IcV7PZln16";

// 流式聊天：开启 stream，返回 ReadableStream（response.body）供前端逐块读取、逐字渲染
// messages: [{role, content}]；signal: 可选的 AbortSignal，用于「停止」按钮中断请求
export async function chatStream(messages, signal) {
  const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${AGNES_API_KEY}`, // 如需鉴权取消注释
    },
    body: JSON.stringify({
      model: "agnes-3.0-flash", // 指定模型
      messages, // 完整对话历史
      stream: true, // 关键：开启流式，后端会分块返回 SSE
    }),
    signal, // 传入 AbortSignal，用户点「停止」时据此中止 fetch
  });

  // 非 2xx 时读取错误文本并抛出，调用方 catch 后写进消息
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  // 返回响应体（ReadableStream），由调用方逐块读取解析 SSE
  return response.body;
}

// 非流式聊天：一次性等模型跑完，直接返回 JSON（含完整回复）。适合不需要逐字显示的场景
export async function chatNonStream(messages) {
  const response = await fetch(`${AGNES_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model: "agnes-3.0-flash",
      messages,
      stream: false, // 关闭流式
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  // 等整个请求结束后解析 JSON，取 result.choices[0].message.content 即为完整回复
  return response.json();
}
