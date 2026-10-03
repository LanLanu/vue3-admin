<template>
  <div class="workplace">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <div class="greeting">
          <span class="greeting-text">{{ greeting }}</span>
          <span class="greeting-sub">，欢迎回来！</span>
        </div>
        <div class="date-text">今天是 {{ currentDate }}，祝工作顺利</div>
        <div class="quick-tags">
          <span
            v-for="tag in quickTags"
            :key="tag.label"
            class="quick-tag"
            @click="handleTag(tag.path)"
            >{{ tag.label }}</span
          >
        </div>
      </div>
      <div class="welcome-right">
        <el-avatar
          :size="52"
          :src="userStore.info?.headImg || avatarFallback"
          class="avatar"
        />
        <div class="user-info">
          <div class="user-name">
            {{ userStore.info?.nickName || "管理员" }}
          </div>
          <div class="user-role">超级管理员</div>
        </div>
      </div>
    </div>

    <!-- 主内容：左宽右窄 -->
    <div class="main-body">
      <!-- 左侧 -->
      <div class="left-col">
        <!-- 数据概览 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">数据概览</span>
            <span class="card-more" @click="handleTag('/dashboard/console')"
              >查看全部</span
            >
          </div>
          <div class="overview-row">
            <div
              v-for="item in overviewData"
              :key="item.label"
              class="overview-item"
              :class="['overview-item', 'overview-item--' + item.color]"
            >
              <div class="ov-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="ov-right">
                <div class="ov-num">{{ item.value }}</div>
                <div class="ov-label">{{ item.label }}</div>
              </div>
              <div class="ov-trend" :class="[item.trendUp ? 'up' : 'down']">
                <el-icon
                  ><component :is="item.trendUp ? 'ArrowUp' : 'ArrowDown'"
                /></el-icon>
                <span>{{ item.trend }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">快捷操作</span>
          </div>
          <div class="action-grid">
            <div
              v-for="action in quickActions"
              :key="action.label"
              class="action-btn"
              @click="handleTag(action.path)"
            >
              <div class="action-icon" :style="{ background: action.color }">
                <el-icon><component :is="action.icon" /></el-icon>
              </div>
              <span class="action-label">{{ action.label }}</span>
            </div>
          </div>
        </div>

        <!-- 最新动态 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">最新动态</span>
            <span class="card-more">更多</span>
          </div>
          <div class="activity-list">
            <div
              v-for="(item, i) in recentActivities"
              :key="i"
              class="activity-item"
            >
              <span class="act-dot" :style="{ background: item.color }"></span>
              <span class="act-user">{{ item.user }}</span>
              <span class="act-desc">{{ item.action }}</span>
              <span class="act-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="right-col">
        <!-- 我的任务 -->
        <div class="card task-card">
          <div class="card-header">
            <span class="card-title">我的任务</span>
            <el-badge :value="pendingTasks" :max="99" class="task-badge">
              <span class="card-more">进行中</span>
            </el-badge>
          </div>
          <div class="task-list">
            <div
              v-for="(task, i) in myTasks"
              :key="i"
              class="task-item"
              :class="['task-item', task.done ? 'task-done' : '']"
            >
              <el-checkbox
                :model-value="task.done"
                @change="toggleTask(i, $event)"
              />
              <div class="task-main">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-meta">
                  <span
                    class="task-tag"
                    :style="{ background: task.tagBg, color: task.tagColor }"
                    >{{ task.tag }}</span
                  >
                  <span class="task-deadline">{{ task.deadline }}</span>
                </div>
              </div>
              <el-progress
                :percentage="task.progress"
                :show-text="false"
                :color="task.done ? '#67c23a' : '#2d96f1'"
                stroke-width="4"
                :striped="!task.done"
                striped-flow
              />
            </div>
          </div>
          <div class="task-footer">
            <span
              >已完成 <b>{{ doneTasks }}</b> / {{ myTasks.length }}</span
            >
            <el-button type="primary" size="small" class="btn-more"
              >查看全部</el-button
            >
          </div>
        </div>

        <!-- 系统通知 -->
        <div class="card notice-card">
          <div class="card-header">
            <span class="card-title">系统通知</span>
            <span class="card-more" @click="markAllRead">全部已读</span>
          </div>
          <div class="notice-list">
            <div
              v-for="(n, i) in notices"
              :key="i"
              class="notice-item"
              :class="['notice-item', n.unread ? 'notice-unread' : '']"
              @click="n.unread = false"
            >
              <div class="notice-dot" :style="{ background: n.color }"></div>
              <div class="notice-body">
                <div class="notice-title">{{ n.title }}</div>
                <div class="notice-desc">{{ n.desc }}</div>
              </div>
              <span class="notice-time">{{ n.time }}</span>
              <el-badge v-if="n.unread" :is-dot />
            </div>
          </div>
        </div>

        <!-- 最近访问 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">最近访问</span>
          </div>
          <div class="recent-list">
            <div
              v-for="(item, i) in recentPages"
              :key="i"
              class="recent-item"
              @click="handleTag(item.path)"
            >
              <div class="recent-icon" :style="{ background: item.color }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="recent-text">
                <div class="recent-name">{{ item.name }}</div>
                <div class="recent-time">{{ item.time }}</div>
              </div>
              <el-icon class="recent-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user.js";
import {
  UserFilled,
  TrendCharts,
  Bell,
  ChatDotRound,
  View,
  Management,
  Connection,
  Promotion,
  Setting,
  DataLine,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const avatarFallback =
  "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";

// ─── 问候语 ───────────────────────────────────────────
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "凌晨好";
  if (h < 12) return "上午好";
  if (h < 18) return "下午好";
  return "晚上好";
});

const currentDate = computed(() => {
  const d = new Date();
  const days = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`;
});

// ─── 快速标签 ─────────────────────────────────────────
const quickTags = [
  { label: "主控台", path: "/dashboard/console" },
  { label: "数据大屏", path: "/bigScreen" },
  { label: "监控台", path: "/dashboard/monitor" },
];

// ─── 数据概览 ─────────────────────────────────────────
const overviewData = ref([
  {
    label: "总用户数",
    value: "12,846",
    icon: "UserFilled",
    color: "blue",
    trendUp: true,
    trend: "12.5",
  },
  {
    label: "今日访问",
    value: "3,254",
    icon: "TrendCharts",
    color: "green",
    trendUp: true,
    trend: "8.3",
  },
  {
    label: "待处理",
    value: "28",
    icon: "Bell",
    color: "orange",
    trendUp: false,
    trend: "2.1",
  },
  {
    label: "系统消息",
    value: "156",
    icon: "ChatDotRound",
    color: "purple",
    trendUp: true,
    trend: "5.7",
  },
]);

// ─── 快捷操作 ─────────────────────────────────────────
const quickActions = [
  {
    label: "数据大屏",
    icon: "View",
    path: "/bigScreen",
    color: "linear-gradient(135deg,#667eea,#764ba2)",
  },
  {
    label: "用户管理",
    icon: "UserFilled",
    path: "/system/user",
    color: "linear-gradient(135deg,#f093fb,#f5576c)",
  },
  {
    label: "角色管理",
    icon: "Management",
    path: "/system/role",
    color: "linear-gradient(135deg,#4facfe,#00f2fe)",
  },
  {
    label: "菜单管理",
    icon: "Connection",
    path: "/system/menu",
    color: "linear-gradient(135deg,#43e97b,#38f9d7)",
  },
  {
    label: "文件上传",
    icon: "Promotion",
    path: "/fileUpload/limitUploadNum",
    color: "linear-gradient(135deg,#fa709a,#fee140)",
  },
  {
    label: "系统设置",
    icon: "Setting",
    path: "/system/config",
    color: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  },
];

// ─── 最新动态 ─────────────────────────────────────────
const recentActivities = ref([
  {
    user: "管理员",
    action: "修改了系统配置信息",
    time: "5 分钟前",
    color: "#2d96f1",
  },
  {
    user: "用户甲",
    action: "上传了新文件至文件管理",
    time: "23 分钟前",
    color: "#67c23a",
  },
  {
    user: "管理员",
    action: "新增了角色「数据分析员」",
    time: "1 小时前",
    color: "#e6a23c",
  },
  { user: "用户乙", action: "登录了系统", time: "2 小时前", color: "#f56c6c" },
  {
    user: "系统",
    action: "自动备份完成，耗时 3m12s",
    time: "3 小时前",
    color: "#909399",
  },
]);

// ─── 我的任务 ─────────────────────────────────────────
const myTasks = ref([
  {
    name: "完成首页 Dashboard 样式优化",
    tag: "UI设计",
    tagBg: "#e8f8ef",
    tagColor: "#4db6ac",
    deadline: "今天",
    progress: 80,
    done: false,
  },
  {
    name: "修复文件上传进度条异常问题",
    tag: "Bug修复",
    tagBg: "#fef4e8",
    tagColor: "#ff9800",
    deadline: "明天",
    progress: 45,
    done: false,
  },
  {
    name: "更新权限管理模块接口文档",
    tag: "文档",
    tagBg: "#f0ecfb",
    tagColor: "#8b5cf6",
    deadline: "周五",
    progress: 100,
    done: true,
  },
  {
    name: "数据大屏性能优化与测试",
    tag: "性能",
    tagBg: "#eaf4fd",
    tagColor: "#2d96f1",
    deadline: "下周一",
    progress: 10,
    done: false,
  },
  {
    name: "用户反馈收集与整理",
    tag: "运营",
    tagBg: "#e8f8ef",
    tagColor: "#4db6ac",
    deadline: "周三",
    progress: 60,
    done: false,
  },
]);

const pendingTasks = computed(
  () => myTasks.value.filter((t) => !t.done).length,
);
const doneTasks = computed(() => myTasks.value.filter((t) => t.done).length);

function toggleTask(i, val) {
  myTasks.value[i].done = val;
  if (val) myTasks.value[i].progress = 100;
}

// ─── 系统通知 ─────────────────────────────────────────
const notices = ref([
  {
    title: "系统升级通知",
    desc: "系统将于今晚 22:00 进行版本升级维护",
    time: "10:30",
    unread: true,
    color: "#2d96f1",
  },
  {
    title: "新用户注册",
    desc: "今日新增注册用户 23 人，较昨日增长 15%",
    time: "09:15",
    unread: true,
    color: "#67c23a",
  },
  {
    title: "备份完成",
    desc: "数据库每日自动备份已成功完成",
    time: "昨日",
    unread: false,
    color: "#909399",
  },
  {
    title: "安全提醒",
    desc: "检测到异常登录尝试，建议修改密码",
    time: "昨日",
    unread: false,
    color: "#f56c6c",
  },
]);

function markAllRead() {
  notices.value.forEach((n) => (n.unread = false));
}

// ─── 最近访问 ─────────────────────────────────────────
const recentPages = ref([
  {
    name: "主控台",
    icon: "DataLine",
    path: "/dashboard/console",
    color: "linear-gradient(135deg,#667eea,#764ba2)",
    time: "刚刚",
  },
  {
    name: "数据大屏",
    icon: "View",
    path: "/bigScreen",
    color: "linear-gradient(135deg,#f093fb,#f5576c)",
    time: "10 分钟前",
  },
  {
    name: "监控台",
    icon: "TrendCharts",
    path: "/dashboard/monitor",
    color: "linear-gradient(135deg,#4facfe,#00f2fe)",
    time: "1 小时前",
  },
  {
    name: "文件上传",
    icon: "Promotion",
    path: "/file/upload",
    color: "linear-gradient(135deg,#43e97b,#38f9d7)",
    time: "2 小时前",
  },
]);

function handleTag(path) {
  if (path) router.push(path);
}
</script>

<style scoped lang="scss">
// ─── 页面容器 ─────────────────────────────────────────
.workplace {
  height: 100%;
  overflow-y: auto;
  padding: 6px;
  box-sizing: border-box;
  // 禁止横向滚动
  overflow-x: hidden;
}

// ─── 通用卡片 ─────────────────────────────────────────
.card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .card-more {
    font-size: 12px;
    color: #aaa;
    cursor: pointer;
    &:hover {
      color: #2d96f1;
    }
  }
}

// ─── 欢迎横幅 ─────────────────────────────────────────
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2d96f1 0%, #1a6fd4 100%);
  border-radius: 14px;
  padding: 22px 28px;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 6px 20px rgba(45, 150, 241, 0.22);
}

.welcome-left {
  .greeting {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;

    .greeting-text {
      font-weight: 700;
    }
    .greeting-sub {
      font-size: 18px;
      font-weight: 400;
      opacity: 0.85;
    }
  }

  .date-text {
    font-size: 13px;
    opacity: 0.75;
    margin-bottom: 14px;
  }

  .quick-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .quick-tag {
      padding: 4px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.2);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
      backdrop-filter: blur(4px);

      &:hover {
        background: rgba(255, 255, 255, 0.35);
      }
    }
  }
}

.welcome-right {
  display: flex;
  align-items: center;
  gap: 12px;

  .avatar {
    border: 2px solid rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
  }

  .user-info {
    .user-name {
      font-size: 15px;
      font-weight: 600;
    }
    .user-role {
      font-size: 12px;
      opacity: 0.75;
      margin-top: 2px;
    }
  }
}

// ─── 主内容网格 ───────────────────────────────────────
.main-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  align-items: start;
}

// ─── 数据概览 ─────────────────────────────────────────
.overview-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
  }

  &--blue {
    .ov-icon {
      background: #e8f2fd;
      color: #2d96f1;
    }
  }
  &--green {
    .ov-icon {
      background: #e8f8ef;
      color: #4db6ac;
    }
  }
  &--orange {
    .ov-icon {
      background: #fef4e8;
      color: #ff9800;
    }
  }
  &--purple {
    .ov-icon {
      background: #f0ecfb;
      color: #8b5cf6;
    }
  }

  .ov-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
  }

  .ov-right {
    flex: 1;
    min-width: 0;
  }

  .ov-num {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
  }

  .ov-label {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
  }

  .ov-trend {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;

    &.up {
      color: #67c23a;
    }
    &.down {
      color: #f56c6c;
    }
  }
}

// ─── 快捷操作 ─────────────────────────────────────────
.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 12px;
  cursor: pointer;
  background: #f8fafc;
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  }

  .action-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .action-label {
    font-size: 13px;
    color: #555;
  }
}

// ─── 最新动态 ─────────────────────────────────────────
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #555;

  &:last-child {
    border-bottom: none;
  }

  .act-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .act-user {
    font-weight: 600;
    color: #1a1a2e;
    flex-shrink: 0;
  }
  .act-desc {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .act-time {
    color: #bbb;
    flex-shrink: 0;
    font-size: 12px;
  }
}

// ─── 我的任务 ─────────────────────────────────────────
.task-card {
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 260px;
    overflow-y: auto;
    // 隐藏滚动条但保留滚动
    scrollbar-width: thin;
    scrollbar-color: #e0e0e0 transparent;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 2px;
    }
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f8fafc;
    transition: background 0.15s;

    &:hover {
      background: #f0f7ff;
    }

    &.task-done {
      opacity: 0.6;
      .task-name {
        text-decoration: line-through;
        color: #bbb;
      }
    }

    .task-main {
      flex: 1;
      min-width: 0;

      .task-name {
        font-size: 13px;
        color: #333;
        font-weight: 500;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .task-meta {
        display: flex;
        align-items: center;
        gap: 6px;

        .task-tag {
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .task-deadline {
          font-size: 11px;
          color: #bbb;
        }
      }
    }

    .el-progress {
      flex-shrink: 0;
      width: 64px;
    }
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    font-size: 13px;
    color: #888;

    b {
      color: #2d96f1;
      font-weight: 700;
    }
    .btn-more {
      margin-left: auto;
    }
  }
}

// ─── 系统通知 ─────────────────────────────────────────
.notice-card {
  .notice-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .notice-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 6px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: #f5f8ff;
    }

    &.notice-unread {
      background: rgba(45, 150, 241, 0.04);
    }

    .notice-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .notice-body {
      flex: 1;
      min-width: 0;

      .notice-title {
        font-size: 13px;
        font-weight: 500;
        color: #333;
      }

      .notice-desc {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .notice-time {
      font-size: 11px;
      color: #bbb;
      flex-shrink: 0;
    }
  }
}

// ─── 最近访问 ─────────────────────────────────────────
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f5f8ff;
  }

  .recent-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    font-size: 16px;
  }

  .recent-text {
    flex: 1;
    min-width: 0;
  }

  .recent-name {
    font-size: 13px;
    color: #333;
    font-weight: 500;
  }

  .recent-time {
    font-size: 11px;
    color: #bbb;
    margin-top: 2px;
  }

  .recent-arrow {
    color: #ccc;
    font-size: 14px;
    flex-shrink: 0;
  }
}

// ─── 响应式 ───────────────────────────────────────────
@media (max-width: 1100px) {
  .main-body {
    grid-template-columns: 1fr;
  }

  .overview-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
