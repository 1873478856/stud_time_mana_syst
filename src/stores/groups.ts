import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Group, GroupFile, GroupMeeting, Task } from '@/types'
import { mockGroups, mockGroupFiles, mockGroupMeetings } from '@/data/mockData'

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const files = ref<GroupFile[]>([])
  const meetings = ref<GroupMeeting[]>([])
  const groupTasks = ref<Task[]>([])

  const initGroups = () => {
    const saved = localStorage.getItem('groups')
    if (saved) {
      groups.value = JSON.parse(saved)
    } else {
      groups.value = [...mockGroups]
      localStorage.setItem('groups', JSON.stringify(groups.value))
    }
    const savedFiles = localStorage.getItem('groupFiles')
    if (savedFiles) {
      files.value = JSON.parse(savedFiles)
      files.value.forEach(file => {
        if (!file.content) {
          file.content = ''
        }
      })
      localStorage.setItem('groupFiles', JSON.stringify(files.value))
    } else {
      files.value = [...mockGroupFiles]
      localStorage.setItem('groupFiles', JSON.stringify(files.value))
    }
    meetings.value = [...mockGroupMeetings]
    const savedTasks = localStorage.getItem('groupTasks')
    if (savedTasks) {
      groupTasks.value = JSON.parse(savedTasks)
    }
  }

  const createGroup = (group: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    groups.value.push(newGroup)
    localStorage.setItem('groups', JSON.stringify(groups.value))
    return newGroup
  }

  const updateGroup = (id: string, updates: Partial<Group>) => {
    const index = groups.value.findIndex(g => g.id === id)
    if (index !== -1) {
      groups.value[index] = { ...groups.value[index], ...updates }
      localStorage.setItem('groups', JSON.stringify(groups.value))
    }
  }

  const deleteGroup = (id: string) => {
    groups.value = groups.value.filter(g => g.id !== id)
    localStorage.setItem('groups', JSON.stringify(groups.value))
  }

  const addMember = (groupId: string, userId: string) => {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.members.push({
        userId,
        user: {
          id: userId,
          username: 'new_member',
          email: '',
          studentId: '',
          avatar: '',
          name: '新成员',
          major: '',
          grade: '',
          campus: '',
          isVerified: false,
          createdAt: new Date().toISOString()
        },
        role: 'member',
        joinedAt: new Date().toISOString()
      })
      localStorage.setItem('groups', JSON.stringify(groups.value))
    }
  }

  const addGroupTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      children: []
    }
    groupTasks.value.push(newTask)
    localStorage.setItem('groupTasks', JSON.stringify(groupTasks.value))
    return newTask
  }

  const getGroupTasks = (groupId: string) => {
    return groupTasks.value.filter(t => t.groupId === groupId)
  }

  const getGroupFiles = (groupId: string) => {
    return files.value.filter(f => f.groupId === groupId)
  }

  const addGroupFile = (file: { 
    name: string
    groupId: string
    uploadedBy: string
    version: number
    size: number
    type: string
    content: string
  }) => {
    const newFile: GroupFile = {
      id: Date.now().toString(),
      groupId: file.groupId,
      name: file.name,
      type: file.type,
      size: file.size,
      version: file.version,
      uploadedBy: {
        id: file.uploadedBy,
        username: 'user',
        email: '',
        studentId: '',
        avatar: '',
        name: '用户',
        major: '',
        grade: '',
        campus: '',
        isVerified: false,
        createdAt: new Date().toISOString()
      },
      uploadedAt: new Date().toISOString(),
      path: `/files/${file.name}`,
      content: file.content
    }
    files.value.push(newFile)
    localStorage.setItem('groupFiles', JSON.stringify(files.value))
    return newFile
  }

  const getGroupMeetings = (groupId: string) => {
    return meetings.value.filter(m => m.groupId === groupId)
  }

  const deleteGroupFile = (fileId: string) => {
    files.value = files.value.filter(f => f.id !== fileId)
    localStorage.setItem('groupFiles', JSON.stringify(files.value))
  }

  return {
    groups,
    files,
    meetings,
    groupTasks,
    initGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    addGroupTask,
    addGroupFile,
    getGroupTasks,
    getGroupFiles,
    getGroupMeetings,
    deleteGroupFile
  }
})
