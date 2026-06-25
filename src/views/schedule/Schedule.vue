<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const scheduleStore = useScheduleStore()

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#B37FEB', '#722ED1']

const activeDay = ref(new Date().getDay() === 0 ? 7 : new Date().getDay())
const showAddDialog = ref(false)
const editingCourse = ref<typeof scheduleStore.courses[0] | null>(null)

const form = ref({
  name: '',
  teacher: '',
  room: '',
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '09:40',
  color: '#409EFF'
})

const todayCourses = computed(() => {
  return scheduleStore.getCoursesByDay(activeDay.value)
})

const timeSlots = [
  { start: '08:00', end: '09:40', label: '第一节课' },
  { start: '10:00', end: '11:40', label: '第二节课' },
  { start: '14:00', end: '15:40', label: '第三节课' },
  { start: '16:00', end: '17:40', label: '第四节课' },
  { start: '18:30', end: '20:10', label: '第五节课' },
  { start: '20:20', end: '22:00', label: '第六节课' }
]

const getCourseForSlot = (slot: { start: string; end: string }) => {
  return todayCourses.value.find(c => c.startTime === slot.start && c.endTime === slot.end)
}

const openAddDialog = () => {
  editingCourse.value = null
  form.value = {
    name: '',
    teacher: '',
    room: '',
    dayOfWeek: activeDay.value,
    startTime: '08:00',
    endTime: '09:40',
    color: '#409EFF'
  }
  showAddDialog.value = true
}

const openEditDialog = (course: typeof scheduleStore.courses[0]) => {
  editingCourse.value = course
  form.value = { ...course }
  showAddDialog.value = true
}

const saveCourse = () => {
  if (!form.value.name || !form.value.teacher) {
    ElMessage.warning('请填写课程名称和老师')
    return
  }

  if (editingCourse.value) {
    scheduleStore.updateCourse(editingCourse.value.id, form.value)
    ElMessage.success('课程更新成功')
  } else {
    scheduleStore.addCourse(form.value)
    ElMessage.success('课程添加成功')
  }

  showAddDialog.value = false
}

const deleteCourse = (id: string) => {
  scheduleStore.deleteCourse(id)
  ElMessage.success('课程删除成功')
}
</script>

<template>
  <div class="schedule-page">
    <div class="schedule-header">
      <div class="day-tabs">
        <button
          v-for="(day, index) in days"
          :key="index + 1"
          :class="['day-tab', { active: activeDay === index + 1 }]"
          @click="activeDay = index + 1"
        >
          {{ day }}
        </button>
      </div>
      <button class="add-btn" @click="openAddDialog">
        <Plus /> 添加课程
      </button>
    </div>

    <div class="schedule-container">
      <div class="time-column">
        <div v-for="slot in timeSlots" :key="slot.start" class="time-slot">
          <div class="time-label">{{ slot.start }}</div>
          <div class="time-label">{{ slot.end }}</div>
        </div>
      </div>

      <div class="course-column">
        <div v-for="slot in timeSlots" :key="slot.start" class="course-slot">
          <div
            v-if="getCourseForSlot(slot)"
            class="course-card"
            :style="{ backgroundColor: getCourseForSlot(slot)?.color + '15', borderColor: getCourseForSlot(slot)?.color }"
          >
            <div class="course-header">
              <span class="course-name">{{ getCourseForSlot(slot)?.name }}</span>
              <div class="course-actions">
                <button class="action-btn" @click="openEditDialog(getCourseForSlot(slot)!)">
                  <Edit />
                </button>
                <button class="action-btn" @click="deleteCourse(getCourseForSlot(slot)!.id)">
                  <Delete />
                </button>
              </div>
            </div>
            <div class="course-info">
              <span>{{ getCourseForSlot(slot)?.teacher }}</span>
              <span>{{ getCourseForSlot(slot)?.room }}</span>
            </div>
          </div>
          <div v-else class="empty-slot">
            <button class="add-slot-btn" @click="openAddDialog">添加课程</button>
          </div>
        </div>
      </div>
    </div>

    <ElDialog :title="editingCourse ? '编辑课程' : '添加课程'" v-model="showAddDialog" width="400px">
      <ElForm :model="form">
        <ElFormItem label="课程名称">
          <ElInput v-model="form.name" placeholder="请输入课程名称" />
        </ElFormItem>
        <ElFormItem label="任课老师">
          <ElInput v-model="form.teacher" placeholder="请输入老师姓名" />
        </ElFormItem>
        <ElFormItem label="教室地点">
          <ElInput v-model="form.room" placeholder="请输入教室编号" />
        </ElFormItem>
        <ElFormItem label="星期">
          <ElSelect v-model="form.dayOfWeek">
            <ElOption v-for="(day, index) in days" :key="index + 1" :label="day" :value="index + 1" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="开始时间">
          <ElSelect v-model="form.startTime">
            <ElOption v-for="slot in timeSlots" :key="slot.start" :label="slot.start" :value="slot.start" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="结束时间">
          <ElSelect v-model="form.endTime">
            <ElOption v-for="slot in timeSlots" :key="slot.end" :label="slot.end" :value="slot.end" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="课程颜色">
          <div class="color-picker">
            <button
              v-for="color in colors"
              :key="color"
              :class="['color-btn', { active: form.color === color }]"
              :style="{ backgroundColor: color }"
              @click="form.color = color"
            ></button>
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddDialog = false">取消</ElButton>
        <ElButton type="primary" @click="saveCourse">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.schedule-page {
  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .day-tabs {
      display: flex;
      gap: 8px;

      .day-tab {
        padding: 8px 16px;
        border-radius: 8px;
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

  .schedule-container {
    display: flex;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .time-column {
      width: 80px;
      background: #fafafa;
      border-right: 1px solid #e6e6e6;

      .time-slot {
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid #e6e6e6;

        .time-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .course-column {
      flex: 1;

      .course-slot {
        height: 100px;
        border-bottom: 1px solid #e6e6e6;
        position: relative;

        .course-card {
          margin: 8px;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid;
          height: calc(100% - 16px);

          .course-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;

            .course-name {
              font-weight: 600;
              color: #303133;
            }

            .course-actions {
              display: flex;
              gap: 4px;

              .action-btn {
                width: 24px;
                height: 24px;
                border: none;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #909399;

                &:hover {
                  background: rgba(0, 0, 0, 0.1);
                  color: #409eff;
                }
              }
            }
          }

          .course-info {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #909399;
          }
        }

        .empty-slot {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .add-slot-btn {
            padding: 6px 12px;
            border: 1px dashed #d9d9d9;
            background: transparent;
            border-radius: 4px;
            color: #909399;
            font-size: 12px;
            cursor: pointer;

            &:hover {
              border-color: #409eff;
              color: #409eff;
            }
          }
        }
      }
    }
  }

  .color-picker {
    display: flex;
    gap: 12px;

    .color-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;

      &.active {
        border-color: #303133;
      }
    }
  }
}
</style>
