<template>
  <div class="meeting-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="meeting-info">
        <div class="meeting-meta">
          <h2>{{ meetingTitle }}</h2>
          <div class="status-indicator" :class="statusClass">
            {{ statusText }}
          </div>
        </div>
        <div class="meeting-meta">
          <span>{{ meetingDate }}</span>
          <span>会议ID: {{ meetingId }}</span>
        </div>
        <div class="meeting-meta">
          <span>会议参与人员：张三、李四、王五、赵六</span>
        </div>
        <div class="meeting-meta">
          <span>会议内容：设备采购与成套中心会议</span>
        </div>
      </div>
    </div>
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 右侧AI纪要区域 -->
      <div class="summary-section">
        <!-- 录音控制 -->
        <div class="recording-controls">
          <!-- 开始录音按钮 -->
          <div class="button-row">
            <button
              v-if="!isRecording && !isPaused"
              class="record-btn start"
              @click="startRecording"
              :disabled="isUploading"
            >
              🎤 开始录音
            </button>
          </div>
          <!-- 暂停录音按钮 -->
          <div class="button-row">
            <button
              v-if="isRecording"
              class="record-btn pause"
              @click="pauseRecording"
            >
              ⏸️ 暂停录音
            </button>
          </div>
          <!-- 恢复录音按钮 -->
          <div class="button-row">
            <button
              v-if="isPaused"
              class="record-btn resume"
              @click="resumeRecording"
            >
              🔄 恢复录音
            </button>
          </div>
          <!-- 停止录音按钮 -->
          <div class="button-row">
            <button
              v-if="isRecording || isPaused"
              class="record-btn stop"
              @click="stopRecording"
            >
              ⏹️ 停止录音
            </button>
          </div>
          <div class="recording-status">
            <span v-if="isRecording" class="recording-indicator"
              >● 录音中 {{ formatTime(recordTime) }}</span
            >
            <span v-if="isPaused" class="paused-indicator"
              >⏸️ 已暂停 {{ formatTime(recordTime) }}</span
            >
            <span v-if="lastUploadTime" class="upload-time"
              >最后上传: {{ lastUploadTime }}</span
            >
            <span v-if="audioChunks.length > 0" class="chunks-count"
              >已录制 {{ audioChunks.length }} 段</span
            >
          </div>
        </div>
        <!-- 上传进度 -->
        <div v-if="uploadProgress > 0" class="upload-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <span>{{ uploadProgress }}%</span>
        </div>
        <!-- 文件上传结果 -->
        <div v-if="uploadedFileInfo" class="file-info">
          <h4>📎 已上传文件</h4>
          <div class="file-details">
            <span>文件名: {{ uploadedFileInfo.name }}</span>
            <span>大小: {{ formatFileSize(uploadedFileInfo.size) }}</span>
            <span>文件ID: {{ uploadedFileInfo.id }}</span>
          </div>
        </div>
        <!-- 录音片段列表 -->
        <div v-if="audioChunks.length > 0" class="section">
          <h3>📁 录音片段</h3>
          <div class="chunks-list">
            <div
              v-for="(chunk, index) in audioChunks"
              :key="index"
              class="chunk-item"
              :class="{ 'current-chunk': chunk.isCurrent }"
            >
              <span class="chunk-index">片段 {{ index + 1 }}</span>
              <span class="chunk-duration">{{
                formatTime(chunk.duration)
              }}</span>
              <span class="chunk-time">{{ chunk.timestamp }}</span>
              <span v-if="chunk.isCurrent" class="current-label">当前</span>
            </div>
          </div>
        </div>
        <!-- 实时转写 -->
        <div class="section">
          <h3>🎙️ 实时转写</h3>
          <div class="streaming-content">
            <div
              v-for="(segment, index) in streamingSegments"
              :key="index"
              class="streaming-segment"
            >
              <span class="speaker">{{ segment.speaker }}:</span>
              <span class="streaming-text">{{ segment.text }}</span>
              <span v-if="segment.isStreaming" class="streaming-cursor">▊</span>
            </div>
            <div v-if="streamingSegments.length === 0" class="empty-state">
              录音转写内容将在这里显示...
            </div>
          </div>
        </div>
        <!-- 讨论要点 -->
        <div class="section">
          <h3>💬 讨论要点</h3>
          <div class="discussion-list">
            <div
              v-for="(point, index) in realTimeDiscussionPoints"
              :key="index"
              class="discussion-item"
              :class="{ 'new-point': point.isNew }"
            >
              <span class="point-time">{{ point.time }}</span>
              <span class="point-content">{{ point.content }}</span>
              <span v-if="point.tag" class="point-tag" :class="point.type">
                {{ point.tag.text }}
              </span>
            </div>
            <div
              v-if="realTimeDiscussionPoints.length === 0"
              class="empty-state"
            >
              暂无讨论要点，开始录音后将会实时生成...
            </div>
          </div>
        </div>
        <!-- Dify接口调用状态 -->
        <div v-if="showDifyStatus" class="dify-status">
          <div class="dify-loading">
            <div class="spinner"></div>
            <span>{{ difyStatusText }}</span>
          </div>
        </div>
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
    <!-- Toast提示 -->
    <div v-if="toastVisible" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
    <!-- 底部操作栏 -->
    <div class="footer">
      <div class="footer-buttons">
        <button class="action-btn secondary" @click="cancelMeeting">
          ❌ 取消会议
        </button>
        <button
          class="action-btn"
          @click="exportSummary"
          :disabled="!showSummary"
        >
          📄 会议纪要
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "MeetingRecorder",
  data() {
    return {
      // 所有录音信息
      allMessageList: [],
      // 会议基本信息
      meetingTitle: "设备采购与成套中心会议",
      meetingDate: "2025-11-11 14:30",
      meetingId: "AI-2025-1111",
      // 录音状态
      isRecording: false,
      isPaused: false,
      isUploading: false,
      isProcessingChunk: false,
      uploadProgress: 0,
      lastUploadTime: "",
      uploadInterval: null,
      recordTimer: null,
      recordTime: 0,
      audioChunks: [],
      currentChunkStartTime: 0,
      // 5+录音对象
      plusRecorder: null,
      // 文件上传信息
      uploadedFileInfo: null,
      uploadedFileId: null,
      // 会话管理
      conversationId: "",
      userId: "vue3-user-" + Date.now(),
      // 会议状态
      meetingStarted: false,
      showSummary: false,
      showDifyStatus: false,
      statusText: "准备开始",
      difyStatusText: "正在调用Dify接口生成会议纪要...",
      // 错误信息
      errorMessage: "",
      // 提示信息
      toastMessage: "",
      toastVisible: false,
      toastType: "info",
      // 会议内容数据
      overviewText: "",
      realTimeDiscussionPoints: [],
      actionItems: [],
      streamingSegments: [],
      // Dify配置
      difyConfig: {
        baseURL: "http://124.222.10.124",
        apiKey: "app-u40BdPs02w2iOMicT4iM3QRt",
        uploadInterval: 60000,
        fileUploadEndpoint: "/v1/files/upload",
        workflowRunEndpoint: "/v1/workflows/run",
      },
    };
  },

  computed: {
    statusClass() {
      return {
        "status-ready": this.statusText === "准备开始",
        "status-listening": this.statusText === "正在聆听...",
        "status-paused": this.statusText === "录音已暂停",
        "status-processing": this.statusText === "生成总结中...",
        "status-completed": this.statusText === "总结已完成",
      };
    },
  },

  mounted() {
    this.initRecorder();
    this.generateConversationId();
  },

  beforeUnmount() {
    this.cleanup();
  },

  methods: {
    // 时间格式转换
    ConvertDate(DateString, Sign) {
      let _Date = new Date(DateString);
      return (
        _Date.getFullYear() +
        Sign +
        (_Date.getMonth() + 1) +
        Sign +
        _Date.getDate() +
        " " +
        _Date.getHours() +
        ":" +
        _Date.getMinutes() +
        ":" +
        _Date.getSeconds()
      );
    },
    // 生成会话ID
    generateConversationId() {
      this.conversationId = this.generateUUIDv4();
      console.log("生成的会话ID:", this.conversationId);
    },
    // 生成UUID v4
    generateUUIDv4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );
    },
    // 开始录音计时器
    startRecordTimer() {
      this.stopRecordTimer();
      this.recordTimer = setInterval(() => {
        this.recordTime++;
      }, 1000);
    },
    // 停止录音计时器
    stopRecordTimer() {
      if (this.recordTimer) {
        clearInterval(this.recordTimer);
        this.recordTimer = null;
      }
    },

    // ====================== 初始化 5+ 录音 ======================
    initRecorder() {
      if (window.plus) {
        this.plusRecorder = plus.audio.getRecorder();
      } else {
        document.addEventListener("plusready", () => {
          this.plusRecorder = plus.audio.getRecorder();
        });
      }
    },

    // ====================== 修复：读取录音并生成 Blob ======================
    async getBlobFromPath(path) {
      return new Promise((resolve) => {
        plus.io.resolveLocalFileSystemURL(
          path,
          (entry) => {
            entry.file((file) => {
              let fileReader = new plus.io.FileReader();
              fileReader.onload = function (e) {
                let base64 = e.target.result.split(",")[1];
                let binary = atob(base64);
                let array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  array[i] = binary.charCodeAt(i);
                }
                let blob = new Blob([array], { type: "audio/mp3" });
                resolve(blob);
              };
              fileReader.readAsDataURL(file);
            });
          },
          () => {
            resolve(null);
          },
        );
      });
    },

    // 保存录音片段
    async saveAudioChunk(blob) {
      if (!blob) return;
      const chunkDuration = this.recordTime - this.currentChunkStartTime;
      this.audioChunks.forEach((chunk) => {
        chunk.isCurrent = false;
      });
      const blobUrl = URL.createObjectURL(blob);
      this.audioChunks.push({
        blob: blob,
        blobUrl: blobUrl,
        duration: chunkDuration,
        timestamp: new Date().toLocaleTimeString(),
        isCurrent: true,
      });
      if (!this.isPaused) {
        await this.uploadAudioToDify(blob, false);
      }
    },

    // ====================== 开始录音 ======================
    async startRecording() {
      try {
        if (!this.plusRecorder) {
          this.errorMessage = "录音设备未就绪";
          return;
        }

        this.isRecording = true;
        this.isPaused = false;
        this.statusText = "正在聆听...";
        this.errorMessage = "";
        this.currentChunkStartTime = this.recordTime;
        this.startRecordTimer();
        this.startPeriodicUpload();
        this.meetingStarted = true;

        this.plusRecorder.record(
          { format: "mp3", samplerate: 16000, channels: 1 },
          async (path) => {
            let blob = await this.getBlobFromPath(path);
            this.saveAudioChunk(blob);
          },
          (err) => {
            this.errorMessage = "录音失败：" + err.message;
          },
        );
      } catch (error) {
        this.errorMessage = `录音失败：${error.message}`;
        this.showToast("录音失败", "error");
      }
    },

    // ====================== 暂停 ======================
    pauseRecording() {
      if (this.plusRecorder && this.isRecording) {
        this.plusRecorder.pause();
        this.isRecording = false;
        this.isPaused = true;
        this.statusText = "录音已暂停";
        this.stopRecordTimer();
        this.clearUploadInterval();
        this.showToast("录音已暂停", "success");
      }
    },

    // ====================== 恢复 ======================
    resumeRecording() {
      if (this.plusRecorder && this.isPaused) {
        this.plusRecorder.resume();
        this.isRecording = true;
        this.isPaused = false;
        this.statusText = "正在聆听...";
        this.currentChunkStartTime = this.recordTime;
        this.startRecordTimer();
        this.startPeriodicUpload();
        this.showToast("录音已恢复", "success");
      }
    },

    // ====================== 停止 ======================
    async stopRecording() {
      try {
        if (this.plusRecorder) this.plusRecorder.stop();

        this.isRecording = false;
        this.isPaused = false;
        this.stopRecordTimer();
        this.clearUploadInterval();
        this.statusText = "生成总结中...";

        if (this.audioChunks.length > 0) {
          const last = this.audioChunks[this.audioChunks.length - 1];
          await this.uploadAudioToDify(last.blob, true);
        }

        this.showToast("录音已停止，生成总结中...", "success");
      } catch (e) {
        console.error(e);
      }
    },

    // ====================== 分片处理 ======================
    async processRecordingChunk() {
      if (this.isProcessingChunk) return;
      this.isProcessingChunk = true;

      try {
        if (this.plusRecorder && this.isRecording) {
          this.plusRecorder.stop();
          setTimeout(async () => {
            this.plusRecorder.record(
              { format: "mp3", samplerate: 16000, channels: 1 },
              async (path) => {
                let blob = await this.getBlobFromPath(path);
                this.saveAudioChunk(blob);
              },
            );
          }, 500);
        }
      } catch (error) {
        console.error("分片失败", error);
      } finally {
        this.isProcessingChunk = false;
      }
    },

    // ====================== 以下完全不变 ======================
    showToast(message, type = "info") {
      this.toastMessage = message;
      this.toastType = type;
      this.toastVisible = true;
      setTimeout(() => (this.toastVisible = false), 3000);
    },
    showModal(title, content) {
      return new Promise((resolve) => {
        const confirmed = window.confirm(`${title}\n\n${content}`);
        resolve({ confirm: confirmed, cancel: !confirmed });
      });
    },
    clearUploadInterval() {
      if (this.uploadInterval) {
        clearInterval(this.uploadInterval);
        this.uploadInterval = null;
      }
    },
    startPeriodicUpload() {
      this.clearUploadInterval();
      this.uploadInterval = setInterval(() => {
        if (this.isRecording && !this.isUploading && !this.isProcessingChunk) {
          this.processRecordingChunk();
        }
      }, this.difyConfig.uploadInterval);
    },
    async uploadAudioToDify(blob, isFinal = false) {
      if (!blob) {
        this.errorMessage = "录音文件无效";
        return;
      }
      this.isUploading = true;
      this.uploadProgress = 0;
      this.difyStatusText = isFinal
        ? "正在生成最终总结..."
        : "正在分析录音内容...";
      this.showDifyStatus = true;
      try {
        await this.callDifyFileUploadAPI(blob, isFinal);
      } catch (error) {
        console.error("上传失败:", error);
        this.errorMessage = `上传失败: ${error.message}`;
        this.isUploading = false;
        this.uploadProgress = 0;
        this.showDifyStatus = false;
      }
    },
    async callDifyFileUploadAPI(blob, isFinal = false) {
      try {
        const formData = new FormData();
        formData.append("file", blob, "recording.mp3");
        formData.append("user", this.userId);
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              this.uploadProgress = Math.round((e.loaded / e.total) * 100);
            }
          });
          xhr.addEventListener("load", async () => {
            if (xhr.status === 200 || xhr.status === 201) {
              try {
                const data = JSON.parse(xhr.responseText);
                this.uploadedFileInfo = data;
                this.uploadedFileId = data.id;
                await this.runWorkflow(data.id, isFinal);
                resolve(data);
              } catch (error) {
                reject(new Error(`解析失败: ${error.message}`));
              }
            } else {
              reject(new Error(`Dify上传错误: ${xhr.status}`));
            }
          });
          xhr.addEventListener("error", () => {
            reject(new Error("上传网络错误"));
          });
          xhr.open(
            "POST",
            `${this.difyConfig.baseURL}${this.difyConfig.fileUploadEndpoint}`,
          );
          xhr.setRequestHeader(
            "Authorization",
            `Bearer ${this.difyConfig.apiKey}`,
          );
          xhr.send(formData);
        });
      } catch (error) {
        throw error;
      }
    },
    async runWorkflow(fileId, isFinal = false) {
      try {
        const res = await this.callDifyWorkflowAPI(fileId, isFinal);
        this.processDifyResponse(res, isFinal);
      } catch (error) {
        this.errorMessage = `工作流失败: ${error.message}`;
        this.handleUploadComplete(isFinal);
      }
    },
    async callDifyWorkflowAPI(fileId, isFinal = false) {
      const requestData = {
        inputs: {
          voice: [
            {
              transfer_method: "local_file",
              upload_file_id: fileId,
              type: "audio",
            },
          ],
        },
        response_mode: "blocking",
        user: this.userId,
      };
      const response = await fetch(
        `${this.difyConfig.baseURL}${this.difyConfig.workflowRunEndpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.difyConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      );
      if (response.ok) return response.json();
      throw new Error(`API错误: ${response.status}`);
    },
    handleUploadComplete(isFinal) {
      this.lastUploadTime = this.ConvertDate(new Date(), "-");
      this.isUploading = false;
      this.uploadProgress = 0;
      if (!isFinal) this.showDifyStatus = false;
    },
    processDifyResponse(result, isFinal = false) {
      try {
        let text = "";
        let analysis = "";
        if (result.data && result.data.outputs) {
          analysis = result.data.outputs.text || "";
          text = result.data.outputs.origin_text || text;
        } else {
          throw new Error("响应格式错误");
        }
        this.allMessageList.push(result);
        this.updateStreamingText(text, isFinal);
        this.analyzeDiscussionPoints(text, analysis, isFinal);
        if (isFinal) this.generateFinalSummary();
        this.handleUploadComplete(isFinal);
        this.showToast(isFinal ? "分析完成" : "内容已更新", "success");
      } catch (error) {
        this.errorMessage = `处理失败: ${error.message}`;
        this.handleUploadComplete(isFinal);
      }
    },
    updateStreamingText(texts) {
      if (!texts) return;
      this.streamingSegments.push({
        speaker: "发言者",
        text: texts,
        isStreaming: false,
        timestamp: new Date().toLocaleString(),
      });
    },
    analyzeDiscussionPoints(text, analysis) {
      if (!text && !analysis) return;
      const content = analysis || text;
      const newPoint = {
        time: this.ConvertDate(new Date(), "-"),
        content:
          content.length > 100 ? content.substring(0, 100) + "..." : content,
        isNew: true,
      };
      this.realTimeDiscussionPoints.unshift(newPoint);
      setTimeout(() => {
        const idx = this.realTimeDiscussionPoints.findIndex(
          (p) => p === newPoint,
        );
        if (idx !== -1) this.realTimeDiscussionPoints[idx].isNew = false;
      }, 3000);
      if (this.realTimeDiscussionPoints.length > 15) {
        this.realTimeDiscussionPoints = this.realTimeDiscussionPoints.slice(
          0,
          15,
        );
      }
    },
    generateFinalSummary() {
      this.overviewText = this.realTimeDiscussionPoints
        .map((p) => p.content)
        .join("\n");
      this.actionItems = [
        {
          text: "评估会议内容在业务中的应用可行性",
          owner: "张三",
          deadline: "2025-11-25",
        },
        { text: "制定具体的实施计划", owner: "李四", deadline: "2025-11-20" },
        { text: "准备相关文档和材料", owner: "王五", deadline: "2025-11-22" },
      ];
      this.showSummary = true;
      this.showDifyStatus = false;
      this.statusText = "总结已完成";
      this.showToast("会议总结生成完成", "success");
    },
    formatFileSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },
    async exportSummary() {
      const content = `# ${this.meetingTitle}\n会议日期：${this.meetingDate}`;
      try {
        await navigator.clipboard.writeText(content);
        this.showToast("纪要已复制", "success");
      } catch (e) {
        this.showModal("会议纪要", content);
      }
    },
    async cancelMeeting() {
      const res = await this.showModal("提示", "确定取消会议？");
      if (res.confirm) {
        this.stopRecording();
        this.cleanup();
        this.showToast("会议已取消", "success");
      }
    },
    cleanup() {
      try {
        if (this.plusRecorder) this.plusRecorder.stop();
      } catch (e) {}
      this.audioChunks.forEach((chunk) => {
        if (chunk.blobUrl) URL.revokeObjectURL(chunk.blobUrl);
      });
      this.isRecording = false;
      this.isPaused = false;
      this.stopRecordTimer();
      this.clearUploadInterval();
      this.statusText = "准备开始";
    },
  },
});
</script>

<style scoped>
/* 样式完全不变 */
.recording-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  background: #f7f8fa;
  border-radius: 8px;
}
.button-row {
  display: flex;
  justify-content: center;
}
.button-row .record-btn {
  width: 100%;
  margin: 0;
}
.recording-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px;
  margin-top: 0px;
}
.footer {
  padding: 16px 20px;
  background: #ffffff;
  border-top: 1px solid #eaeaea;
}
.footer-buttons {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.footer-buttons .action-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.footer-buttons .action-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
.footer-buttons .action-btn:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.footer-buttons .action-btn.secondary {
  background: #ff4d4f;
  color: white;
}
.footer-buttons .action-btn:not(.secondary) {
  background: #1890ff;
  color: white;
}
.paused-indicator {
  color: #faad14;
  font-weight: bold;
}
.chunks-list {
  max-height: 200px;
  overflow-y: auto;
}
.chunk-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 4px 0;
  background: #f7f8fa;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.3s;
}
.chunk-item.current-chunk {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}
.chunk-index {
  font-weight: 600;
  color: #1890ff;
  min-width: 60px;
}
.chunk-duration {
  color: #52c41a;
  min-width: 50px;
  margin: 0 12px;
}
.chunk-time {
  color: #86909c;
  flex: 1;
}
.current-label {
  background: #1890ff;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}
.chunks-count {
  font-size: 12px;
  color: #86909c;
}
.status-paused {
  background: #fff7e6;
  color: #fa8c16;
}
.record-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.record-btn.start {
  background: #52c41a;
  color: white;
}
.record-btn.pause {
  background: #faad14;
  color: white;
}
.record-btn.resume {
  background: #52c41a;
  color: white;
}
.record-btn.stop {
  background: #ff4d4f;
  color: white;
}
.record-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.recording-indicator {
  color: #ff4d4f;
  font-weight: bold;
  animation: blink 1s infinite;
}
.upload-time {
  font-size: 12px;
  color: #86909c;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 16px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s;
}
.file-info {
  margin-bottom: 20px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
}
.file-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #1890ff;
}
.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #595959;
}
.section {
  margin-bottom: 24px;
}
.section h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.overview-text {
  font-size: 14px;
  line-height: 1.6;
  color: #4e5969;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}
.discussion-item,
.action-item {
  padding: 12px;
  margin: 8px 0;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}
.discussion-item.new-point {
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
}
.empty-state {
  padding: 20px;
  text-align: center;
  color: #86909c;
  font-style: italic;
  font-size: 15px;
}
.point-time {
  color: #86909c;
  font-size: 12px;
  margin-right: 8px;
}
.point-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
}
.point-tag.feature {
  background: #e6f7ff;
  color: #08979c;
}
.point-tag.application {
  background: #f6ffed;
  color: #52c41a;
}
.point-tag.benefit {
  background: #f9f0ff;
  color: #722ed1;
}
.point-tag.deployment {
  background: #fff1f0;
  color: #cf1322;
}
.point-tag.collaboration {
  background: #fff7e6;
  color: #fa8c16;
}
.point-tag.platform {
  background: #f0f0f0;
  color: #595959;
}
.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-meta {
  font-size: 12px;
  color: #86909c;
}
.streaming-segment {
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.6;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}
.speaker {
  font-weight: 600;
  color: #1890ff;
  margin-right: 6px;
}
.streaming-cursor {
  animation: blink 1s infinite;
  color: #1890ff;
}
.dify-status {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin-top: 20px;
}
.dify-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #1890ff;
}
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(24, 144, 255, 0.3);
  border-radius: 50%;
  border-top-color: #1890ff;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.error-message {
  padding: 12px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #a8071a;
  font-size: 14px;
  margin-top: 16px;
}
.meeting-container {
  padding-top: 50px;
  box-sizing: border-box;
  ::v-deep(.content) {
    padding-top: 4px;
  }
  ::v-deep(.computedStyle) {
    padding-top: 4px;
  }
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f5f5;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.meeting-info h2 {
  margin: 0;
  font-size: 18px;
  color: #1d2129;
}
.meeting-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #86909c;
  margin-top: 4px;
}
.status-indicator {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}
.status-ready {
  background: #f0f2f5;
  color: #595959;
}
.status-listening {
  background: #e8f4fd;
  color: #1890ff;
}
.status-processing {
  background: #fff7e6;
  color: #fa8c16;
}
.status-completed {
  background: #f6ffed;
  color: #52c41a;
}
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.summary-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #ffffff;
  overflow-y: auto;
}
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  animation: toastFadeIn 0.3s ease-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.toast.success {
  background: rgba(82, 196, 26, 0.9);
}
.toast.error {
  background: rgba(255, 77, 79, 0.9);
}
.toast.info {
  background: rgba(24, 144, 255, 0.9);
}
@keyframes toastFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>
