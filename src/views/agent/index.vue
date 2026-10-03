<template>
  <div class="agent-chat">
    <div class="agent-chat__messages" ref="msgBox">
      <div v-if="!messages.length" class="agent-chat__empty">
        <div class="empty-card">
          <el-avatar :size="52" class="empty-avatar">AI</el-avatar>
          <div class="empty-title">有什么我能帮你的吗？</div>
          <div class="empty-sub">告诉我～ 你可以直接问问题，或发送一段内容让我帮你处理</div>
        </div>
      </div>
      <div
        v-for="(m, i) in messages"
        :key="i"
        v-show="m.role === 'user' || m.content"
        class="msg-row"
        :class="'msg-' + m.role"
      >
        <el-avatar
          :size="36"
          class="msg-avatar"
          :class="m.role === 'user' ? 'avatar-user' : 'avatar-ai'"
        >
          {{ m.role === "user" ? "U" : "AI" }}
        </el-avatar>
        <div class="msg-bubble" v-html="renderContent(m)"></div>
      </div>
      <div v-if="isStreaming" class="typing-hint">
        <span class="typing-dots"><span></span><span></span><span></span></span>
      </div>
    </div>
    <div class="agent-chat__input">
      <el-input
        v-model="inputText"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        placeholder="发消息或按 Enter 发送..."
        :disabled="isStreaming"
        @keydown.enter.exact.prevent="handleSend"
      />
      <div class="input-actions">
        <el-button
          v-if="!isStreaming"
          type="primary"
          :disabled="!inputText.trim()"
          @click="handleSend"
        >
          发送
        </el-button>
        <el-button v-else type="danger" @click="stop">停止</el-button>
        <el-button @click="clearHistory">清除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from "vue";
import { marked } from "marked";
import hljs from "highlight.js";
import { useChat } from "./composables/useChat";

const {
  messages,
  isStreaming,
  send,
  stop,
  clearHistory,
  loadHistory,
  ensureWelcome,
} = useChat();

const inputText = ref("");
const msgBox = ref(null);

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function escapeAttr(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function highlightCode(code, lang) {
  const safe = code.replace(/\n$/, "");
  const language = lang && hljs.getLanguage(lang) ? lang : "";
  return language
    ? hljs.highlight(safe, { language }).value
    : hljs.highlightAuto(safe).value;
}

function codeBlockHtml(code, lang) {
  const language = (lang || "").trim() || "text";
  const highlighted = highlightCode(code, language);
  const plainCode = code.replace(/\n$/, "");
  const langLabel = language === "text" ? "txt" : language;

  return (
    '<div class="code-block">' +
    '<div class="code-header">' +
    '<button class="code-toggle" type="button" data-codeblock-toggle>' +
    "<span>" +
    escapeHtml(langLabel) +
    "</span>" +
    '<svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true">' +
    '<path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.6" fill="none"/>' +
    "</svg>" +
    "</button>" +
    '<button class="code-copy" type="button" data-codeblock-copy="' +
    escapeAttr(plainCode) +
    '" title="复制代码">' +
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" fill="none" stroke-width="1.2"/>' +
    '<path d="M3 10.5V3.5A1.5 1.5 0 0 1 4.5 2h7" stroke="currentColor" fill="none" stroke-width="1.2"/>' +
    "</svg>" +
    "</button>" +
    "</div>" +
    '<div class="code-body">' +
    '<pre><code class="hljs language-' +
    escapeHtml(language) +
    '">' +
    highlighted +
    "</code></pre>" +
    "</div>" +
    "</div>"
  );
}

function renderContent(m) {
  if (m.role === "user") return escapeHtml(m.content);

  let html = marked.parse(m.content) || "";

  html = html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    function (match, lang, codeHtml) {
      const rawCode = codeHtml.replace(/<[^>]*>/g, "");
      return codeBlockHtml(rawCode, lang);
    },
  );

  html = html.replace(
    /<pre><code>([\s\S]*?)<\/code><\/pre>/g,
    function (match, codeHtml) {
      const rawCode = codeHtml.replace(/<[^>]*>/g, "");
      return codeBlockHtml(rawCode, "text");
    },
  );

  return html;
}

function initCodeBlocks() {
  const msgBoxEl = msgBox.value;
  if (!msgBoxEl) return;

  msgBoxEl.querySelectorAll("[data-codeblock-toggle]").forEach(function (btn) {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      const block = btn.closest(".code-block");
      if (block) block.classList.toggle("collapsed");
    });
  });

  msgBoxEl.querySelectorAll("[data-codeblock-copy]").forEach(function (btn) {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-codeblock-copy") || "";
      navigator.clipboard.writeText(code);
      const original = btn.innerHTML;
      btn.innerHTML =
        '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2.5 8.5l4 4 7-7" stroke="#67c23a" stroke-width="2" fill="none"/></svg>';
      setTimeout(function () {
        btn.innerHTML = original;
      }, 2000);
    });
  });
}

async function handleSend() {
  const text = inputText.value;
  if (!text.trim() || isStreaming.value) return;
  inputText.value = "";
  await send(text);
  await nextTick();
  initCodeBlocks();
  scrollToBottom();
}

watch(
  function () {
    return messages.value.length;
  },
  async function () {
    await nextTick();
    initCodeBlocks();
    scrollToBottom();
  },
);

watch(
  messages,
  async function () {
    await nextTick();
    scrollToBottom();
  },
  { deep: true },
);

function scrollToBottom() {
  if (msgBox.value) {
    msgBox.value.scrollTop = msgBox.value.scrollHeight;
  }
}

onMounted(function () {
  loadHistory();
  ensureWelcome();
  nextTick(function () {
    initCodeBlocks();
  });
});
</script>

<style scoped lang="scss">
.agent-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  background: #f7f8fa;
  border-radius: 12px;
  overflow: hidden;
}

.agent-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .msg-avatar {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .avatar-user {
    background: #409eff;
    color: #fff;
  }

  .avatar-ai {
    background: #67c23a;
    color: #fff;
  }
}

.msg-row.msg-user {
  flex-direction: row-reverse;
  .msg-bubble {
    background: #409eff;
    color: #fff;
    text-align: left;
    border-bottom-right-radius: 4px;
  }
}

.msg-row.msg-assistant {
  .msg-bubble {
    flex: 1;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}

.msg-bubble {
  min-width: 60px;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.7;
  word-break: break-word;
  font-size: 14px;

  :deep(p) {
    margin: 0 0 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: 700;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 14px 0 8px;
    line-height: 1.3;
  }
  :deep(h1) {
    font-size: 1.3em;
  }
  :deep(h2) {
    font-size: 1.15em;
  }
  :deep(h3) {
    font-size: 1.05em;
  }

  :deep(ul),
  :deep(ol) {
    margin: 6px 0;
    padding-left: 20px;
    li {
      margin: 3px 0;
    }
  }

  :deep(blockquote) {
    margin: 8px 0;
    padding: 6px 12px;
    border-left: 3px solid #d0d0d0;
    color: #666;
    background: #f9f9f9;
    border-radius: 4px;
  }

  :deep(code) {
    background: rgba(0, 0, 0, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: "Fira Code", Consolas, monospace;
  }

  :deep(.code-block) {
    margin: 10px 0;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #f6f8fa;
    overflow: hidden;
  }

  :deep(.code-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #eef1f5;
    border-bottom: 1px solid #e8e8e8;
  }

  :deep(.code-toggle) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: "Fira Code", Consolas, monospace;
    font-size: 12px;
    font-weight: 700;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
      transition: transform 0.18s ease;
    }
  }

  :deep(.code-block.collapsed .code-toggle svg) {
    transform: rotate(180deg);
  }

  :deep(.code-copy) {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #333;
    }
  }

  :deep(.code-body) {
    overflow: hidden;
    max-height: 4000px;
    transition: max-height 0.22s ease;
  }

  :deep(.code-block.collapsed .code-body) {
    max-height: 0;
  }

  :deep(.code-body pre) {
    margin: 0;
    padding: 12px 14px;
    background: #f6f8fa;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.6;
  }

  :deep(.code-body code.hljs) {
    background: transparent;
    padding: 0;
    font-family: "Fira Code", "JetBrains Mono", Consolas, monospace;
    color: #24292e;
    display: block;
    min-width: 100%;

    .hljs-keyword,
    .hljs-selector-class,
    .hljs-attr {
      color: #d73a49;
    }

    .hljs-string {
      color: #032f62;
    }

    .hljs-comment {
      color: #6a737d;
    }

    .hljs-number {
      color: #005cc5;
    }
  }

  :deep(table) {
    border-collapse: collapse;
    margin: 8px 0;
    width: 100%;
    th,
    td {
      border: 1px solid #ddd;
      padding: 6px 10px;
      font-size: 13px;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
  }
}

.typing-hint {
  margin-left: 48px;
  .typing-dots {
    display: inline-flex;
    gap: 4px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    border-bottom-left-radius: 4px;
    span {
      width: 6px;
      height: 6px;
      background: #999;
      border-radius: 50%;
      display: inline-block;
      animation: dotPulse 1.2s infinite ease-in-out;
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  40% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.agent-chat__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;

  .empty-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 16px;
    padding: 40px 56px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    text-align: center;
    max-width: 480px;

    .empty-avatar {
      background: #67c23a;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
    }

    .empty-title {
      font-size: 20px;
      font-weight: 700;
      color: #303133;
    }

    .empty-sub {
      font-size: 14px;
      color: #909399;
      line-height: 1.6;
    }
  }
}

.agent-chat__input {
  padding: 14px 20px;
  background: #fff;
  border-top: 1px solid #e8e8e8;

  :deep(.el-textarea__inner) {
    border: 1px solid #dcdfe6;
    border-radius: 10px;
    box-shadow: none;
    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
    }
  }

  .input-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    justify-content: flex-end;
  }
}
</style>
