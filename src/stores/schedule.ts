import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course } from '@/types'
import { mockCourses } from '@/data/mockData'

export const useScheduleStore = defineStore('schedule', () => {
  const courses = ref<Course[]>([])

  const initCourses = () => {
    const saved = localStorage.getItem('courses')
    if (saved) {
      courses.value = JSON.parse(saved)
    } else {
      courses.value = [...mockCourses]
      localStorage.setItem('courses', JSON.stringify(courses.value))
    }
  }

  const addCourse = (course: Omit<Course, 'id' | 'userId'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      userId: '1'
    }
    courses.value.push(newCourse)
    localStorage.setItem('courses', JSON.stringify(courses.value))
  }

  const updateCourse = (id: string, updates: Partial<Course>) => {
    const index = courses.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...updates }
      localStorage.setItem('courses', JSON.stringify(courses.value))
    }
  }

  const deleteCourse = (id: string) => {
    courses.value = courses.value.filter(c => c.id !== id)
    localStorage.setItem('courses', JSON.stringify(courses.value))
  }

  const getCoursesByDay = (day: number) => {
    return courses.value
      .filter(c => c.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return {
    courses,
    initCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    getCoursesByDay
  }
})
