<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage, ElCheckbox, ElDatePicker } from 'element-plus'
import { Plus, Edit, Delete, Check, Flag } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const tasksStore = useTasksStore()

const showAddDialog = ref(false)
const editingTask = ref<typeof tasksStore.tasks[0] | null>(null)
const filterTag = ref('all')
const filterPriority = ref('all')

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  status: 'pending' as 'pending' | 'in-progress' | 'completed',
  tags: [] as string[],
  dueDate: '',
  repeat: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
  parentId: null as string | null,
  children: [] as any[],
  userId: '',
  groupId: null as string | null,
  assigneeId: null as string | null
})

const availableTags = ['作业', '复习', '社团', '兼职', '考试', '其他']

const pendingTasks = computed(() => {
  return tasksStore.getPendingTasks().filter(t => {
    if (filterTag.value !== 'all' && !t.tags.includes(filterTag.value)) return false
    if (filterPriority.value !== 'all' && t.priority !== filterPriority.value) return false
    return true
  })
})

const completedTasks = computed(() => {
  return tasksStore.getCompletedTasks()
})

const openAddDialog = () => {
  editingTask.value = null
  form.value = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    tags: [],
    dueDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    repeat: 'none',
    parentId: null,
    children: [],
    userId: '',
    groupId: null,
    assigneeId: null
  }
  showAddDialog.value = true
}

const openEditDialog = (task: typeof tasksStore.tasks[0]) => {
  editingTask.value = task
  form.value = { ...task }
  showAddDialog.value = true
}

const saveTask = () => {
  if (!form.value.title) {
    ElMessage.warning('请输入任务标题')
    return
  }

  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, form.value)
    ElMessage.success('任务更新成功')
  } else {
    tasksStore.addTask(form.value)
    ElMessage.success('任务添加成功')
  }

  showAddDialog.value = false
}

const toggleTask = (id: string) => {
  tasksStore.toggleTask(id)
}

const deleteTask = (id: string) => {
  tasksStore.deleteTask(id)
  ElMessage.success('任务删除成功')
}

const toggleTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  if (index === -1) {
    form.value.tags.push(tag)
  } else {
    form.value.tags.splice(index, 1)
  }
}

const getPriorityStyle = (priority: string) => {
  const styles: Record<string, string> = {
    high: 'background: #fef0f0; color: #f56c6c; border-color: #fbc4c4;',
    medium: 'background: #fdf6ec; color: #e6a23c; border-color: #fde6cf;',
    low: 'background: #f0f9ff; color: #409eff; border-color: #b3d8ff;'
  }
  return styles[priority] || ''
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || ''
}
</script>

<template>
  <div class="tasks-page">
    <div class="tasks-header">
      <div class="filters">
        <div class="filter-group">
          <span class="filter-label">标签</span>
          <ElSelect v-model="filterTag" size="small">
            <ElOption label="全部" value="all" />
            <ElOption v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
          </ElSelect>
        </div>
        <div class="filter-group">
          <span class="filter-label">优先级</span>
          <ElSelect v-model="filterPriority" size="small">
            <ElOption label="全部" value="all" />
            <ElOption label="高" value="high" />
            <ElOption label="中" value="medium" />
            <ElOption label="低" value="low" />
          </ElSelect>
        </div>
      </div>
      <button class="add-btn" @click="openAddDialog">
        <Plus /> 添加任务
      </button>
    </div>

    <div class="tasks-content">
      <div class="tasks-section">
        <h3>待完成任务 <span class="count">{{ pendingTasks.length }}</span></h3>
        <div v-if="pendingTasks.length === 0" class="empty-tip">
          暂无待完成任务，添加一个吧！
        </div>
        <div class="task-list">
          <div
            v-for="task in pendingTasks"
            :key="task.id"
            class="task-card"
            :class="{ 'is-completed': task.status === 'completed' }"
          >
            <div class="task-checkbox" @click="toggleTask(task.id)">
              <Check v-if="task.status === 'completed'" />
            </div>
            <div class="task-content">
              <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span class="priority-tag" :style="getPriorityStyle(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
              <p class="task-description" v-if="task.description">{{ task.description }}</p>
              <div class="task-meta">
                <div class="task-tags">
                  <span v-for="tag in task.tags" :key="tag" class="task-tag">{{ tag }}</span>
                </div>
                <div class="task-date">{{ dayjs(task.dueDate).format('MM月DD日') }}</div>
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn" @click="openEditDialog(task)">
                <Edit />
              </button>
              <button class="action-btn" @click="deleteTask(task.id)">
                <Delete />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="tasks-section">
        <h3>已完成任务 <span class="count">{{ completedTasks.length }}</span></h3>
        <div v-if="completedTasks.length === 0" class="empty-tip">
          还没有完成的任务
        </div>
        <div class="task-list completed">
          <div
            v-for="task in completedTasks"
            :key="task.id"
            class="task-card"
          >
            <div class="task-checkbox checked" @click="toggleTask(task.id)">
              <Check />
            </div>
            <div class="task-content">
              <span class="task-title">{{ task.title }}</span>
              <div class="task-tags">
                <span v-for="tag in task.tags" :key="tag" class="task-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn" @click="deleteTask(task.id)">
                <Delete />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog :title="editingTask ? '编辑任务' : '添加任务'" v-model="showAddDialog" width="450px">
      <ElForm :model="form">
        <ElFormItem label="任务标题" required>
          <ElInput v-model="form.title" placeholder="请输入任务标题" />
        </ElFormItem>
        <ElFormItem label="任务描述">
          <ElInput v-model="form.description" type="textarea" placeholder="请输入任务描述" :rows="3" />
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElSelect v-model="form.priority">
            <ElOption label="高" value="high" />
            <ElOption label="中" value="medium" />
            <ElOption label="低" value="low" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="标签">
          <div class="tag-selector">
            <button
              v-for="tag in availableTags"
              :key="tag"
              :class="['tag-btn', { active: form.tags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              <Flag /> {{ tag }}
            </button>
          </div>
        </ElFormItem>
        <ElFormItem label="截止日期">
          <ElDatePicker v-model="form.dueDate" type="date" placeholder="选择日期" />
        </ElFormItem>
        <ElFormItem label="重复周期">
          <ElSelect v-model="form.repeat">
            <ElOption label="不重复" value="none" />
            <ElOption label="每天" value="daily" />
            <ElOption label="每周" value="weekly" />
            <ElOption label="每月" value="monthly" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddDialog = false">取消</ElButton>
        <ElButton type="primary" @click="saveTask">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.tasks-page {
  .tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .filters {
      display: flex;
      gap: 16px;

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-label {
          font-size: 14px;
          color: #606266;
        }
      }
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: #409eff;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        background: #66b1ff;
      }
    }
  }

  .tasks-content {
    .tasks-section {
      margin-bottom: 32px;

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

      .task-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        &.completed .task-card {
          opacity: 0.6;

          .task-title {
            text-decoration: line-through;
            color: #c0c4cc;
          }
        }

        .task-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.2s;

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .task-checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid #d9d9d9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            margin-top: 4px;
            color: #fff;

            &:hover {
              border-color: #409eff;
            }

            &.checked {
              background: #409eff;
              border-color: #409eff;
            }
          }

          .task-content {
            flex: 1;

            .task-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;

              .task-title {
                font-size: 16px;
                font-weight: 500;
                color: #303133;
              }

              .priority-tag {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid;
              }
            }

            .task-description {
              font-size: 14px;
              color: #606266;
              margin-bottom: 12px;
            }

            .task-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .task-tags {
                display: flex;
                gap: 6px;

                .task-tag {
                  font-size: 12px;
                  padding: 2px 6px;
                  background: #f0f0f0;
                  color: #606266;
                  border-radius: 4px;
                }
              }

              .task-date {
                font-size: 12px;
                color: #909399;
              }
            }
          }

          .task-actions {
            display: flex;
            gap: 8px;

            .action-btn {
              width: 32px;
              height: 32px;
              border: none;
              background: #f5f5f5;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #909399;

              &:hover {
                background: #e8e8e8;
                color: #409eff;
              }
            }
          }
        }
      }
    }
  }

  .tag-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: #fff;
      color: #606266;
      font-size: 12px;
      cursor: pointer;

      &.active {
        background: #ecf5ff;
        border-color: #409eff;
        color: #409eff;
      }
    }
  }
}
</style>
