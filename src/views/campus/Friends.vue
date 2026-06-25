<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCampusStore } from '@/stores/campus'
import { useGroupsStore } from '@/stores/groups'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { Plus, User, Search, Check, Close } from '@element-plus/icons-vue'

const router = useRouter()
const campusStore = useCampusStore()
const groupsStore = useGroupsStore()

const showAddDialog = ref(false)
const searchQuery = ref('')

const form = ref({
  username: ''
})

const friends = computed(() => campusStore.getAcceptedFriends())
const pendingRequests = computed(() => campusStore.getPendingRequests())

const filteredFriends = computed(() => {
  if (!searchQuery.value) return friends.value
  return friends.value.filter(f => 
    f.friend.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    f.friend.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const addFriend = () => {
  if (!form.value.username) {
    ElMessage.warning('请输入用户名')
    return
  }

  campusStore.addFriend(form.value.username)
  ElMessage.success('好友请求已发送')
  showAddDialog.value = false
}

const acceptFriend = (friendId: string) => {
  campusStore.acceptFriend(friendId)
  ElMessage.success('已添加好友')
}

const rejectFriend = (friendId: string) => {
  ElMessage.info('已拒绝好友请求')
}

const inviteToGroup = (friendId: string) => {
  ElMessage.info(`邀请好友 ${friendId} 加入小组功能开发中`)
}

const sendMessage = () => {
  router.push('/messages')
}
</script>

<template>
  <div class="friends-page">
    <div class="friends-header">
      <div class="search-box">
        <Search />
        <input v-model="searchQuery" type="text" placeholder="搜索好友..." />
      </div>
      <ElButton type="primary" icon="Plus" @click="showAddDialog = true">添加好友</ElButton>
    </div>

    <div class="friends-content">
      <div class="friends-section">
        <h3>好友列表 <span class="count">{{ friends.length }}</span></h3>
        <div v-if="filteredFriends.length === 0" class="empty-tip">
          暂无好友，快去添加吧！
        </div>
        <div class="friends-list">
          <div
            v-for="friend in filteredFriends"
            :key="friend.id"
            class="friend-card"
          >
            <div class="friend-avatar">{{ friend.friend.name.charAt(0) }}</div>
            <div class="friend-info">
              <h4>{{ friend.friend.name }}</h4>
              <p>{{ friend.friend.major }} · {{ friend.friend.grade }}</p>
            </div>
            <div class="friend-actions">
              <button class="action-btn" @click="inviteToGroup(friend.friendId)">邀请入组</button>
              <button class="action-btn" @click="sendMessage()">发消息</button>
            </div>
          </div>
        </div>
      </div>

      <div class="friends-section">
        <h3>好友请求 <span class="count">{{ pendingRequests.length }}</span></h3>
        <div v-if="pendingRequests.length === 0" class="empty-tip">
          暂无好友请求
        </div>
        <div class="friends-list">
          <div
            v-for="request in pendingRequests"
            :key="request.id"
            class="friend-card request"
          >
            <div class="friend-avatar">{{ request.friend.name.charAt(0) }}</div>
            <div class="friend-info">
              <h4>{{ request.friend.name }}</h4>
              <p>{{ request.friend.major }} · {{ request.friend.grade }}</p>
            </div>
            <div class="request-actions">
              <button class="accept-btn" @click="acceptFriend(request.friendId)">
                <Check /> 接受
              </button>
              <button class="reject-btn" @click="rejectFriend(request.friendId)">
                <Close /> 拒绝
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog title="添加好友" v-model="showAddDialog" width="400px">
      <ElForm :model="form">
        <ElFormItem label="用户名" required>
          <ElInput v-model="form.username" placeholder="请输入好友用户名" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddDialog = false">取消</ElButton>
        <ElButton type="primary" @click="addFriend">发送请求</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.friends-page {
  .friends-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 300px;
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 20px;
      color: #909399;

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
      }
    }
  }

  .friends-content {
    display: flex;
    gap: 24px;

    .friends-section {
      flex: 1;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;

        .count {
          font-size: 14px;
          font-weight: 400;
          color: #909399;
          margin-left: 8px;
        }
      }

      .empty-tip {
        text-align: center;
        color: #c0c4cc;
        padding: 40px;
        background: #fafafa;
        border-radius: 8px;
      }

      .friends-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .friend-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

          &.request {
            background: #fffbe6;
          }

          .friend-avatar {
            width: 48px;
            height: 48px;
            background: #f0f0f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #606266;
          }

          .friend-info {
            flex: 1;

            h4 {
              font-size: 16px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            p {
              font-size: 13px;
              color: #909399;
            }
          }

          .friend-actions {
            display: flex;
            gap: 8px;

            .action-btn {
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

          .request-actions {
            display: flex;
            gap: 8px;

            .accept-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 6px 12px;
              background: #67c23a;
              color: #fff;
              border: none;
              border-radius: 4px;
              font-size: 13px;
              cursor: pointer;

              &:hover {
                background: #85ce61;
              }
            }

            .reject-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 6px 12px;
              background: #f56c6c;
              color: #fff;
              border: none;
              border-radius: 4px;
              font-size: 13px;
              cursor: pointer;

              &:hover {
                background: #f78989;
              }
            }
          }
        }
      }
    }
  }
}
</style>
