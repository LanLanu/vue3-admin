<template>
  <div class="chatroom">
    <div class="chatroom__header">
      <span class="chatroom__title">聊天室</span>
      <div class="chatroom__meta">
        <span class="conn" :class="`conn--${connStatus}`">
          <i class="conn__dot"></i>{{ connText }}
        </span>
        <button
          class="btn-clear"
          type="button"
          title="清理聊天记录"
          :disabled="!messages.length"
          @click="showClearDialog = true"
        >
          清理
        </button>
        <button
          class="btn-sync"
          type="button"
          title="同步远程聊天记录"
          :disabled="syncing"
          @click="syncRemoteHistory"
        >
          {{ syncing ? "同步中..." : "同步" }}
        </button>
        <span class="chatroom__sub">我：{{ myName }}</span>
      </div>
    </div>

    <div class="chatroom__body" ref="bodyRef">
      <div v-if="loadingHistory && !messages.length" class="chat-empty">
        正在加载聊天记录...
      </div>
      <div v-else-if="!loadingHistory && !messages.length" class="chat-empty">
        暂无消息，发送第一条吧
      </div>

      <div v-if="messages.length" class="load-more">
        <button
          v-if="hasMore"
          class="load-more__btn"
          :disabled="loadingMore"
          @click="loadOlder"
        >
          {{ loadingMore ? "加载中..." : "加载更早的消息" }}
        </button>
        <span v-else class="load-more__end">我是有顶线的啦~</span>
      </div>

      <template v-for="msg in messages" :key="msg._key">
        <div v-if="msg.type === 'time'" class="chat-time">{{ msg.text }}</div>
        <div v-else-if="msg.type === 'system'" class="chat-system">
          {{ msg.text }}
        </div>
        <div v-else class="msg" :class="msg.self ? 'msg--self' : 'msg--other'">
          <img
            v-if="!msg.self"
            class="msg__avatar"
            :src="msg.fromHeadImg || avatarFallback"
            :alt="msg.fromName || '对方'"
          />
          <div class="msg__bubble">
            <div v-if="!msg.self && msg.fromName" class="msg__name">
              {{ msg.fromName }}
            </div>
            <div class="msg__text">{{ msg.text }}</div>
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
      <textarea
        class="input-text"
        v-model="draft"
        placeholder="输入消息，Enter 发送"
        rows="6"
        @keydown.enter.exact.prevent="sendMessage"
      ></textarea>
      <div class="input-footer">
        <span class="input-tip">记录已同步到后端数据库</span>
        <button
          class="send-btn"
          :disabled="!draft.trim() || connStatus !== 'connected'"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>
    <!-- 清理聊天记录弹窗 -->
    <el-dialog
      v-model="showClearDialog"
      title="清理聊天记录"
      width="720px"
      :close-on-click-modal="false"
      class="clear-dialog"
      destroy-on-close
      :close-on-press-escape="false"
    >
      <p class="clear-tip">请选择清理范围：</p>
      <div class="clear-scope">
        <el-radio v-model="clearScope" label="local"
          >本地历史（仅当前浏览器）</el-radio
        >
        <el-radio v-model="clearScope" label="db"
          >数据库（服务端所有用户）</el-radio
        >
        <el-radio v-model="clearScope" label="all"
          >全部清理（本地 + 数据库）</el-radio
        >
      </div>
      <template #footer>
        <el-button @click="showClearDialog = false">取消</el-button>
        <el-button type="primary" :loading="clearing" @click="doClear"
          >确认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  nextTick,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
} from "vue";
import { useUserStore } from "@/store/modules/user";
import { io } from "socket.io-client";
import { getHistory, clearRoom } from "@/api/chatroom";

// ================= 配置 =================
const ROOM_ID = "default";
const PAGE_SIZE = 50;
// 时间条阈值：两条消息间隔超过 5 分钟才再显示一条时间
const TIME_GAP = 5 * 60 * 1000;

// ================= 用户信息（pinia） =================
const userStore = useUserStore();
const avatarFallback = "https://picsum.photos/seed/chatroom-me/64/64";
const selfAvatar = computed(() => userStore.info?.headImg || avatarFallback);
const myName = computed(() => userStore.info?.nickName || "我");
const myId = computed(() => userStore.info?.id);

// ================= 状态 =================
const socket = ref(null);
const connStatus = ref("connecting");
const messages = ref([]);
// ================= 清理弹窗 =================
const showClearDialog = ref(false);
const clearScope = ref("all"); // local | db | all
const clearing = ref(false);
// ================= 同步远程记录 =================
const syncing = ref(false);
const bodyRef = ref(null);
const draft = ref("");

// 历史分页
const loadingHistory = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const nextBeforeId = ref(null);

const connText = computed(() => {
  const map = {
    connecting: "连接中...",
    connected: "已连接",
    reconnecting: "重连中...",
    disconnected: "已断开",
  };
  return map[connStatus.value] || "未连接";
});

// ================= 数据转换 =================
/** 后端行 → 前端渲染结构（msg_type: 1 文本 / 2 系统） */
function toViewRow(row) {
  const at = new Date(row.created_at).getTime();
  if (row.msg_type === 2) {
    // 进入聊天室系统消息：跳过"自己进入"的历史记录，只保留其他用户进入的记录
    if (row.sender_id && String(row.sender_id) === String(myId.value)) {
      return null;
    }
    let name = "有人";
    try {
      const obj = JSON.parse(row.content || "{}");
      name = obj.name || row.sender_name || name;
    } catch (e) {
      name = row.sender_name || name;
    }
    return {
      type: "system",
      text: `${name}进入了聊天室`,
      at,
      uid: String(row.sender_id),
      _key: `s-${row.id}`,
    };
  }
  const isSelf = row.sender_id && String(row.sender_id) === String(myId.value);
  return {
    type: "msg",
    self: isSelf,
    text: row.content,
    fromName: isSelf ? myName.value : row.sender_name,
    fromHeadImg: isSelf ? selfAvatar.value : row.avatar || undefined,
    at,
    uid: String(row.sender_id),
    _key: `m-${row.id}`,
  };
}

/**
 * 渲染层去重：同一用户（uid）的"进入聊天室"系统消息只保留最新一条。
 * 历史 DB 里可能因旧数据存了多条重复进入记录，这里统一折叠掉，
 * 每个用户（含自己）只显示最新的一次进入。普通聊天消息不受影响。
 */
function dedupSystemRows(viewRows) {
  const keepIdxByUid = new Map();
  viewRows.forEach((row, i) => {
    if (row.type === "system" && row.uid) keepIdxByUid.set(row.uid, i);
  });
  const keepSet = new Set(keepIdxByUid.values());
  return viewRows.filter((row, i) => {
    if (row.type !== "system") return true;
    return keepSet.has(i);
  });
}

/** 时间条文案：同一天 HH:mm，跨天 MM-DD HH:mm */
function formatViewTime(at) {
  const d = new Date(at);
  const now = new Date();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return hm;
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${hm}`;
}

/**
 * 把渲染行按"间隔 > 5 分钟才插时间条"铺进 messages
 * @param viewRows 按时间正序的行（msg/system）
 * @param insertAt 0=追加到末尾（首次加载），-1=插到最前（加载更早）
 */
function mergeRows(viewRows, insertAt = 0) {
  const arr = messages.value;
  if (insertAt === 0) {
    // 追加到末尾：逐条判断跟"上一条已有真实消息"的 gap
    viewRows.forEach((row) => {
      const prev = findLastMsgRow(arr);
      if (!prev || row.at - prev.at > TIME_GAP) {
        arr.push({
          type: "time",
          text: formatViewTime(row.at),
          at: row.at,
          _key: `t-${row.at}`,
        });
      }
      arr.push(row);
    });
  } else {
    // 插到最前（加载更早）：这些行比现有都旧，gap 从"现有第一条"往前算
    const oldestExisting = findFirstMsgRow(arr);
    const rows = [...viewRows].reverse(); // 逆序插，最后得到正序
    for (let k = rows.length - 1; k >= 0; k--) {
      const row = rows[k];
      // 判断该条跟"比它更新的上一条"的 gap
      const nextNewer = k === rows.length - 1 ? oldestExisting : rows[k + 1];
      if (
        !nextNewer ||
        (row.at < nextNewer.at && nextNewer.at - row.at > TIME_GAP)
      ) {
        arr.unshift({
          type: "time",
          text: formatViewTime(row.at),
          at: row.at,
          _key: `t-${row.at}`,
        });
      }
      arr.unshift(row);
    }
  }
}

/** 找列表里第一条"真实消息/系统"（跳过 time 行），返回它或 null */
function findFirstMsgRow(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].type !== "time") return arr[i];
  }
  return null;
}

// ================= 历史消息（后端持久化） =================
/** 首次进房：从数据库拉最近 PAGE_SIZE 条 */
async function loadInitialHistory() {
  loadingHistory.value = true;
  try {
    const {
      messages: rows,
      hasMore: more,
      nextBeforeId: cursor,
    } = await getHistory(ROOM_ID, PAGE_SIZE);
    nextBeforeId.value = cursor;
    hasMore.value = more;
    mergeRows(dedupSystemRows(rows.map(toViewRow).filter(Boolean)), 0);
  } catch (e) {
    console.warn("[chatroom] 拉取历史失败，回退本地缓存", e);
    messages.value = loadFromStorage();
  } finally {
    loadingHistory.value = false;
    scrollToBottom();
  }
}

/** 上滑加载更早消息（游标分页） */
async function loadOlder() {
  if (!hasMore.value || loadingMore.value || !nextBeforeId.value) return;
  loadingMore.value = true;
  try {
    const el = bodyRef.value;
    const prevHeight = el ? el.scrollHeight : 0;
    const prevTop = el ? el.scrollTop : 0;

    const {
      messages: rows,
      hasMore: more,
      nextBeforeId: cursor,
    } = await getHistory(ROOM_ID, PAGE_SIZE, nextBeforeId.value);
    nextBeforeId.value = cursor;
    hasMore.value = more;
    // 加载更早时同样按用户去重（跨页也可能出现同用户多条进入）
    mergeRows(dedupSystemRows(rows.map(toViewRow).filter(Boolean)), 0);

    await nextTick();
    if (el) el.scrollTop = el.scrollHeight - prevHeight + prevTop;
  } catch (e) {
    console.warn("[chatroom] 加载更早消息失败", e);
  } finally {
    loadingMore.value = false;
  }
}

// ================= 本地离线兜底（后端不可用时） =================
function storageKey() {
  const id = userStore.info?.id;
  return id ? `chatroom-history-${id}` : "chatroom-history-anon";
}

/** 读 localStorage 缓存（仅后端拉取失败时兜底展示） */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/** 防抖写本地缓存（后端仍是权威数据源，本地只做离线兜底） */
let saveTimer = null;
function cacheMessage() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const slice = messages.value.slice(-200);
      localStorage.setItem(storageKey(), JSON.stringify(slice));
    } catch (e) {
      console.warn("[chatroom] 本地缓存失败", e);
    }
  }, 300);
}

// ================= 清理（按用户选择：本地 / 数据库 / 全部） =================
async function doClear() {
  clearing.value = true;
  try {
    // 数据库清理（同时影响所有在线用户的历史记录）
    if (clearScope.value === "db" || clearScope.value === "all") {
      await clearRoom(ROOM_ID);
    }
    // 本地清理（当前浏览器 localStorage）
    if (clearScope.value === "local" || clearScope.value === "all") {
      localStorage.removeItem(storageKey());
    }
    // 当前会话内立即重置
    messages.value = [];
    hasMore.value = false;
    nextBeforeId.value = null;
    showClearDialog.value = false;
    ElMessage.success("清理完成");
  } catch (e) {
    console.warn("[chatroom] 清理失败", e);
    ElMessage.error("清理失败：" + (e.message || "未知错误"));
  } finally {
    clearing.value = false;
  }
}

// ================= 手动同步远程记录 =================
/**
 * 拉取后端最新 50 条历史，合并到当前消息列表。
 * 已有消息不覆盖（按 _key 去重），新增的追加到最前面。
 * 用户主动点击才触发，避免"删了本地又自动冒出来"的体验问题。
 */
async function syncRemoteHistory() {
  if (syncing.value) return;
  syncing.value = true;
  try {
    const {
      messages: rows,
      hasMore: more,
      nextBeforeId: cursor,
    } = await getHistory(ROOM_ID, PAGE_SIZE);
    // 后端行 → 渲染结构 → 过滤自己进入的系统行 → 按 uid 去重
    const viewRows = dedupSystemRows(rows.map(toViewRow).filter(Boolean));
    if (viewRows.length) {
      // getHistory 返回降序（最新在前），mergeRows 需要正序遍历，反转
      mergeRows([...viewRows].reverse(), 0);
      nextBeforeId.value = cursor;
      hasMore.value = more;
    }
    ElMessage.success(viewRows.length ? "已同步最新记录" : "远程无新记录");
  } catch (e) {
    console.warn("[chatroom] 同步远程记录失败", e);
    ElMessage.error("同步失败，请检查网络连接");
  } finally {
    syncing.value = false;
  }
}

// ================= 实时消息（socket） =================
/** 滚动到底部 */
function scrollToBottom() {
  nextTick().then(() => {
    if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
  });
}

/** 追加一条实时消息（进/退房、聊天），按 5 分钟阈值决定是否插时间条 + 滚动 + 本地缓存 */
function pushMessage(msg) {
  const at = Date.now();

  // ---- 系统消息去重：同一 uid 只保留最新一条"进入"消息，旧的删掉 ----
  if (msg.type === "system" && msg.uid) {
    const oldIdx = messages.value.findIndex(
      (r) => r.type === "system" && r.uid === msg.uid,
    );
    if (oldIdx !== -1) {
      messages.value.splice(oldIdx, 1);
      if (oldIdx > 0 && messages.value[oldIdx - 1].type === "time") {
        messages.value.splice(oldIdx - 1, 1);
      }
    }
  }

  // 只看"上一条消息/系统"的时间戳，跟它比 gap
  const lastMsgRow = findLastMsgRow(messages.value);
  if (!lastMsgRow || at - lastMsgRow.at > TIME_GAP) {
    messages.value.push({
      type: "time",
      text: formatViewTime(at),
      at,
      _key: `t-${at}`,
    });
  }
  messages.value.push({ ...msg, at, _key: msg._key || `r-${at}` });
  cacheMessage();
  scrollToBottom();
}

/** 找到列表里最后一条"真实消息/系统"（跳过 time 行），返回它或 null */
function findLastMsgRow(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].type !== "time") return arr[i];
  }
  return null;
}

// ================= Socket 生命周期 =================
onMounted(async () => {
  // 1. 优先从本地缓存恢复（避免"删了本地又重新加载回来"的体验问题）
  //    本地有数据 → 直接用本地；本地没数据 → 显示空状态，等用户手动点"同步"拉远程
  const cached = loadFromStorage();
  if (cached.length) {
    messages.value = cached;
  }

  // 2. 建立 socket 实时连接
  socket.value = io(import.meta.env.VITE_SOCKET_URL);

  socket.value.on("connect", () => (connStatus.value = "connected"));
  socket.value.on("disconnect", () => (connStatus.value = "disconnected"));
  socket.value.on("reconnecting", () => (connStatus.value = "reconnecting"));
  socket.value.on("connect_error", () => (connStatus.value = "disconnected"));

  // 首次进入：告诉服务端"我来了"（后端 broadcast 给其他人 + echo 给自己，并落库）
  socket.value.emit("systemMessage", {
    id: myId.value,
    name: myName.value,
    avatar: selfAvatar.value,
  });

  // 服务端推送：系统消息（进/退房）
  // 只提醒"其他用户进入"；自己的进入提醒忽略（data.id 与我的 id 相同 => return）
  socket.value.on("systemMessage", (data) => {
    // 去重：忽略自己进入的提醒，只显示其他用户进入
    if (data.id != null && String(data.id) === String(myId.value)) return;
    const text = `${data.name || "有人"}进入了聊天室`;
    pushMessage({ type: "system", text, uid: String(data.id) });
  });

  // 服务端推送：聊天消息
  socket.value.on("sendMessage", (payload) => {
    const text = typeof payload === "string" ? payload : payload?.message;
    if (!text) return;
    const isSelf =
      typeof payload === "object" && String(payload.id) === String(myId.value);
    if (isSelf) return; // 自己的消息本地已上屏，忽略回显
    pushMessage({
      type: "msg",
      self: false,
      text,
      fromName: typeof payload === "object" ? payload.name : undefined,
      fromHeadImg: typeof payload === "object" ? payload.avatar : undefined,
    });
  });
});

onBeforeUnmount(() => {
  socket.value?.close();
});

// ================= 用户发送 =================
/** 本地乐观上屏 + 发给服务端（服务端负责广播 + 落库） */
function sendMessage() {
  const text = draft.value.trim();
  if (!text || connStatus.value !== "connected") return;

  pushMessage({
    type: "msg",
    self: true,
    text,
    fromName: myName.value,
    fromHeadImg: selfAvatar.value,
  });

  socket.value.emit("sendMessage", {
    id: myId.value,
    name: myName.value,
    avatar: selfAvatar.value,
    message: text,
  });

  draft.value = "";
}

// watch 保留用于未来扩展（当前实时消息走 pushMessage 内的 cacheMessage）
watch(
  () => connStatus.value,
  (s) => {
    if (s === "connected") cacheMessage();
  },
);
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

      .btn-clear {
        padding: 3px 10px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background: #fff;
        font-size: 12px;
        color: #606266;
        cursor: pointer;
        &:hover:not(:disabled) {
          border-color: #f56c6c;
          color: #f56c6c;
        }
        &:disabled {
          color: #c0c4cc;
          cursor: not-allowed;
        }
      }

      .btn-sync {
        margin-left: 6px;
        padding: 3px 10px;
        border: 1px solid #409eff;
        border-radius: 4px;
        background: #fff;
        font-size: 12px;
        color: #409eff;
        cursor: pointer;
        &:hover:not(:disabled) {
          background: #409eff;
          color: #fff;
        }
        &:disabled {
          color: #c0c4cc;
          border-color: #c0c4cc;
          cursor: not-allowed;
        }
      }

      // 清理弹窗（scoped 对 ElDialog portal 不生效，样式放到全局 style 块）

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

    .chat-empty {
      text-align: center;
      font-size: 13px;
      color: #909399;
      padding-top: 40px;
    }

    .load-more {
      text-align: center;
      margin-bottom: 12px;

      .load-more__btn {
        padding: 4px 14px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background: #fff;
        font-size: 12px;
        color: #409eff;
        cursor: pointer;
        &:hover:not(:disabled) {
          border-color: #409eff;
        }
        &:disabled {
          color: #c0c4cc;
          cursor: not-allowed;
        }
      }

      .load-more__end {
        font-size: 12px;
        color: #c0c4cc;
      }
    }

    .chat-time {
      text-align: center;
      font-size: 12px;
      color: #909399;
      margin: 12px 0;
    }

    .chat-system {
      text-align: center;
      font-size: 12px;
      color: #e6a23c;
      background: #fdf6ec;
      border: 1px solid #faecd8;
      border-radius: 4px;
      padding: 4px 12px;
      margin: 8px auto;
      max-width: 80%;
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
      .msg__name {
        font-size: 11px;
        color: #909399;
        margin-bottom: 2px;
      }

      .msg__bubble {
        max-width: 46%;
        padding: 8px 12px;
        border-radius: 4px;
        line-height: 1.5;
        word-break: break-word;
      }
    }
  }

  .chatroom__input {
    flex-shrink: 0;
    background: #fff;
    border-top: 1px solid #e5e5e5;
    padding: 8px 12px;

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

      .input-tip {
        font-size: 11px;
        color: #c0c4cc;
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

<!-- 全局样式：ElDialog 渲染到 body，scoped 无法命中，需要单独的 <style> 块 -->
<style lang="scss">
// .el-dialog.clear-dialog {
//   .el-dialog__body {
//     padding: 24px 20px 12px;
//   }

//   .clear-tip {
//     margin: 0 0 16px;
//     font-size: 14px;
//     color: #606266;
//     line-height: 1;
//   }

//   .clear-scope {
//     display: flex;
//     flex-direction: column;
//     gap: 14px;

//     .el-radio {
//       display: flex;
//       align-items: center;
//       height: auto;
//       margin-right: 0;
//       padding: 8px 12px;
//       border: 1px solid #dcdfe6;
//       border-radius: 4px;
//       cursor: pointer;
//       transition: all 0.2s;

//       &:hover {
//         border-color: #409eff;
//       }

//       &.is-checked {
//         border-color: #409eff;
//         background: #f0f7ff;
//       }
//     }
//   }

//   .el-dialog__footer {
//     padding: 12px 20px 20px;
//     text-align: right;
//   }
// }
</style>
