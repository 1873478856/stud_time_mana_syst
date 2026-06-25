<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/messages'
import { useThemeStore } from '@/stores/theme'
import { useScheduleStore } from '@/stores/schedule'
import { useGroupsStore } from '@/stores/groups'
import { useCampusStore } from '@/stores/campus'

import {
  Grid,
  Calendar,
  Checked,
  Timer,
  Histogram,
  User,
  ChatLineSquare,
  Bell,
  Sunny,
  Moon,
  TurnOff,
  Avatar
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const messagesStore = useMessagesStore()
const themeStore = useThemeStore()
const scheduleStore = useScheduleStore()
const groupsStore = useGroupsStore()
const campusStore = useCampusStore()

const isCollapse = ref(false)

const menuItems = [
  { path: '/', icon: Grid, label: '首页' },
  { path: '/schedule', icon: Calendar, label: '课表' },
  { path: '/tasks', icon: Checked, label: '待办' },
  { path: '/pomodoro', icon: Timer, label: '番茄钟' },
  { path: '/stats', icon: Histogram, label: '统计' },
  { path: '/calendar', icon: Calendar, label: '日历' },
  { path: '/groups', icon: User, label: '小组' },
  { path: '/campus', icon: ChatLineSquare, label: '校园广场' },
  { path: '/teamup', icon: User, label: '自由组队' },
  { path: '/friends', icon: User, label: '好友' },
  { path: '/messages', icon: ChatLineSquare, label: '消息' },
  { path: '/notifications', icon: Bell, label: '通知' }
]

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  scheduleStore.initCourses()
  groupsStore.initGroups()
  campusStore.initData()
  messagesStore.initMessages()
  themeStore.initTheme()
})
</script>

<template>
  <el-container class="main-layout">
    <el-aside
      v-model:collapse="isCollapse"
      class="sidebar"
      :width="isCollapse ? '64px' : '220px'"
    >
      <div class="logo">
        <span class="logo-text" v-if="!isCollapse">StuTim</span>
        <span class="logo-icon" v-else>S</span>
      </div>
      <el-menu
        :default-active="route.path"
        mode="vertical"
        :collapse="isCollapse"
        @select="(key) => router.push(key as string)"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <el-icon :size="18">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="main-content">
      <el-header class="header">
        <div class="header-left">
          <span class="title">{{ menuItems.find(i => i.path === route.path)?.label || '首页' }}</span>
        </div>
        <div class="header-right">
          <el-tooltip :content="themeStore.mode === 'light' ? '切换暗黑模式' : '切换浅色模式'">
            <el-button
              type="text"
              :icon="themeStore.mode === 'light' ? Moon : Sunny"
              @click="themeStore.toggleTheme"
            />
          </el-tooltip>
          <el-dropdown trigger="click" @command="handleLogout">
            <div class="user-menu">
              <Avatar :size="36" :src="userStore.currentUser?.avatar">
                {{ userStore.currentUser?.name?.charAt(0) || 'U' }}
              </Avatar>
              <span v-if="!isCollapse" class="user-name">{{ userStore.currentUser?.name }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <User />
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <TurnOff />
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  background: #f5f5f5;

  .sidebar {
    background: #2a3f5f;
    color: #fff;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .logo-text {
        color: #fff;
      }

      .logo-icon {
        width: 36px;
        height: 36px;
        background: #409eff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: bold;
      }
    }

    :deep(.el-menu) {
      border-right: none;
      font-size: 14px;

      :deep(.el-menu-item) {
        color: rgba(255, 255, 255, 0.85);
        line-height: 48px;
        height: 48px;

        :deep(.el-icon),
        :deep(svg) {
          font-size: 16px !important;
          width: 16px !important;
          height: 16px !important;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        &.is-active {
          background: #409eff;
          color: #fff;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    overflow: hidden;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background: #fff;
      border-bottom: 1px solid #e6e6e6;
      height: 60px;

      .header-left {
        .title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;

        .user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          .user-name {
            font-size: 14px;
            color: #303133;
          }
        }
      }
    }

    .content {
      padding: 20px;
      overflow-y: auto;
      height: calc(100vh - 60px);
    }
  }
}
</style>
