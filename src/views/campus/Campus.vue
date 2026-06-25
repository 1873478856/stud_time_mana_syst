<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCampusStore } from '@/stores/campus'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { Plus, Bell, Calendar, User, Link } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const campusStore = useCampusStore()

const showPostDialog = ref(false)
const filterType = ref('all')

const form = ref({
  title: '',
  content: '',
  type: 'activity' as 'activity' | 'competition' | 'lecture' | 'other',
  deadline: ''
})

const types = [
  { value: 'activity', label: '活动', icon: 'Calendar' },
  { value: 'competition', label: '竞赛', icon: 'Trophy' },
  { value: 'lecture', label: '讲座', icon: 'Bell' },
  { value: 'other', label: '其他', icon: 'More' }
]

const filteredAnnouncements = computed(() => {
  if (filterType.value === 'all') return campusStore.announcements
  return campusStore.announcements.filter(a => a.type === filterType.value)
})

const getTypeLabel = (type: string) => {
  return types.find(t => t.value === type)?.label || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    activity: '#67C23A',
    competition: '#E6A23C',
    lecture: '#409EFF',
    other: '#909399'
  }
  return colors[type] || '#909399'
}

const postAnnouncement = () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  campusStore.addAnnouncement({
    ...form.value,
    publisher: {
      id: '1',
      username: 'admin',
      email: '',
      studentId: '',
      avatar: '',
      name: '管理员',
      major: '',
      grade: '',
      campus: '',
      isVerified: true,
      createdAt: new Date().toISOString()
    },
    tags: []
  })

  ElMessage.success('发布成功')
  showPostDialog.value = false
}
</script>

<template>
  <div class="campus-page">
    <div class="campus-header">
      <div class="filter-tabs">
        <button
          :class="['filter-tab', { active: filterType === 'all' }]"
          @click="filterType = 'all'"
        >
          全部
        </button>
        <button
          v-for="type in types"
          :key="type.value"
          :class="['filter-tab', { active: filterType === type.value }]"
          @click="filterType = type.value"
        >
          {{ type.label }}
        </button>
      </div>
      <ElButton type="primary" icon="Plus" @click="showPostDialog = true">发布公告</ElButton>
    </div>

    <div class="announcements-list">
      <div
        v-for="announcement in filteredAnnouncements"
        :key="announcement.id"
        class="announcement-card"
      >
        <div class="announcement-header">
          <span class="type-tag" :style="{ backgroundColor: getTypeColor(announcement.type) + '15', color: getTypeColor(announcement.type) }">
            {{ getTypeLabel(announcement.type) }}
          </span>
          <span class="publish-time">{{ dayjs(announcement.createdAt).format('MM-DD HH:mm') }}</span>
        </div>
        <h3 class="announcement-title">{{ announcement.title }}</h3>
        <p class="announcement-content">{{ announcement.content }}</p>
        <div class="announcement-footer">
          <div class="publisher-info">
            <div class="publisher-avatar">{{ announcement.publisher.name.charAt(0) }}</div>
            <span>{{ announcement.publisher.name }}</span>
          </div>
          <div class="announcement-meta">
            <span v-if="announcement.deadline" class="deadline">
              <Calendar /> {{ announcement.deadline }} 截止
            </span>
            <button class="action-btn">
              <Link /> 详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredAnnouncements.length === 0" class="empty-state">
      <Bell style="font-size: 48px; color: #c0c4cc;" />
      <p>暂无公告</p>
    </div>

    <ElDialog title="发布公告" v-model="showPostDialog" width="500px">
      <ElForm :model="form">
        <ElFormItem label="标题" required>
          <ElInput v-model="form.title" placeholder="请输入公告标题" />
        </ElFormItem>
        <ElFormItem label="类型">
          <ElSelect v-model="form.type">
            <ElOption v-for="type in types" :key="type.value" :label="type.label" :value="type.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="内容" required>
          <ElInput v-model="form.content" type="textarea" :rows="5" placeholder="请输入公告内容" />
        </ElFormItem>
        <ElFormItem label="截止日期">
          <ElInput v-model="form.deadline" type="date" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showPostDialog = false">取消</ElButton>
        <ElButton type="primary" @click="postAnnouncement">发布</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.campus-page {
  .campus-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .filter-tabs {
      display: flex;
      gap: 8px;

      .filter-tab {
        padding: 8px 16px;
        border-radius: 20px;
        border: none;
        background: #f5f5f5;
        color: #606266;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #e8e8e8;
        }

        &.active {
          background: #409eff;
          color: #fff;
        }
      }
    }
  }

  .announcements-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .announcement-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .announcement-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .type-tag {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 4px;
      }

      .publish-time {
        font-size: 12px;
        color: #909399;
      }
    }

    .announcement-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .announcement-content {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .announcement-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .publisher-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .publisher-avatar {
          width: 32px;
          height: 32px;
          background: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #606266;
        }

        span {
          font-size: 14px;
          color: #606266;
        }
      }

      .announcement-meta {
        display: flex;
        align-items: center;
        gap: 16px;

        .deadline {
          font-size: 13px;
          color: #f56c6c;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #d9d9d9;
          background: #fff;
          border-radius: 4px;
          font-size: 13px;
          color: #606266;
          cursor: pointer;

          &:hover {
            border-color: #409eff;
            color: #409eff;
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px;
    color: #c0c4cc;

    p {
      margin-top: 12px;
      font-size: 14px;
    }
  }
}
</style>
