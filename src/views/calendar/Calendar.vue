<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { useTasksStore } from '@/stores/tasks'
import { useGroupsStore } from '@/stores/groups'
import { ElButton } from 'element-plus'
import { ArrowLeft, ArrowRight, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const scheduleStore = useScheduleStore()
const tasksStore = useTasksStore()
const groupsStore = useGroupsStore()

const currentDate = ref(dayjs())
const selectedDate = ref(dayjs())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const monthDays = computed(() => {
  const year = currentDate.value.year()
  const month = currentDate.value.month()
  const firstDay = dayjs(new Date(year, month, 1))
  const lastDay = dayjs(new Date(year, month + 1, 0))
  const days: dayjs.Dayjs[] = []
  
  for (let i = firstDay.day() - 1; i >= 0; i--) {
    days.push(firstDay.subtract(i + 1, 'day'))
  }
  
  for (let i = 1; i <= lastDay.date(); i++) {
    days.push(dayjs(new Date(year, month, i)))
  }
  
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push(lastDay.add(i, 'day'))
  }
  
  return days
})

const getDayCourses = (date: dayjs.Dayjs) => {
  const dayOfWeek = date.day() === 0 ? 7 : date.day()
  return scheduleStore.getCoursesByDay(dayOfWeek)
}

const getDayTasks = (date: dayjs.Dayjs) => {
  const dateStr = date.format('YYYY-MM-DD')
  return tasksStore.tasks.filter(t => t.dueDate === dateStr && t.status !== 'completed')
}

const getDayMeetings = (date: dayjs.Dayjs) => {
  const dateStr = date.format('YYYY-MM-DD')
  return groupsStore.meetings.filter(m => m.date === dateStr)
}

const prevMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month')
}

const selectDate = (date: dayjs.Dayjs) => {
  selectedDate.value = date
}

const isToday = (date: dayjs.Dayjs) => {
  return date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
}

const isSelected = (date: dayjs.Dayjs) => {
  return date.format('YYYY-MM-DD') === selectedDate.value.format('YYYY-MM-DD')
}

const isCurrentMonth = (date: dayjs.Dayjs) => {
  return date.month() === currentDate.value.month() && date.year() === currentDate.value.year()
}

const selectedDayEvents = computed(() => {
  return {
    courses: getDayCourses(selectedDate.value),
    tasks: getDayTasks(selectedDate.value),
    meetings: getDayMeetings(selectedDate.value)
  }
})
</script>

<template>
  <div class="calendar-page">
    <div class="calendar-header">
      <div class="header-nav">
        <ElButton @click="prevMonth"><ArrowLeft /></ElButton>
        <span class="current-month">{{ currentDate.format('YYYY年MM月') }}</span>
        <ElButton @click="nextMonth"><ArrowRight /></ElButton>
      </div>
      <ElButton type="primary" icon="Plus">添加日程</ElButton>
    </div>

    <div class="calendar-container">
      <div class="calendar-grid">
        <div class="week-header">
          <div v-for="day in weekDays" :key="day" class="day-header">{{ day }}</div>
        </div>
        <div class="days-grid">
          <div
            v-for="(date, index) in monthDays"
            :key="index"
            :class="[
              'day-cell',
              { 'other-month': !isCurrentMonth(date) },
              { 'today': isToday(date) },
              { 'selected': isSelected(date) }
            ]"
            @click="selectDate(date)"
          >
            <span class="day-number">{{ date.date() }}</span>
            <div class="day-events">
              <span
                v-for="course in getDayCourses(date).slice(0, 3)"
                :key="course.id"
                class="event-dot"
                :style="{ backgroundColor: course.color }"
                :title="course.name"
              ></span>
              <span
                v-for="task in getDayTasks(date).slice(0, 2)"
                :key="task.id"
                class="task-dot"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div class="event-sidebar">
        <div class="sidebar-header">
          <h3>{{ selectedDate.format('YYYY年MM月DD日') }} {{ ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][selectedDate.day()] }}</h3>
        </div>

        <div class="event-section">
          <h4>课程安排</h4>
          <div v-if="selectedDayEvents.courses.length === 0" class="empty-tip">无课程</div>
          <div v-else class="event-list">
            <div
              v-for="course in selectedDayEvents.courses"
              :key="course.id"
              class="event-item course"
              :style="{ borderLeftColor: course.color }"
            >
              <span class="event-time">{{ course.startTime }} - {{ course.endTime }}</span>
              <span class="event-title">{{ course.name }}</span>
              <span class="event-location">{{ course.room }}</span>
            </div>
          </div>
        </div>

        <div class="event-section">
          <h4>待办任务</h4>
          <div v-if="selectedDayEvents.tasks.length === 0" class="empty-tip">无任务</div>
          <div v-else class="event-list">
            <div
              v-for="task in selectedDayEvents.tasks"
              :key="task.id"
              class="event-item task"
            >
              <span class="event-title">{{ task.title }}</span>
              <span :class="['priority-tag', task.priority]">{{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}</span>
            </div>
          </div>
        </div>

        <div class="event-section">
          <h4>小组会议</h4>
          <div v-if="selectedDayEvents.meetings.length === 0" class="empty-tip">无会议</div>
          <div v-else class="event-list">
            <div
              v-for="meeting in selectedDayEvents.meetings"
              :key="meeting.id"
              class="event-item meeting"
            >
              <span class="event-time">{{ meeting.startTime }} - {{ meeting.endTime }}</span>
              <span class="event-title">{{ meeting.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar-page {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-nav {
      display: flex;
      align-items: center;
      gap: 16px;

      .current-month {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .calendar-container {
    display: flex;
    gap: 24px;

    .calendar-grid {
      flex: 1;
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .week-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: 12px;

        .day-header {
          text-align: center;
          font-size: 14px;
          color: #606266;
          padding: 8px 0;
        }
      }

      .days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;

        .day-cell {
          aspect-ratio: 1;
          background: #fafafa;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #e8f4fd;
          }

          &.other-month {
            opacity: 0.4;
          }

          &.today {
            background: #ecf5ff;

            .day-number {
              background: #409eff;
              color: #fff;
              border-radius: 50%;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }

          &.selected {
            background: #409eff;
            color: #fff;

            .day-number {
              color: #fff;
            }

            .event-dot {
              background: rgba(255, 255, 255, 0.8) !important;
            }

            .task-dot {
              background: rgba(255, 255, 255, 0.8);
            }
          }

          .day-number {
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
          }

          .day-events {
            display: flex;
            flex-wrap: wrap;
            gap: 2px;

            .event-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }

            .task-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #f56c6c;
            }
          }
        }
      }
    }

    .event-sidebar {
      width: 320px;
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      height: fit-content;

      .sidebar-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0f0f0;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .event-section {
        margin-bottom: 20px;

        h4 {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
          margin-bottom: 8px;
        }

        .empty-tip {
          font-size: 12px;
          color: #c0c4cc;
          padding: 8px;
        }

        .event-list {
          .event-item {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #fafafa;
            border-radius: 6px;
            margin-bottom: 6px;
            border-left: 3px solid;

            &.course {
              border-left-color: #409eff;
            }

            &.task {
              border-left-color: #e6a23c;
            }

            &.meeting {
              border-left-color: #67c23a;
            }

            .event-time {
              font-size: 12px;
              color: #909399;
            }

            .event-title {
              font-size: 13px;
              color: #303133;
              flex: 1;
            }

            .event-location {
              font-size: 12px;
              color: #909399;
            }

            .priority-tag {
              font-size: 11px;
              padding: 2px 6px;
              border-radius: 4px;

              &.high {
                background: #fef0f0;
                color: #f56c6c;
              }

              &.medium {
                background: #fdf6ec;
                color: #e6a23c;
              }

              &.low {
                background: #f0f9ff;
                color: #409eff;
              }
            }
          }
        }
      }
    }
  }
}
</style>
