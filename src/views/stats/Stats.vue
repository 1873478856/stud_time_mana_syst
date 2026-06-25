<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePomodoroStore } from '@/stores/pomodoro'
import { useTasksStore } from '@/stores/tasks'
import { ElCard, ElRow, ElCol, ElStatistic } from 'element-plus'
import { Clock, Checked, TrendCharts, Aim } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const pomodoroStore = usePomodoroStore()
const tasksStore = useTasksStore()

const chartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)

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

const completedTasks = computed(() => tasksStore.getCompletedTasks().length)
const pendingTasks = computed(() => tasksStore.getPendingTasks().length)
const completionRate = computed(() => {
  const total = completedTasks.value + pendingTasks.value
  return total === 0 ? 0 : Math.round((completedTasks.value / total) * 100)
})

const weeklyGoal = ref(1200)
const weeklyProgress = computed(() => Math.min(100, Math.round((pomodoroStore.weekMinutes / weeklyGoal.value) * 100)))

const subjectData = computed(() => {
  return Object.entries(pomodoroStore.subjectStats).map(([name, value]) => ({
    name,
    value
  }))
})

onMounted(() => {
  pomodoroStore.initRecords()
  tasksStore.initTasks()

  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: weekDays },
      yAxis: { type: 'value' },
      series: [{
        name: '专注时长',
        type: 'line',
        smooth: true,
        data: weekMinutes.value,
        areaStyle: { color: 'rgba(64, 158, 255, 0.1)' },
        lineStyle: { color: '#409EFF', width: 3 },
        itemStyle: { color: '#409EFF' }
      }]
    })

    // 监听数据变化，更新图表
    watch(weekMinutes, (newData) => {
      chart.setOption({
        series: [{ data: newData }]
      })
    })
  }

  if (pieChartRef.value) {
    const chart = echarts.init(pieChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: '5%', top: 'center' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: subjectData.value.length > 0 ? subjectData.value : [
          { value: 35, name: '数据结构' },
          { value: 25, name: '高等数学' },
          { value: 20, name: '英语' },
          { value: 20, name: '其他' }
        ]
      }]
    })

    // 监听数据变化，更新饼图
    watch(subjectData, (newData) => {
      chart.setOption({
        series: [{ data: newData.length > 0 ? newData : [
          { value: 35, name: '数据结构' },
          { value: 25, name: '高等数学' },
          { value: 20, name: '英语' },
          { value: 20, name: '其他' }
        ]}]
      })
    })
  }
})
</script>

<template>
  <div class="stats-page">
    <ElRow :gutter="20">
      <ElCol :span="6">
        <ElCard class="stat-card">
          <ElStatistic title="本周专注" :value="pomodoroStore.weekMinutes" suffix="分钟">
            <template #prefix><Clock /></template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card">
          <ElStatistic title="任务完成" :value="completedTasks" suffix="个">
            <template #prefix><Checked /></template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card">
          <ElStatistic title="完成率" :value="completionRate" suffix="%">
            <template #prefix><TrendCharts /></template>
          </ElStatistic>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard class="stat-card">
          <ElStatistic title="目标进度" :value="weeklyProgress" suffix="%">
            <template #prefix><Aim /></template>
          </ElStatistic>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" style="margin-top: 20px;">
      <ElCol :span="12">
        <ElCard title="本周专注趋势" class="chart-card">
          <div ref="chartRef" style="width: 100%; height: 300px;"></div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard title="学习分布" class="chart-card">
          <div ref="pieChartRef" style="width: 100%; height: 300px;"></div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" style="margin-top: 20px;">
      <ElCol :span="12">
        <ElCard title="本周学习目标" class="progress-card">
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: weeklyProgress + '%' }"></div>
            </div>
            <div class="progress-info">
              <span>已完成 {{ pomodoroStore.weekMinutes }} 分钟</span>
              <span>目标 {{ weeklyGoal }} 分钟</span>
            </div>
          </div>
          <div class="goal-tips">
            <p v-if="weeklyProgress >= 100">🎉 恭喜！本周学习目标已完成</p>
            <p v-else>继续加油，还需要 {{ weeklyGoal - pomodoroStore.weekMinutes }} 分钟完成目标</p>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard title="学习建议" class="suggestion-card">
          <div class="suggestion-list">
            <div class="suggestion-item">
              <div class="suggestion-icon">📚</div>
              <div class="suggestion-content">
                <h4>高效学习时段</h4>
                <p>根据数据分析，您在晚上8-10点学习效率最高，建议安排高强度学习任务。</p>
              </div>
            </div>
            <div class="suggestion-item">
              <div class="suggestion-icon">⏰</div>
              <div class="suggestion-content">
                <h4>拖延预警</h4>
                <p>您有3项任务即将截止，请尽快完成。</p>
              </div>
            </div>
            <div class="suggestion-item">
              <div class="suggestion-icon">⚖️</div>
              <div class="suggestion-content">
                <h4>科目平衡</h4>
                <p>建议增加英语学习时间，目前英语学习占比较低。</p>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<style lang="scss" scoped>
.stats-page {
  .stat-card {
    :deep(.el-statistic__content) {
      font-size: 28px;
      font-weight: 600;
    }
  }

  .chart-card {
    height: 100%;
  }

  .progress-card {
    .goal-progress {
      .progress-bar {
        height: 24px;
        background: #f0f0f0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 12px;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #409eff, #66b1ff);
          border-radius: 12px;
          transition: width 0.3s;
        }
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #606266;
      }
    }

    .goal-tips {
      margin-top: 16px;
      padding: 12px;
      background: #fafafa;
      border-radius: 8px;

      p {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .suggestion-card {
    .suggestion-list {
      .suggestion-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .suggestion-icon {
          font-size: 24px;
        }

        .suggestion-content {
          flex: 1;

          h4 {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          p {
            font-size: 13px;
            color: #606266;
          }
        }
      }
    }
  }
}
</style>
