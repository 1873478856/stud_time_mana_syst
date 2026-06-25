<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoro'
import { ElButton, ElSlider, ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Refresh, Coffee, Clock } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const pomodoroStore = usePomodoroStore()

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

const mode = ref<TimerMode>('pomodoro')
const isRunning = ref(false)
const timeLeft = ref(25 * 60)
const subject = ref('')
const intervalId = ref<number | null>(null)

const currentDuration = computed(() => {
  switch (mode.value) {
    case 'shortBreak': return pomodoroStore.shortBreak * 60
    case 'longBreak': return pomodoroStore.longBreak * 60
    default: return pomodoroStore.duration * 60
  }
})

const progress = computed(() => {
  return (timeLeft.value / currentDuration.value) * 100
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const modeLabel = computed(() => {
  switch (mode.value) {
    case 'shortBreak': return '短休息'
    case 'longBreak': return '长休息'
    default: return '专注时间'
  }
})

const startTimer = () => {
  if (isRunning.value) return
  isRunning.value = true
  
  intervalId.value = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stopTimer()
      if (mode.value === 'pomodoro') {
        pomodoroStore.addRecord({
          userId: '1',
          duration: pomodoroStore.duration,
          date: dayjs().format('YYYY-MM-DD'),
          subject: subject.value || '未分类',
          taskId: null
        })
        ElMessage.success('专注完成！')
      }
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

const stopTimer = () => {
  pauseTimer()
  timeLeft.value = currentDuration.value
}

const resetTimer = () => {
  stopTimer()
  mode.value = 'pomodoro'
  timeLeft.value = pomodoroStore.duration * 60
}

const switchMode = (newMode: TimerMode) => {
  stopTimer()
  mode.value = newMode
  timeLeft.value = currentDuration.value
}

const updateDuration = () => {
  pomodoroStore.saveConfig()
  if (!isRunning.value) {
    if (mode.value === 'pomodoro') {
      timeLeft.value = pomodoroStore.duration * 60
    } else if (mode.value === 'shortBreak') {
      timeLeft.value = pomodoroStore.shortBreak * 60
    } else {
      timeLeft.value = pomodoroStore.longBreak * 60
    }
  }
}

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<template>
  <div class="pomodoro-page">
    <div class="timer-section">
      <div class="mode-tabs">
        <button
          :class="['mode-tab', { active: mode === 'pomodoro' }]"
          @click="switchMode('pomodoro')"
        >
          <Clock /> 专注
        </button>
        <button
          :class="['mode-tab', { active: mode === 'shortBreak' }]"
          @click="switchMode('shortBreak')"
        >
          <Coffee /> 短休息
        </button>
        <button
          :class="['mode-tab', { active: mode === 'longBreak' }]"
          @click="switchMode('longBreak')"
        >
          <Coffee /> 长休息
        </button>
      </div>

      <div class="timer-display">
        <div class="timer-circle">
          <div class="timer-progress" :style="{ '--progress': progress + '%' }"></div>
          <div class="timer-content">
            <div class="timer-time">{{ formattedTime }}</div>
            <div class="timer-label">{{ modeLabel }}</div>
          </div>
        </div>
      </div>

      <div class="timer-controls">
        <ElButton type="default" size="large" @click="resetTimer">
          <Refresh /> 重置
        </ElButton>
        <ElButton
          type="primary"
          size="large"
          :icon="isRunning ? VideoPause : VideoPlay"
          @click="isRunning ? pauseTimer() : startTimer()"
        >
          {{ isRunning ? '暂停' : '开始' }}
        </ElButton>
      </div>

      <div class="subject-input">
        <input
          v-model="subject"
          type="text"
          placeholder="输入专注科目（如：数据结构）"
        />
      </div>
    </div>

    <div class="settings-section">
      <h3>时间设置</h3>
      <div class="setting-item">
        <label>专注时长：{{ pomodoroStore.duration }}分钟</label>
        <ElSlider v-model="pomodoroStore.duration" :min="1" :max="60" @change="updateDuration" />
      </div>
      <div class="setting-item">
        <label>短休息：{{ pomodoroStore.shortBreak }}分钟</label>
        <ElSlider v-model="pomodoroStore.shortBreak" :min="3" :max="15" @change="updateDuration" />
      </div>
      <div class="setting-item">
        <label>长休息：{{ pomodoroStore.longBreak }}分钟</label>
        <ElSlider v-model="pomodoroStore.longBreak" :min="10" :max="30" @change="updateDuration" />
      </div>
    </div>

    <div class="stats-section">
      <h3>今日统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ pomodoroStore.todayMinutes }}</div>
          <div class="stat-label">今日专注（分钟）</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ Math.floor(pomodoroStore.todayMinutes / pomodoroStore.duration) }}</div>
          <div class="stat-label">完成番茄数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ pomodoroStore.weekMinutes }}</div>
          <div class="stat-label">本周专注（分钟）</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pomodoro-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;

  .timer-section {
    width: 100%;
    max-width: 500px;
    text-align: center;
    margin-bottom: 40px;

    .mode-tabs {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 32px;

      .mode-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 20px;
        border-radius: 20px;
        border: 1px solid #d9d9d9;
        background: #fff;
        color: #606266;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          background: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }
    }

    .timer-display {
      margin-bottom: 32px;

      .timer-circle {
        position: relative;
        width: 300px;
        height: 300px;
        margin: 0 auto;

        .timer-progress {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(#409eff calc(var(--progress) * 1%), #e8e8e8 0);
          mask: radial-gradient(farthest-side, transparent calc(100% - 12px), #fff calc(100% - 12px));
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 12px), #fff calc(100% - 12px));
        }

        .timer-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;

          .timer-time {
            font-size: 56px;
            font-weight: 600;
            color: #303133;
            font-family: 'Courier New', monospace;
          }

          .timer-label {
            font-size: 16px;
            color: #909399;
            margin-top: 8px;
          }
        }
      }
    }

    .timer-controls {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .subject-input {
      input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        font-size: 14px;
        outline: none;

        &:focus {
          border-color: #409eff;
        }
      }
    }
  }

  .settings-section, .stats-section {
    width: 100%;
    max-width: 500px;
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }

    .setting-item {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .stat-item {
        text-align: center;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #409eff;
        }

        .stat-label {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>
