<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMessagesStore } from '@/stores/messages'
import { useUserStore } from '@/stores/user'
import { ElButton, ElInput, ElMessage } from 'element-plus'
import { Message, Position } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import type { Message as MessageType } from '@/types'

const messagesStore = useMessagesStore()
const userStore = useUserStore()

const selectedContactId = ref<string | null>(null)
const replyContent = ref('')

const messages = computed(() => messagesStore.messages)

const contacts = computed(() => {
  const contactMap = new Map<string, {
    id: string
    name: string
    avatar: string
    lastMessage: MessageType | null
    unreadCount: number
  }>()
  const currentUserId = userStore.currentUser?.id || '1'

  messages.value.forEach(msg => {
    const contactId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId
    if (!contactMap.has(contactId)) {
      const contactName = msg.senderId === currentUserId ? '' : msg.sender.name
      const contactAvatar = msg.senderId === currentUserId ? '' : msg.sender.avatar
      contactMap.set(contactId, {
        id: contactId,
        name: contactName || `用户${contactId}`,
        avatar: contactAvatar || '',
        lastMessage: msg,
        unreadCount: 0
      })
    }
    const contact = contactMap.get(contactId)!
    if (!msg.read && msg.senderId !== currentUserId) {
      contact.unreadCount++
    }
    const lastMsg = contact.lastMessage!
    if (new Date(msg.createdAt) > new Date(lastMsg.createdAt)) {
      contact.lastMessage = msg
    }
  })

  return Array.from(contactMap.values()).sort((a, b) => {
    if (!a.lastMessage || !b.lastMessage) return 0
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  })
})

const selectedContact = computed(() => {
  return contacts.value.find(c => c.id === selectedContactId.value)
})

const contactMessages = computed(() => {
  if (!selectedContactId.value) return []
  const currentUserId = userStore.currentUser?.id || '1'
  return messages.value
    .filter(msg => 
      msg.senderId === selectedContactId.value || 
      (msg.receiverId === selectedContactId.value && msg.senderId === currentUserId)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
})

const sendReply = () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  if (!selectedContact.value) {
    ElMessage.warning('请先选择一个联系人')
    return
  }

  messagesStore.addMessage({
    senderId: userStore.currentUser?.id || '1',
    sender: userStore.currentUser || {
      id: '1',
      username: 'user',
      email: '',
      studentId: '',
      avatar: '',
      name: '我',
      major: '',
      grade: '',
      campus: '',
      isVerified: false,
      createdAt: new Date().toISOString()
    },
    receiverId: selectedContact.value.id,
    content: replyContent.value,
    type: 'friend',
    read: false
  })

  ElMessage.success('消息已发送')
  replyContent.value = ''
}
</script>

<template>
  <div class="messages-page">
    <div class="messages-header">
      <h2 class="page-title">消息</h2>
    </div>

    <div class="messages-content">
      <div class="messages-list">
        <div v-if="contacts.length === 0" class="empty-contacts">
          <Message style="font-size: 32px; color: #c0c4cc;" />
          <p>暂无消息</p>
        </div>
        <div
          v-for="contact in contacts"
          :key="contact.id"
          :class="['message-item', { active: selectedContactId === contact.id }]"
          @click="selectedContactId = contact.id"
        >
          <div class="message-avatar">{{ contact.name.charAt(0) }}</div>
          <div class="message-info">
            <div class="message-header">
              <span class="message-sender">{{ contact.name }}</span>
              <span class="message-time">{{ contact.lastMessage ? dayjs(contact.lastMessage.createdAt).format('MM-DD HH:mm') : '' }}</span>
            </div>
            <p class="message-preview">{{ contact.lastMessage ? contact.lastMessage.content : '' }}</p>
          </div>
          <span v-if="contact.unreadCount > 0" class="unread-badge">{{ contact.unreadCount }}</span>
        </div>
      </div>

      <div class="message-detail">
        <div v-if="selectedContact" class="detail-content">
          <div class="detail-header">
            <div class="sender-info">
              <div class="sender-avatar">{{ selectedContact.name.charAt(0) }}</div>
              <span>{{ selectedContact.name }}</span>
            </div>
          </div>
          <div class="chat-messages">
            <div
              v-for="msg in contactMessages"
              :key="msg.id"
              :class="['chat-message', { mine: msg.senderId === (userStore.currentUser?.id || '1') }]"
            >
              <div class="message-content">
                {{ msg.content }}
              </div>
              <span class="message-time">{{ dayjs(msg.createdAt).format('HH:mm') }}</span>
            </div>
          </div>
          <div class="reply-section">
            <ElInput 
              v-model="replyContent" 
              placeholder="输入消息内容..." 
              type="textarea"
              :rows="2"
            />
            <ElButton type="primary" @click="sendReply">
              <el-icon><Position /></el-icon> 发送
            </ElButton>
          </div>
        </div>
        <div v-else class="empty-detail">
          <Message style="font-size: 48px; color: #c0c4cc;" />
          <p>选择一个联系人开始聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.messages-page {
  .messages-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .messages-content {
    display: flex;
    height: calc(100vh - 180px);

    .messages-list {
      width: 320px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ebeef5;
      overflow-y: auto;
      display: flex;
      flex-direction: column;

      .empty-contacts {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #909399;

        p {
          margin-top: 12px;
          font-size: 14px;
        }
      }

      .message-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #e6f7ff;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #409eff;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .message-info {
          flex: 1;
          min-width: 0;

          .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .message-sender {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }

            .message-time {
              font-size: 12px;
              color: #909399;
            }
          }

          .message-preview {
            font-size: 13px;
            color: #909399;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .unread-badge {
          background: #f56c6c;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          flex-shrink: 0;
        }
      }
    }

    .message-detail {
      flex: 1;
      margin-left: 16px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #ebeef5;
      display: flex;
      flex-direction: column;

      .detail-content {
        display: flex;
        flex-direction: column;
        height: 100%;

        .detail-header {
          padding: 16px;
          border-bottom: 1px solid #ebeef5;
          background: #fafafa;
          border-radius: 8px 8px 0 0;

          .sender-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .sender-avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: #409eff;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: 500;
            }

            span {
              font-size: 16px;
              font-weight: 500;
              color: #303133;
            }
          }
        }

        .chat-messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          overflow-y: auto;

          .chat-message {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            max-width: 100%;

            &.mine {
              align-items: flex-end;

              .message-content {
                background: #409eff;
                color: #fff;
                border-radius: 12px 12px 0 12px;
              }
            }

            .message-content {
              max-width: 70%;
              padding: 12px 16px;
              background: #f0f0f0;
              border-radius: 12px 12px 12px 0;
              font-size: 14px;
              line-height: 1.5;
              word-break: break-word;
            }

            .message-time {
              font-size: 12px;
              color: #909399;
              margin-top: 4px;
            }
          }
        }

        .reply-section {
          padding: 16px;
          border-top: 1px solid #ebeef5;
          display: flex;
          gap: 12px;
          background: #fafafa;
          border-radius: 0 0 8px 8px;

          :deep(.el-textarea) {
            flex: 1;

            :deep(.el-textarea__inner) {
              border-radius: 8px;
              resize: none;
              font-size: 14px;
            }
          }

          :deep(.el-button) {
            align-self: flex-end;
            padding: 8px 20px;
          }
        }
      }

      .empty-detail {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #909399;

        p {
          margin-top: 16px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>