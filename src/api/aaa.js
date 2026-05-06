import request from "../utils/request.js";
export const getCaptcha = async () => {
  return await request.get("/admin/base/open/captcha");
};
export const login = async (params) => {
  return await request.post("admin/base/open/login", params);
};
