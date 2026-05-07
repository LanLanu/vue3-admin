import request from "../utils/request.js";
import store2 from "store2";
export const getCaptcha = async () => {
  return request.get("/admin/base/open/captcha");
};
export const login = async (data) => {
  return request.post("/admin/base/open/login", data);
};
export const getUserInfo = async () => {
  return request.get("/admin/base/comm/person", {
    headers: { Authorization: store2.get("token") },
  });
};
