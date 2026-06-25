<script setup lang="ts">
import { computed } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { ElButton, ElMessage } from 'element-plus'
import { Bell, Check } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const messagesStore = useMessagesStore()

const notifications = computed(() => messagesStore.notifications)

const unreadNotifications = computed(() => notifications.value.filter(n => !n.read))
const readNotifications = computed(() => notifications.value.filter(n => n.read))

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'task-due': '任务截止',
    'class-reminder': '上课提醒',
    'group-update': '小组更新',
    'friend-request': '好友请求',
    'system': '系统通知'
  }
  return labels[type] || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'task-due': '#f56c6c',
    'class-reminder': '#409eff',
    'group-update': '#67c23a',
    'friend-request': '#e6a23c',
    'system': '#909399'
  }
  return colors[type] || '#909399'
}

const markAsRead = (id: string) => {
  messagesStore.markAsRead(id)
}

const markAllAsRead = () => {
  messagesStore.markAllAsRead()
  ElMessage.success('已全部标记为已读')
}
</script>

<template>
  <div class="notifications-page">
    <div class="notifications-header">
      <h2 class="page-title">通知中心</h2>
      <ElButton v-if="unreadNotifications.length > 0" type="text" @click="markAllAsRead">
        全部标为已读
      </ElButton>
    </div>

    <div v-if="unreadNotifications.length > 0" class="notifications-group">
      <h3>未读通知 <span class="count">{{ unreadNotifications.length }}</span></h3>
      <div class="notifications-list">
        <div
          v-for="notification in unreadNotifications"
          :key="notification.id"
          class="notification-card unread"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon" :style="{ backgroundColor: getTypeColor(notification.type) + '20', color: getTypeColor(notification.type) }">
            <Bell />
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <span class="type-tag" :style="{ color: getTypeColor(notification.type) }">
                {{ getTypeLabel(notification.type) }}
              </span>
              <span class="notification-time">{{ dayjs(notification.createdAt).format('MM-DD HH:mm') }}</span>
            </div>
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-body">{{ notification.content }}</p>
          </div>
          <button class="mark-btn" @click.stop="markAsRead(notification.id)">
            <Check />
          </button>
        </div>
      </div>
    </div>

    <div v-if="readNotifications.length > 0" class="notifications-group">
      <h3>已读通知 <span class="count">{{ readNotifications.length }}</span></h3>
      <div class="notifications-list">
        <div
          v-for="notification in readNotifications"
          :key="notification.id"
          class="notification-card"
        >
          <div class="notification-icon" :style="{ backgroundColor: getTypeColor(notification.type) + '20', color: getTypeColor(notification.type) }">
            <Bell />
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <span class="type-tag" :style="{ color: getTypeColor(notification.type) }">
                {{ getTypeLabel(notification.type) }}
              </span>
              <span class="notification-time">{{ dayjs(notification.createdAt).format('MM-DD HH:mm') }}</span>
            </div>
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-body">{{ notification.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="notifications.length === 0" class="empty-state">
      <Bell style="font-size: 48px; color: #c0c4cc;" />
      <p>暂无通知</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notifications-page {
  .notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .notifications-group {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;

      .count {
        font-size: 14px;
        font-weight: normal;
        color: #909399;
        margin-left: 8px;
      }
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notification-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ebeef5;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #dcdfe6;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
      }

      &.unread {
        background: #fafafa;
        border-color: #e6f7ff;
      }

      .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :deep(svg) {
          font-size: 18px;
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .type-tag {
            font-size: 12px;
            font-weight: 500;
          }

          .notification-time {
            font-size: 12px;
            color: #909399;
          }
        }

        .notification-title {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .notification-body {
          font-size: 14px;
          color: #606266;
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .mark-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #dcdfe6;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        flex-shrink: 0;

        :deep(svg) {
          font-size: 14px;
          color: #909399;
        }

        &:hover {
          background: #ecf5ff;
          border-color: #409eff;

          :deep(svg) {
            color: #409eff;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #909399;

    p {
      margin-top: 16px;
      font-size: 14px;
    }
  }
}
</style>