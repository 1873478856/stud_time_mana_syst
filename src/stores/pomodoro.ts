import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PomodoroRecord } from '@/types'
import dayjs from 'dayjs'

export const usePomodoroStore = defineStore('pomodoro', () => {
  const records = ref<PomodoroRecord[]>([])
  const duration = ref(25)
  const shortBreak = ref(5)
  const longBreak = ref(15)

  const initRecords = () => {
    const saved = localStorage.getItem('pomodoroRecords')
    if (saved) {
      records.value = JSON.parse(saved)

      // 每周一清空上周的记录
      const now = dayjs()
      const currentDay = now.day() || 7 // 1-7, 周日=7
      const isMonday = currentDay === 1

      if (isMonday) {
        const weekStart = now.subtract(currentDay - 1, 'day').startOf('day')
        const oldLength = records.value.length
        records.value = records.value.filter(r => r.date >= weekStart.format('YYYY-MM-DD'))

        if (records.value.length !== oldLength) {
          localStorage.setItem('pomodoroRecords', JSON.stringify(records.value))
        }
      }
    }
    const savedConfig = localStorage.getItem('pomodoroConfig')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      duration.value = config.duration || 25
      shortBreak.value = config.shortBreak || 5
      longBreak.value = config.longBreak || 15
    }
  }

  const addRecord = (record: Omit<PomodoroRecord, 'id'>) => {
    const newRecord: PomodoroRecord = {
      ...record,
      id: Date.now().toString()
    }
    records.value.push(newRecord)
    localStorage.setItem('pomodoroRecords', JSON.stringify(records.value))
  }

  const saveConfig = () => {
    const config = { duration: duration.value, shortBreak: shortBreak.value, longBreak: longBreak.value }
    localStorage.setItem('pomodoroConfig', JSON.stringify(config))
  }

  const todayMinutes = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return records.value
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + r.duration, 0)
  })

  const weekMinutes = computed(() => {
    const now = dayjs()
    const currentDay = now.day() || 7
    const weekStart = now.subtract(currentDay - 1, 'day').startOf('day')
    return records.value
      .filter(r => r.date >= weekStart.format('YYYY-MM-DD'))
      .reduce((sum, r) => sum + r.duration, 0)
  })

  const subjectStats = computed(() => {
    const stats: Record<string, number> = {}
    records.value.forEach(r => {
      stats[r.subject] = (stats[r.subject] || 0) + r.duration
    })
    return stats
  })

  return {
    records,
    duration,
    shortBreak,
    longBreak,
    initRecords,
    addRecord,
    saveConfig,
    todayMinutes,
    weekMinutes,
    subjectStats
  }
})
