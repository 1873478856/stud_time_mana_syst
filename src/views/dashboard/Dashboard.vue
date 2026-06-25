<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { useTasksStore } from '@/stores/tasks'
import { usePomodoroStore } from '@/stores/pomodoro'
import { useGroupsStore } from '@/stores/groups'
import { useMessagesStore } from '@/stores/messages'
import { useRouter } from 'vue-router'
import {
  ElCard,
  ElStatistic,
  ElRow,
  ElCol,
  ElTag,
  ElTimeline,
  ElButton
} from 'element-plus'
import {
  Clock,
  Checked,
  Reading,
  User,
  Warning,
  ArrowRight
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const scheduleStore = useScheduleStore()
const tasksStore = useTasksStore()
const pomodoroStore = usePomodoroStore()
const groupsStore = useGroupsStore()
const messagesStore = useMessagesStore()

const today = dayjs()
const currentDay = today.day() === 0 ? 7 : today.day()

const todayCourses = computed(() => {
  return scheduleStore.getCoursesByDay(currentDay)
})

const pendingTasks = computed(() => {
  return tasksStore.getPendingTasks().slice(0, 5)
})

const highPriorityTasks = computed(() => {
  return tasksStore.getTasksByPriority('high').filter(t => t.status !== 'completed')
})

const upcomingMeetings = computed(() => {
  return groupsStore.meetings.filter(m => dayjs(m.date).isAfter(today, 'day')).slice(0, 3)
})

const greeting = computed(() => {
  const hour = today.hour()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const weekMinutes = computed(() => {
  const now = dayjs()
  const currentDay = now.day() || 7 // 1-7, 周日=7
  const weekStart = now.subtract(currentDay - 1, 'day').startOf('day')

  return weekDays.map((_, index) => {
    const dayDate = weekStart.add(index, 'day')
    const dateStr = dayDate.format('YYYY-MM-DD')
    return pomodoroStore.records
      .filter(r => r.date === dateStr)
      .reduce((sum, r) => sum + r.duration, 0)
  })
})

onMounted(() => {
  scheduleStore.initCourses()
  tasksStore.initTasks()
  pomodoroStore.initRecords()
  groupsStore.initGroups()
  messagesStore.initMessages()
})
</script>

<template>
  <div class="dashboard">
    <div class="greeting">
      <div class="greeting-content">
        <h1>{{ greeting }}，准备好开始新的一天了吗？</h1>
        <p>{{ today.format('YYYY年MM月DD日') }} {{ ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][currentDay - 1] }}</p>
      </div>
      <div class="greeting-stats">
        <div class="stat-badge">
          <Clock /> 今日专注 {{ pomodoroStore.todayMinutes }}分钟
        </div>
        <div class="stat-badge">
          <Checked /> 待办 {{ pendingTasks.length }}项
        </div>
      </div>
    </div>
    
    <ElRow :gutter="20">
      <ElCol :span="6">
        <ElCard class="stat-card focus-card">
          <div class="stat-icon"><Clock /></div>
          <ElStatistic title="今日专注" :value="pomodoroStore.todayMinutes" suffix="分钟" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card task-card">
          <div class="stat-icon"><Checked /></div>
          <ElStatistic title="待办任务" :value="pendingTasks.length" suffix="项" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card course-card">
          <div class="stat-icon"><Reading /></div>
          <ElStatistic title="今日课程" :value="todayCourses.length" suffix="节" />
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card group-card">
          <div class="stat-icon"><User /></div>
          <ElStatistic title="参与小组" :value="groupsStore.groups.length" suffix="个" />
        </ElCard>
      </ElCol>
    </ElRow>
    
    <ElRow :gutter="20" style="margin-top: 20px;">
      <ElCol :span="8">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">今日课程</span>
              <ElButton type="primary" text @click="router.push('/schedule')">
                <ArrowRight /> 查看课表
              </ElButton>
            </div>
          </template>
          <div v-if="todayCourses.length === 0" class="empty-tip">
            <Reading style="font-size: 48px; color: #c0c4cc;" />
            <p>今天没有课程安排</p>
          </div>
          <div v-else class="course-list">
            <div
              v-for="course in todayCourses"
              :key="course.id"
              class="course-item"
              :style="{ borderLeftColor: course.color }"
            >
              <div class="course-time">{{ course.startTime }} - {{ course.endTime }}</div>
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-detail">{{ course.teacher }} · {{ course.room }}</div>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      
      <ElCol :span="8">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">待办任务</span>
              <ElButton type="primary" text @click="router.push('/tasks')">
                <ArrowRight /> 查看全部
              </ElButton>
            </div>
          </template>
          <div v-if="pendingTasks.length === 0" class="empty-tip">
            <Checked style="font-size: 48px; color: #c0c4cc;" />
            <p>暂无待办任务</p>
          </div>
          <div v-else class="task-list">
            <div
              v-for="task in pendingTasks"
              :key="task.id"
              class="task-item"
            >
              <ElTag
                :type="{ high: 'danger', medium: 'warning', low: 'info' }[task.priority] as 'danger' | 'warning' | 'info'"
                size="small"
              >
                {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}
              </ElTag>
              <span class="task-title">{{ task.title }}</span>
              <span class="task-date">{{ dayjs(task.dueDate).format('MM-DD') }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>
      
      <ElCol :span="8">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">即将到来</span>
            </div>
          </template>
          <ElTimeline>
            <ElTimeline.Item
              v-for="meeting in upcomingMeetings"
              :key="meeting.id"
              :timestamp="meeting.date"
            >
              <div class="meeting-item">
                <div class="meeting-title">{{ meeting.title }}</div>
                <div class="meeting-time">{{ meeting.startTime }} - {{ meeting.endTime }}</div>
              </div>
            </ElTimeline.Item>
            <ElTimeline.Item v-if="highPriorityTasks.length > 0" timestamp="高优先级任务">
              <div v-for="task in highPriorityTasks" :key="task.id" class="high-task">
                <Warning style="color: #f56c6c;" />
                <span>{{ task.title }}</span>
              </div>
            </ElTimeline.Item>
          </ElTimeline>
        </ElCard>
      </ElCol>
    </ElRow>
    
    <ElRow :gutter="20" style="margin-top: 20px;">
      <ElCol :span="24">
        <ElCard class="section-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">本周专注统计</span>
              <ElButton type="primary" text @click="router.push('/stats')">
                <ArrowRight /> 详细统计
              </ElButton>
            </div>
          </template>
          <div class="chart-placeholder">
            <div class="bar-chart">
              <div v-for="(val, index) in weekMinutes" :key="weekDays[index]" class="bar-item">
                <div class="bar-value">{{ val }}分钟</div>
                <div class="bar" :style="{ height: Math.max(val, 4) + 'px' }"></div>
                <div class="bar-label">{{ weekDays[index] }}</div>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .greeting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 12px;
    color: #fff;

    .greeting-content {
      h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        opacity: 0.9;
      }
    }

    .greeting-stats {
      display: flex;
      gap: 16px;

      .stat-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        font-size: 14px;
      }
    }
  }

  .stat-card {
    position: relative;
    overflow: hidden;

    .stat-icon {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
    }

    &.focus-card .stat-icon { background: linear-gradient(135deg, #409eff, #66b1ff); }
    &.task-card .stat-icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
    &.course-card .stat-icon { background: linear-gradient(135deg, #e6a23c, #ebb563); }
    &.group-card .stat-icon { background: linear-gradient(135deg, #f56c6c, #f78989); }

    :deep(.el-statistic__content) {
      font-size: 28px;
      font-weight: 600;
    }

    :deep(.el-statistic__suffix) {
      font-size: 14px;
      color: #909399;
    }
  }

  .section-card {
    height: 100%;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .empty-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #c0c4cc;

    p {
      margin-top: 12px;
      font-size: 14px;
    }
  }

  .course-list {
    .course-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 8px;
      border-left: 4px solid;

      .course-time {
        color: #909399;
        font-size: 12px;
        white-space: nowrap;
      }

      .course-info {
        flex: 1;

        .course-name {
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .course-detail {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .task-list {
    .task-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      .task-title {
        flex: 1;
        font-size: 14px;
        color: #303133;
      }

      .task-date {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .meeting-item {
    .meeting-title {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }

    .meeting-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .high-task {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f56c6c;
    font-size: 14px;
  }

  .chart-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
  }

  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 32px;
    height: 240px;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;

    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .bar-value {
        font-size: 12px;
        color: #409eff;
        font-weight: 500;
      }

      .bar {
        width: 48px;
        background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
        border-radius: 4px 4px 0 0;
        transition: height 0.3s;
      }

      .bar-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
