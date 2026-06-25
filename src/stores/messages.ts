import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, Notification } from '@/types'
import { mockMessages, mockNotifications } from '@/data/mockData'

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<Message[]>([])
  const notifications = ref<Notification[]>([])

  const initMessages = () => {
    const saved = localStorage.getItem('messages')
    if (saved) {
      messages.value = JSON.parse(saved)
    } else {
      messages.value = [...mockMessages]
      localStorage.setItem('messages', JSON.stringify(messages.value))
    }
    notifications.value = [...mockNotifications]
  }

  const addMessage = (message: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    messages.value.push(newMessage)
    localStorage.setItem('messages', JSON.stringify(messages.value))
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    notifications.value.unshift(newNotification)
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  const unreadCount = () => {
    return notifications.value.filter(n => !n.read).length
  }

  return {
    messages,
    notifications,
    initMessages,
    addMessage,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount
  }
})
