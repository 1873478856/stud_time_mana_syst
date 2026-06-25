<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGroupsStore } from '@/stores/groups'
import { useRouter } from 'vue-router'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { Plus, User, Document, Calendar, More } from '@element-plus/icons-vue'

const router = useRouter()
const groupsStore = useGroupsStore()

const showCreateDialog = ref(false)
const searchQuery = ref('')

const form = ref({
  name: '',
  type: 'course' as 'course' | 'club' | 'competition' | 'other',
  description: ''
})

const groupTypes = [
  { value: 'course', label: '课程小组', icon: 'Reading' },
  { value: 'club', label: '社团组织', icon: 'User' },
  { value: 'competition', label: '竞赛队伍', icon: 'Trophy' },
  { value: 'other', label: '其他', icon: 'More' }
]

const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupsStore.groups
  return groupsStore.groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getTypeLabel = (type: string) => {
  return groupTypes.find(t => t.value === type)?.label || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    course: '#409EFF',
    club: '#67C23A',
    competition: '#E6A23C',
    other: '#909399'
  }
  return colors[type] || '#909399'
}

const createGroup = () => {
  if (!form.value.name) {
    ElMessage.warning('请输入小组名称')
    return
  }

  groupsStore.createGroup({
    ...form.value,
    avatar: '',
    inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    members: []
  })

  ElMessage.success('小组创建成功')
  showCreateDialog.value = false
}

const joinGroup = () => {
  ElMessage.info('输入邀请码加入小组功能开发中')
}
</script>

<template>
  <div class="groups-page">
    <div class="groups-header">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="搜索小组..." />
      </div>
      <div class="header-actions">
        <ElButton @click="joinGroup">加入小组</ElButton>
        <ElButton type="primary" icon="Plus" @click="showCreateDialog = true">创建小组</ElButton>
      </div>
    </div>

    <div class="groups-grid">
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="group-card"
        @click="router.push('/group/' + group.id)"
      >
        <div class="group-header">
          <div class="group-avatar" :style="{ backgroundColor: getTypeColor(group.type) + '20' }">
            <User :style="{ color: getTypeColor(group.type) }" />
          </div>
          <div class="group-info">
            <h3 class="group-name">{{ group.name }}</h3>
            <span class="group-type" :style="{ backgroundColor: getTypeColor(group.type) + '15', color: getTypeColor(group.type) }">
              {{ getTypeLabel(group.type) }}
            </span>
          </div>
          <button class="more-btn"><More /></button>
        </div>
        
        <p class="group-description">{{ group.description }}</p>
        
        <div class="group-stats">
          <div class="stat">
            <User />
            <span>{{ group.members.length }} 成员</span>
          </div>
          <div class="stat">
            <Document />
            <span>{{ groupsStore.getGroupFiles(group.id).length }} 文件</span>
          </div>
          <div class="stat">
            <Calendar />
            <span>{{ groupsStore.getGroupMeetings(group.id).length }} 会议</span>
          </div>
        </div>
        
        <div class="group-members">
          <div class="members-avatars">
            <div
              v-for="member in group.members.slice(0, 4)"
              :key="member.userId"
              class="member-avatar"
              :title="member.user.name"
            >
              {{ member.user.name.charAt(0) }}
            </div>
            <div v-if="group.members.length > 4" class="more-members">
              +{{ group.members.length - 4 }}
            </div>
          </div>
          <span class="invite-code">邀请码: {{ group.inviteCode }}</span>
        </div>
      </div>
    </div>

    <div v-if="filteredGroups.length === 0" class="empty-state">
      <User style="font-size: 48px; color: #c0c4cc;" />
      <p>还没有小组，创建一个吧！</p>
    </div>

    <ElDialog title="创建小组" v-model="showCreateDialog" width="400px">
      <ElForm :model="form">
        <ElFormItem label="小组名称" required>
          <ElInput v-model="form.name" placeholder="请输入小组名称" />
        </ElFormItem>
        <ElFormItem label="小组类型">
          <ElSelect v-model="form.type">
            <ElOption v-for="type in groupTypes" :key="type.value" :label="type.label" :value="type.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="小组描述">
          <ElInput v-model="form.description" type="textarea" :rows="3" placeholder="请输入小组描述" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showCreateDialog = false">取消</ElButton>
        <ElButton type="primary" @click="createGroup">创建</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.groups-page {
  .groups-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .search-box {
      input {
        width: 300px;
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 20px;
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: #409eff;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .group-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .group-avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .group-info {
        flex: 1;

        .group-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .group-type {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
        }
      }

      .more-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: #f5f5f5;
        border-radius: 6px;
        cursor: pointer;
        color: #909399;
      }
    }

    .group-description {
      font-size: 14px;
      color: #606266;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .group-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .stat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #909399;
      }
    }

    .group-members {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      .members-avatars {
        display: flex;
        gap: -8px;

        .member-avatar {
          width: 28px;
          height: 28px;
          background: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #606266;
          border: 2px solid #fff;
          margin-left: -8px;

          &:first-child {
            margin-left: 0;
          }
        }

        .more-members {
          width: 28px;
          height: 28px;
          background: #e8e8e8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #606266;
          border: 2px solid #fff;
          margin-left: -8px;
        }
      }

      .invite-code {
        font-size: 12px;
        color: #909399;
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
