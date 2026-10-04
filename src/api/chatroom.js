/**
 * 聊天室后端 REST 接口封装
 *
 * 路径说明：
 * - 本项目的 axios 实例 baseURL 已固定为 VITE_API_BASEURL（dev=/api）
 * - 因此这里用 **相对路径 /chat/...**，最终 dev 下拼成 /api/chat/...，
 *   由 vite 代理 /api/chat -> :3000/chat
 * - 生产环境（无代理）时改为直连后端 host
 */
import request from "@/utils/request.js";

// 生产环境直连后端（dev 走 vite 代理，保持空）
const API_ROOT = import.meta.env.PROD
  ? "https://bluecp.xyz/chatroom"
  : "http://127.0.0.1:3000";
/**
 * 拉取某聊天室的历史消息（游标分页）
 * @param {string} roomId    聊天室 id，默认 default
 * @param {number} limit     每页条数，默认 50
 * @param {number|null} beforeId 分页游标：取 id < beforeId 的更早消息
 * @returns {Promise<{messages:Array, hasMore:boolean, nextBeforeId:number|null}>}
 */
export async function getHistory(
  roomId = "default",
  limit = 50,
  beforeId = null,
) {
  const params = { roomId, limit };
  if (beforeId) params.beforeId = beforeId;
  const res = await request.get(`${API_ROOT}/chat/messages`, { params });
  // request 拦截器在 code===1000 时返回响应体 { code, data, message }，真实载荷在 res.data
  const data = res?.data || {};
  return {
    messages: data.messages || [],
    hasMore: !!data.hasMore,
    nextBeforeId: data.nextBeforeId ?? null,
  };
}

/**
 * 清空某房间的历史记录
 * @param {string} roomId
 */
export async function clearRoom(roomId = "default") {
  const res = await request.delete(`${API_ROOT}/chat/room/${roomId}`);
  return res?.data || {};
}
