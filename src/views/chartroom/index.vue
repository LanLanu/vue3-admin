<template>
  <div class="chatroom">
    <div class="chatroom__header">
      <span class="chatroom__title">聊天室</span>
      <div class="chatroom__meta">
        <span class="conn" :class="`conn--${connStatus}`">
          <i class="conn__dot"></i>{{ connText }}
        </span>
        <span class="chatroom__sub">在线 {{ onlineCount }}</span>
      </div>
    </div>

    <div class="chatroom__body" ref="bodyRef">
      <template v-for="(msg, index) in messages" :key="index">
        <div v-if="msg.type === 'time'" class="chat-time">{{ msg.text }}</div>
        <div v-else class="msg" :class="msg.self ? 'msg--self' : 'msg--other'">
          <img
            v-if="!msg.self"
            class="msg__avatar"
            :src="msg.fromHeadImg || otherAvatar"
            :alt="msg.fromName || '对方'"
          />
          <div class="msg__bubble">
            {{ msg.text }}
            <span v-if="msg.self && msg.unsent" class="msg__unsent"
              >未发送</span
            >
          </div>
          <img
            v-if="msg.self"
            class="msg__avatar"
            :src="selfAvatar"
            :alt="myName"
          />
        </div>
      </template>
    </div>

    <div class="chatroom__input">
      <div class="input-toolbar">
        <button class="tb-btn" type="button" title="表情">😀</button>
        <button class="tb-btn" type="button" title="文件">📦</button>
        <button class="tb-btn" type="button" title="图片">🖼️</button>
        <button class="tb-btn" type="button" title="截图">✂️</button>
        <button class="tb-btn" type="button" title="语音">🎤</button>
      </div>

      <textarea
        class="input-text"
        v-model="draft"
        placeholder="输入消息，Enter 发送，Shift + Enter 换行"
        rows="6"
        @keydown.enter.exact.prevent="send"
      ></textarea>

      <div class="input-footer">
        <button class="voice-btn" type="button" title="语音消息">🎙️</button>
        <button class="send-btn" :disabled="!draft.trim()" @click="send">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { io } from "socket.io-client";
// 当前用户信息（来自 pinia user 仓库）
const userStore = useUserStore();
// 无头像时的占位
const avatarFallback = "https://picsum.photos/seed/chatroom-me/64/64";
// 我的头像 / 昵称
const selfAvatar = computed(() => userStore.info?.headImg || avatarFallback);
const myName = computed(() => userStore.info?.nickName || "我");
// 对方（模拟静态）：真实场景由消息里的 from 解析
const otherAvatar = "https://picsum.photos/seed/chatroom-other/64/64";

// 静态初始数据：与参考截图一致的聊天记录（联网前回退展示）
const messages = ref([
  { type: "time", text: "00:12" },
  { type: "msg", self: false, text: "他们看人头" },
  { type: "msg", self: true, text: "[图片消息]" },
  { type: "time", text: "00:14" },
  { type: "msg", self: false, text: "下次你带我特种兵速通" },
  { type: "msg", self: true, text: "提前说包速通" },
  { type: "msg", self: true, text: "临时起意，啥都不准备的🙂" },
  { type: "msg", self: false, text: "跟他们去摸票" },
]);

// 连接 / 在线状态
const connStatus = ref();
const onlineCount = ref(0);
const myId = ref(null);

const draft = ref("");
const bodyRef = ref(null);

const connText = computed(() => {
  switch (myId.value) {
    default:
      return "未连接";
  }
});

function scrollToBottom() {
  return nextTick().then(() => {
    if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
  });
}

// 用服务端权威消息替换本地占位（去重）
function replaceLocalByServer(clientMsgId, serverMsg) {
  const idx = messages.value.findIndex((m) => m.id === clientMsgId);
  if (idx === -1) return;
  messages.value.splice(idx, 1, {
    type: "msg",
    self: true,
    text: serverMsg.text,
    id: serverMsg.id,
    from: serverMsg.from,
    fromName: serverMsg.fromName,
    fromHeadImg: serverMsg.fromHeadImg,
  });
}

function markUnsent(id) {
  const m = messages.value.find((x) => x.id === id);
  if (m) m.unsent = true;
}

// 本地即时上屏 + 同步服务端
async function send() {
  const text = draft.value.trim();
  if (!text) return;
  socket.value.emit("abcd", "您华东师范");
  //   const clientMsgId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  //   pushIncoming({ at: Date.now(), text, id: clientMsgId }, { self: true });
  //   draft.value = "";
  //   scrollToBottom();
}
const socket = ref(null);
// 接收他人 / 服务端消息
function handleIncoming(payload) {
  if (!payload) return;
  if (payload.clientMsgId && myId.value && payload.from === myId.value) return;
  pushIncoming(payload, { self: false });
  scrollToBottom();
}

onMounted(async () => {
  socket.value = io(import.meta.env.VITE_SOCKET_URL);
  //   监听服务端的事件
  socket.value.on("message", (payload) => {
    console.log(">>>>>服务端的信息", payload);
  });
  socket.value.on("abcd", (payload) => {
    console.log(">>>>>服务端的信息", payload);
  });
});

onBeforeUnmount(() => {});
</script>

<style scoped lang="scss">
.chatroom {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  font-size: 14px;
  color: #303133;

  .chatroom__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #e5e5e5;
    flex-shrink: 0;

    .chatroom__title {
      font-size: 16px;
      font-weight: 600;
    }

    .chatroom__meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .chatroom__sub {
        font-size: 12px;
        color: #909399;
      }

      .conn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #909399;

        .conn__dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c0c4cc;
        }

        &--connected {
          color: #67c23a;

          .conn__dot {
            background: #67c23a;
          }
        }

        &--reconnecting,
        &--connecting {
          color: #e6a23c;

          .conn__dot {
            background: #e6a23c;
          }
        }

        &--disconnected {
          color: #909399;

          .conn__dot {
            background: #c0c4cc;
          }
        }
      }
    }
  }

  .chatroom__body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .chat-time {
      text-align: center;
      font-size: 12px;
      color: #909399;
      margin: 12px 0;
    }

    .msg {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 14px;

      &--other {
        justify-content: flex-start;

        .msg__bubble {
          background: #fff;
          border: 1px solid #e5e5e5;
        }

        .msg__unsent {
          display: inline-block;
          margin-left: 6px;
          font-size: 11px;
          color: #f56c6c;
        }
      }

      &--self {
        justify-content: flex-end;

        .msg__bubble {
          background: #95ec69;
        }
      }

      .msg__avatar {
        width: 36px;
        height: 36px;
        border-radius: 4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .msg__bubble {
        max-width: 46%;
        padding: 8px 12px;
        border-radius: 4px;
        line-height: 1.5;
        word-break: break-word;
        position: relative;
      }
    }
  }

  .chatroom__input {
    flex-shrink: 0;
    background: #fff;
    border-top: 1px solid #e5e5e5;
    padding: 8px 12px;

    .input-toolbar {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;

      .tb-btn {
        width: 30px;
        height: 30px;
        border: none;
        background: transparent;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #ebebeb;
        }
      }
    }

    .input-text {
      width: 100%;
      resize: none;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      line-height: 1.6;
      min-height: 96px;
      font-family: inherit;
    }

    .input-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .voice-btn {
        width: 30px;
        height: 30px;
        border: none;
        background: transparent;
        border-radius: 50%;
        font-size: 15px;
        cursor: pointer;

        &:hover {
          background: #ebebeb;
        }
      }

      .send-btn {
        padding: 5px 18px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background: #fff;
        font-size: 13px;
        color: #606266;
        cursor: pointer;

        &:disabled {
          color: #c0c4cc;
          cursor: not-allowed;
        }

        &:not(:disabled):hover {
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
  }
}
</style>
