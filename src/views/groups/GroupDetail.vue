<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupsStore } from '@/stores/groups'
import { useUserStore } from '@/stores/user'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElTabs, ElTabPane, ElUpload, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { Plus, User, Document, Calendar, Check, Clock, Upload, View, Download, Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()
const userStore = useUserStore()

const activeTab = ref('tasks')
const showAddTaskDialog = ref(false)
const showAddFileDialog = ref(false)
const showAddMeetingDialog = ref(false)
const showPreviewDialog = ref(false)
const previewFile = ref<typeof files.value[0] | null>(null)

const form = ref({
  title: '',
  description: '',
  assignee: '',
  dueDate: '',
  fileName: '',
  meetingTitle: '',
  meetingDate: '',
  meetingTime: '',
  agenda: ''
})

const uploadedFile = ref<File | null>(null)

const groupId = computed(() => route.params.id as string)
const group = computed(() => groupsStore.groups.find(g => g.id === groupId.value))
const tasks = computed(() => group.value ? groupsStore.getGroupTasks(group.value.id) : [])
const files = computed(() => group.value ? groupsStore.getGroupFiles(group.value.id) : [])
const meetings = computed(() => group.value ? groupsStore.getGroupMeetings(group.value.id) : [])

const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in-progress'))
const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))

const members = computed(() => group.value?.members || [])

const getMemberRole = (role: string) => {
  return role === 'leader' ? '组长' : '成员'
}

const handleFileChange = (uploadFile: UploadFile) => {
  uploadedFile.value = uploadFile.raw as File
  form.value.fileName = uploadFile.name
}

const addFile = () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    groupsStore.addGroupFile({
      name: form.value.fileName || uploadedFile.value!.name,
      groupId: groupId.value,
      uploadedBy: userStore.currentUser?.id || '1',
      version: 1,
      size: uploadedFile.value!.size,
      type: uploadedFile.value!.type,
      content: content
    })

    ElMessage.success('文件上传成功')
    showAddFileDialog.value = false
    uploadedFile.value = null
    form.value.fileName = ''
  }
  reader.readAsDataURL(uploadedFile.value)
}

const addTask = () => {
  if (!form.value.title) {
    ElMessage.warning('请输入任务标题')
    return
  }

  groupsStore.addGroupTask({
    title: form.value.title,
    description: form.value.description,
    priority: 'medium',
    status: 'pending',
    tags: [],
    dueDate: form.value.dueDate,
    repeat: 'none',
    parentId: null,
    children: [],
    userId: '1',
    groupId: groupId.value,
    assigneeId: form.value.assignee || null
  })

  ElMessage.success('任务添加成功')
  showAddTaskDialog.value = false
}

const updateTaskStatus = (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.status = status
    ElMessage.success('任务状态已更新')
  }
}

const handlePreview = (file: typeof files.value[0]) => {
  if (!file.content) {
    ElMessage.warning('该文件没有内容，无法预览')
    return
  }
  previewFile.value = file
  showPreviewDialog.value = true
}

const handleDeleteFile = (file: typeof files.value[0]) => {
  ElMessageBox.confirm('确定要删除这个文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    groupsStore.deleteGroupFile(file.id)
    ElMessage.success('文件已删除')
  }).catch(() => {})
}

const handleDownload = (file: typeof files.value[0]) => {
  if (!file.content) {
    ElMessage.warning('该文件没有内容，无法下载')
    return
  }
  try {
    const byteString = atob(file.content.split(',')[1])
    const mimeType = file.content.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('文件下载成功')
  } catch (e) {
    ElMessage.error('文件下载失败')
    console.error(e)
  }
}

const isImage = (type: string) => {
  return type.startsWith('image/')
}

const isText = (type: string) => {
  return type.startsWith('text/') || type.includes('pdf') || type.includes('word') || type.includes('excel')
}

const isPdf = (type: string) => {
  return type.includes('pdf')
}

const getTextContent = (content: string) => {
  if (content.startsWith('data:text')) {
    const byteString = atob(content.split(',')[1])
    return byteString
  }
  return '无法解析文本内容'
}

onMounted(() => {
  groupsStore.initGroups()
})
</script>

<template>
  <div class="group-detail-page">
    <div v-if="group">
      <div class="group-header">
        <div class="group-info">
          <div class="group-avatar" style="background: #ecf5ff;">
            <User style="color: #409eff;" />
          </div>
          <div>
            <h1>{{ group.name }}</h1>
            <p>{{ group.description }}</p>
          </div>
        </div>
        <div class="header-actions">
          <span class="invite-code">邀请码: {{ group.inviteCode }}</span>
          <ElButton type="primary" icon="Plus" @click="showAddTaskDialog = true">添加任务</ElButton>
        </div>
      </div>

      <ElTabs v-model="activeTab" type="border-card" style="margin-top: 20px;">
        <ElTabPane label="任务看板" name="tasks">
          <div class="kanban">
            <div class="kanban-column">
              <h3>待分配 <span class="count">{{ pendingTasks.length }}</span></h3>
              <div class="task-list">
                <div
                  v-for="task in pendingTasks"
                  :key="task.id"
                  class="task-card"
                  draggable="true"
                >
                  <h4>{{ task.title }}</h4>
                  <p>{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="due-date">{{ task.dueDate }}</span>
                    <span class="assignee">未分配</span>
                  </div>
                  <div class="task-actions">
                    <button @click="updateTaskStatus(task.id, 'in-progress')">开始</button>
                    <button @click="updateTaskStatus(task.id, 'completed')">完成</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="kanban-column">
              <h3>进行中 <span class="count">{{ inProgressTasks.length }}</span></h3>
              <div class="task-list">
                <div
                  v-for="task in inProgressTasks"
                  :key="task.id"
                  class="task-card"
                  draggable="true"
                >
                  <h4>{{ task.title }}</h4>
                  <p>{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="due-date">{{ task.dueDate }}</span>
                  </div>
                  <div class="task-actions">
                    <button @click="updateTaskStatus(task.id, 'completed')">完成</button>
                    <button @click="updateTaskStatus(task.id, 'pending')">退回</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="kanban-column">
              <h3>已完成 <span class="count">{{ completedTasks.length }}</span></h3>
              <div class="task-list completed">
                <div
                  v-for="task in completedTasks"
                  :key="task.id"
                  class="task-card"
                  draggable="true"
                >
                  <div class="completed-icon"><Check /></div>
                  <h4>{{ task.title }}</h4>
                  <button @click="updateTaskStatus(task.id, 'pending')">撤销</button>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="文件共享" name="files">
          <div class="files-section">
            <div class="files-header">
              <ElButton type="primary" icon="Plus" @click="showAddFileDialog = true">上传文件</ElButton>
            </div>
            <div class="files-list">
              <div
                v-for="file in files"
                :key="file.id"
                class="file-card"
              >
                <Document style="color: #409eff;" />
                <div class="file-info">
                  <h4>{{ file.name }}</h4>
                  <p>版本 {{ file.version }} · {{ (file.size / 1024).toFixed(1) }} KB</p>
                </div>
                <div class="file-actions">
                  <button @click="handlePreview(file)"><el-icon><View /></el-icon> 预览</button>
                  <button @click="handleDownload(file)"><el-icon><Download /></el-icon> 下载</button>
                  <button @click="handleDeleteFile(file)" class="delete-btn"><el-icon><Delete /></el-icon> 删除</button>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="日程会议" name="meetings">
          <div class="meetings-section">
            <div class="meetings-header">
              <ElButton type="primary" icon="Plus" @click="showAddMeetingDialog = true">发起会议</ElButton>
            </div>
            <div class="meetings-list">
              <div
                v-for="meeting in meetings"
                :key="meeting.id"
                class="meeting-card"
              >
                <Calendar style="color: #67c23a;" />
                <div class="meeting-info">
                  <h4>{{ meeting.title }}</h4>
                  <p>{{ meeting.date }} {{ meeting.startTime }} - {{ meeting.endTime }}</p>
                </div>
                <div class="meeting-actions">
                  <button>查看详情</button>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="成员管理" name="members">
          <div class="members-section">
            <div class="members-list">
              <div
                v-for="member in members"
                :key="member.userId"
                class="member-card"
              >
                <div class="member-avatar">{{ member.user.name.charAt(0) }}</div>
                <div class="member-info">
                  <h4>{{ member.user.name }}</h4>
                  <p>{{ member.user.major }} · {{ member.user.grade }}</p>
                </div>
                <span :class="['role-tag', member.role]">{{ getMemberRole(member.role) }}</span>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <ElDialog title="添加任务" v-model="showAddTaskDialog" width="400px">
      <ElForm :model="form">
        <ElFormItem label="任务标题" required>
          <ElInput v-model="form.title" placeholder="请输入任务标题" />
        </ElFormItem>
        <ElFormItem label="任务描述">
          <ElInput v-model="form.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </ElFormItem>
        <ElFormItem label="截止日期">
          <ElInput v-model="form.dueDate" type="date" />
        </ElFormItem>
        <ElFormItem label="指派成员">
          <ElInput v-model="form.assignee" placeholder="输入成员姓名" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddTaskDialog = false">取消</ElButton>
        <ElButton type="primary" @click="addTask">添加</ElButton>
      </template>
    </ElDialog>

    <ElDialog title="上传文件" v-model="showAddFileDialog" width="400px">
      <ElForm :model="form">
        <ElFormItem label="文件名称">
          <ElInput v-model="form.fileName" placeholder="默认使用原文件名" />
        </ElFormItem>
        <ElFormItem label="选择文件">
          <ElUpload
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            drag
          >
            <div class="upload-area">
              <Upload style="font-size: 48px; color: #c0c4cc;" />
              <p>点击或拖拽文件到此处上传</p>
              <p class="upload-tip">支持任意文件类型</p>
            </div>
          </ElUpload>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddFileDialog = false">取消</ElButton>
        <ElButton type="primary" @click="addFile">上传</ElButton>
      </template>
    </ElDialog>

    <ElDialog title="发起会议" v-model="showAddMeetingDialog" width="400px">
      <ElForm :model="form">
        <ElFormItem label="会议标题" required>
          <ElInput v-model="form.meetingTitle" placeholder="请输入会议标题" />
        </ElFormItem>
        <ElFormItem label="会议日期">
          <ElInput v-model="form.meetingDate" type="date" />
        </ElFormItem>
        <ElFormItem label="会议时间">
          <ElInput v-model="form.meetingTime" type="time" />
        </ElFormItem>
        <ElFormItem label="会议议程">
          <ElInput v-model="form.agenda" type="textarea" :rows="3" placeholder="请输入会议议程" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddMeetingDialog = false">取消</ElButton>
        <ElButton type="primary">发起</ElButton>
      </template>
    </ElDialog>
  <ElDialog title="文件预览" v-model="showPreviewDialog" width="800px">
      <div v-if="previewFile" class="preview-content">
        <div class="preview-header">
          <Document style="font-size: 32px; color: #409eff;" />
          <div>
            <h3>{{ previewFile.name }}</h3>
            <p>{{ (previewFile.size / 1024).toFixed(1) }} KB · 版本 {{ previewFile.version }}</p>
          </div>
        </div>
        <div class="preview-body">
          <div v-if="isImage(previewFile.type)" class="preview-image">
            <img :src="previewFile.content" alt="文件预览" />
          </div>
          <div v-else-if="isText(previewFile.type)" class="preview-text">
            <pre>{{ getTextContent(previewFile.content) }}</pre>
          </div>
          <div v-else-if="isPdf(previewFile.type)" class="preview-pdf">
            <iframe :src="previewFile.content" type="application/pdf" />
          </div>
          <div v-else class="preview-other">
            <Document style="font-size: 64px; color: #c0c4cc;" />
            <p>{{ previewFile.type }}</p>
            <p class="preview-tip">该文件类型无法直接预览，请下载查看</p>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="showPreviewDialog = false">关闭</ElButton>
        <ElButton type="primary" @click="previewFile && handleDownload(previewFile)">下载文件</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.group-detail-page {
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    .group-info {
      display: flex;
      gap: 16px;

      .group-avatar {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      }

      h1 {
        font-size: 22px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      p {
        font-size: 14px;
        color: #909399;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .invite-code {
        font-size: 14px;
        color: #606266;
        padding: 8px 16px;
        background: #fafafa;
        border-radius: 8px;
      }
    }
  }

  .kanban {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .kanban-column {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;

        .count {
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          background: #fff;
          padding: 2px 8px;
          border-radius: 10px;
        }
      }

      .task-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        &.completed .task-card {
          opacity: 0.7;
          background: #f0f9ff;

          h4 {
            text-decoration: line-through;
          }
        }

        .task-card {
          background: #fff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
          cursor: grab;

          &:active {
            cursor: grabbing;
          }

          .completed-icon {
            color: #67c23a;
            margin-bottom: 8px;
          }

          h4 {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 8px;
          }

          p {
            font-size: 13px;
            color: #606266;
            margin-bottom: 12px;
          }

          .task-meta {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;

            .due-date, .assignee {
              font-size: 12px;
              color: #909399;
            }
          }

          .task-actions {
            display: flex;
            gap: 8px;

            button {
              padding: 4px 12px;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              background: #f5f5f5;
              color: #606266;

              &:hover {
                background: #409eff;
                color: #fff;
              }
            }
          }
        }
      }
    }
  }

  .files-section, .meetings-section, .members-section {
    .files-header, .meetings-header {
      margin-bottom: 16px;
    }

    .files-list, .meetings-list, .members-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .file-card, .meeting-card, .member-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

      .file-info, .meeting-info, .member-info {
        flex: 1;

        h4 {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        p {
          font-size: 12px;
          color: #909399;
        }
      }

      .file-actions, .meeting-actions {
        button {
          padding: 4px 10px;
          border: none;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 12px;
          color: #606266;
          cursor: pointer;

          &:hover {
            background: #409eff;
            color: #fff;
          }

          &.delete-btn:hover {
            background: #f56c6c;
          }
        }
      }
    }

    .member-card {
      .member-avatar {
        width: 40px;
        height: 40px;
        background: #f0f0f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #606266;
      }

      .role-tag {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 4px;

        &.leader {
          background: #fef0f0;
          color: #f56c6c;
        }

        &.member {
          background: #f0f9ff;
          color: #409eff;
        }
      }
    }
  }

  .upload-area {
    text-align: center;
    padding: 40px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;

    p {
      margin-top: 12px;
      color: #909399;
      font-size: 14px;
    }

    .upload-tip {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .preview-content {
    .preview-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      p {
        font-size: 12px;
        color: #909399;
      }
    }

    .preview-body {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-image {
        img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
        }
      }

      .preview-text {
        width: 100%;
        max-height: 400px;
        overflow: auto;

        pre {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #303133;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 8px;
        }
      }

      .preview-pdf {
        width: 100%;
        height: 400px;

        iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 8px;
        }
      }

      .preview-other {
        text-align: center;

        p {
          margin-top: 16px;
          font-size: 14px;
          color: #909399;
        }

        .preview-tip {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }
}
</style>
