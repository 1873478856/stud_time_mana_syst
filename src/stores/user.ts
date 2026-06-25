import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export interface RegisteredUser extends User {
  password: string
}

interface VerificationCode {
  code: string
  expiresAt: number
  email: string
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<RegisteredUser[]>([])
  const verificationCodes = ref<VerificationCode[]>([])
  const isLoggedIn = computed(() => !!currentUser.value)

  const initAuth = () => {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      try {
        currentUser.value = JSON.parse(saved)
      } catch {
        localStorage.removeItem('currentUser')
      }
    }
    const savedUsers = localStorage.getItem('registeredUsers')
    if (savedUsers) {
      try {
        users.value = JSON.parse(savedUsers)
      } catch {
        localStorage.removeItem('registeredUsers')
      }
    }
    const savedCodes = localStorage.getItem('verificationCodes')
    if (savedCodes) {
      try {
        verificationCodes.value = JSON.parse(savedCodes)
      } catch {
        localStorage.removeItem('verificationCodes')
      }
    }
  }

  const login = (user: User) => {
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const register = (user: RegisteredUser) => {
    users.value.push(user)
    localStorage.setItem('registeredUsers', JSON.stringify(users.value))
  }

  const validateLogin = (username: string, password: string): User | null => {
    const user = users.value.find(u => 
      (u.username === username || u.studentId === username) && u.password === password
    )
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    }
    return null
  }

  const sendVerificationCode = (email: string): boolean => {
    const user = users.value.find(u => u.email === email)
    if (!user) {
      return false
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000
    verificationCodes.value = verificationCodes.value.filter(v => v.email !== email)
    verificationCodes.value.push({ code, expiresAt, email })
    localStorage.setItem('verificationCodes', JSON.stringify(verificationCodes.value))
    console.log(`验证码已发送至 ${email}：${code}`)
    return true
  }

  const validateVerificationCode = (email: string, code: string): User | null => {
    const now = Date.now()
    verificationCodes.value = verificationCodes.value.filter(v => v.expiresAt > now)
    localStorage.setItem('verificationCodes', JSON.stringify(verificationCodes.value))
    const validCode = verificationCodes.value.find(v => v.email === email && v.code === code)
    if (validCode) {
      verificationCodes.value = verificationCodes.value.filter(v => v.email !== email)
      localStorage.setItem('verificationCodes', JSON.stringify(verificationCodes.value))
      const { password: _, ...userWithoutPassword } = users.value.find(u => u.email === email) as RegisteredUser
      return userWithoutPassword as User
    }
    return null
  }

  const updateProfile = (updates: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      const index = users.value.findIndex(u => u.id === currentUser.value?.id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updates }
        localStorage.setItem('registeredUsers', JSON.stringify(users.value))
      }
    }
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    initAuth,
    login,
    logout,
    register,
    validateLogin,
    sendVerificationCode,
    validateVerificationCode,
    updateProfile
  }
})
