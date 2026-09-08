import request from "@/utils/request";

export function uploadInit(data, signal = undefined) {
  // name: file.name,
  return request.post("/bigFileUpload/bigFile/uploadInit", data, {
    signal,
  });
}
export function uploadComplete(data, signal = undefined) {
  return request.post("/bigFileUpload/bigFile/uploadComplete", data, {
    signal,
  });
}
export function uploadPart(data, signal, onUploadProgress) {
  return request.post("/bigFileUpload/bigFile/uploadPart", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal,
    onUploadProgress,
  });
}
export function uploadSearch(data, signal = undefined) {
  return request.post("/bigFileUpload/bigFile/uploadSearch", data, {
    signal,
  });
}
