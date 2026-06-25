export interface User {
  id: string
  username: string
  email: string
  studentId: string
  avatar: string
  name: string
  major: string
  grade: string
  campus: string
  isVerified: boolean
  createdAt: string
}

export interface Course {
  id: string
  name: string
  teacher: string
  room: string
  dayOfWeek: number
  startTime: string
  endTime: string
  color: string
  userId: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
  tags: string[]
  dueDate: string
  repeat: 'none' | 'daily' | 'weekly' | 'monthly'
  parentId: string | null
  children: Task[]
  userId: string
  groupId: string | null
  assigneeId: string | null
  createdAt: string
  updatedAt: string
}

export interface PomodoroRecord {
  id: string
  userId: string
  duration: number
  date: string
  taskId: string | null
  subject: string
}

export interface Group {
  id: string
  name: string
  type: 'course' | 'club' | 'competition' | 'other'
  description: string
  avatar: string
  inviteCode: string
  members: GroupMember[]
  createdAt: string
}

export interface GroupMember {
  userId: string
  user: User
  role: 'leader' | 'member'
  joinedAt: string
}

export interface GroupFile {
  id: string
  groupId: string
  name: string
  type: string
  size: number
  version: number
  uploadedBy: User
  uploadedAt: string
  path: string
  content: string
}

export interface GroupMeeting {
  id: string
  groupId: string
  title: string
  date: string
  startTime: string
  endTime: string
  agenda: string
  minutes: string
  creator: User
  createdAt: string
}

export interface CampusAnnouncement {
  id: string
  title: string
  content: string
  type: 'activity' | 'competition' | 'lecture' | 'other'
  publisher: User
  createdAt: string
  deadline?: string
  tags: string[]
}

export interface TeamUpPost {
  id: string
  title: string
  description: string
  type: 'competition' | 'course' | 'study' | 'club'
  publisher: User
  tags: string[]
  requiredMembers: number
  currentMembers: number
  createdAt: string
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  friend: User
  status: 'pending' | 'accepted'
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  sender: User
  receiverId: string
  content: string
  type: 'system' | 'task' | 'group' | 'friend'
  read: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'task-due' | 'class-reminder' | 'group-update' | 'friend-request' | 'system'
  title: string
  content: string
  read: boolean
  createdAt: string
}
