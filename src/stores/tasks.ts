import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types'
import { mockTasks } from '@/data/mockData'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])

  const initTasks = () => {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      tasks.value = JSON.parse(saved)
    } else {
      tasks.value = [...mockTasks]
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }
  }

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      children: []
    }
    tasks.value.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { 
        ...tasks.value[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }
  }

  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  const toggleTask = (id: string) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed'
      task.updatedAt = new Date().toISOString()
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    }
  }

  const getPendingTasks = () => {
    return tasks.value.filter(t => t.status !== 'completed')
  }

  const getCompletedTasks = () => {
    return tasks.value.filter(t => t.status === 'completed')
  }

  const getTasksByTag = (tag: string) => {
    return tasks.value.filter(t => t.tags.includes(tag))
  }

  const getTasksByPriority = (priority: string) => {
    return tasks.value.filter(t => t.priority === priority)
  }

  return {
    tasks,
    initTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getPendingTasks,
    getCompletedTasks,
    getTasksByTag,
    getTasksByPriority
  }
})
