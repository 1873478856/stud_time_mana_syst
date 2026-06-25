import type { User, Course, Task, Group, GroupFile, GroupMeeting, CampusAnnouncement, TeamUpPost, Friend, Message, Notification } from '@/types'

export const mockUser: User = {
  id: '1',
  username: 'zhangsan',
  email: 'zhangsan@stu.edu.cn',
  studentId: '2022001',
  avatar: '',
  name: '张三',
  major: '计算机科学与技术',
  grade: '2022级',
  campus: '东校区',
  isVerified: true,
  createdAt: '2022-09-01T00:00:00Z'
}

export const mockUsers: User[] = [
  mockUser,
  {
    id: '2',
    username: 'lisi',
    email: 'lisi@stu.edu.cn',
    studentId: '2022002',
    avatar: '',
    name: '李四',
    major: '软件工程',
    grade: '2022级',
    campus: '西校区',
    isVerified: true,
    createdAt: '2022-09-01T00:00:00Z'
  },
  {
    id: '3',
    username: 'wangwu',
    email: 'wangwu@stu.edu.cn',
    studentId: '2022003',
    avatar: '',
    name: '王五',
    major: '人工智能',
    grade: '2022级',
    campus: '东校区',
    isVerified: true,
    createdAt: '2022-09-01T00:00:00Z'
  }
]

export const mockCourses: Course[] = [
  { id: '1', name: '高等数学', teacher: '李教授', room: 'A101', dayOfWeek: 1, startTime: '08:00', endTime: '09:40', color: '#409EFF', userId: '1' },
  { id: '2', name: '大学英语', teacher: '张老师', room: 'B203', dayOfWeek: 1, startTime: '10:00', endTime: '11:40', color: '#67C23A', userId: '1' },
  { id: '3', name: '数据结构', teacher: '王教授', room: 'C301', dayOfWeek: 2, startTime: '08:00', endTime: '09:40', color: '#E6A23C', userId: '1' },
  { id: '4', name: '计算机网络', teacher: '赵教授', room: 'D402', dayOfWeek: 2, startTime: '14:00', endTime: '15:40', color: '#F56C6C', userId: '1' },
  { id: '5', name: '操作系统', teacher: '刘教授', room: 'C301', dayOfWeek: 3, startTime: '08:00', endTime: '09:40', color: '#909399', userId: '1' },
  { id: '6', name: '软件工程', teacher: '孙教授', room: 'E501', dayOfWeek: 3, startTime: '10:00', endTime: '11:40', color: '#B37FEB', userId: '1' },
  { id: '7', name: '数据库原理', teacher: '周教授', room: 'D402', dayOfWeek: 4, startTime: '08:00', endTime: '09:40', color: '#409EFF', userId: '1' },
  { id: '8', name: '算法设计', teacher: '吴教授', room: 'C301', dayOfWeek: 5, startTime: '14:00', endTime: '15:40', color: '#67C23A', userId: '1' }
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: '完成数据结构作业',
    description: '第5章课后习题1-10题',
    priority: 'high',
    status: 'in-progress',
    tags: ['作业'],
    dueDate: '2024-03-15',
    repeat: 'none',
    parentId: null,
    children: [],
    userId: '1',
    groupId: null,
    assigneeId: null,
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-12T00:00:00Z'
  },
  {
    id: '2',
    title: '复习计算机网络',
    description: '复习第3-4章，准备下周测验',
    priority: 'medium',
    status: 'pending',
    tags: ['复习'],
    dueDate: '2024-03-18',
    repeat: 'none',
    parentId: null,
    children: [],
    userId: '1',
    groupId: null,
    assigneeId: null,
    createdAt: '2024-03-11T00:00:00Z',
    updatedAt: '2024-03-11T00:00:00Z'
  },
  {
    id: '3',
    title: '背单词',
    description: '每日背50个单词',
    priority: 'low',
    status: 'completed',
    tags: ['复习'],
    dueDate: '2024-03-15',
    repeat: 'daily',
    parentId: null,
    children: [],
    userId: '1',
    groupId: null,
    assigneeId: null,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '4',
    title: '社团活动策划',
    description: '计算机协会春季招新活动策划书',
    priority: 'medium',
    status: 'pending',
    tags: ['社团'],
    dueDate: '2024-03-20',
    repeat: 'none',
    parentId: null,
    children: [],
    userId: '1',
    groupId: null,
    assigneeId: null,
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '5',
    title: '兼职面试',
    description: '互联网公司技术岗面试',
    priority: 'high',
    status: 'pending',
    tags: ['兼职'],
    dueDate: '2024-03-17',
    repeat: 'none',
    parentId: null,
    children: [],
    userId: '1',
    groupId: null,
    assigneeId: null,
    createdAt: '2024-03-12T00:00:00Z',
    updatedAt: '2024-03-12T00:00:00Z'
  }
]

export const mockGroups: Group[] = [
  {
    id: '1',
    name: '软件工程课程组',
    type: 'course',
    description: '2022级软件工程课程大作业小组',
    avatar: '',
    inviteCode: 'SE2022',
    members: [
      { userId: '1', user: mockUsers[0], role: 'leader', joinedAt: '2024-02-01T00:00:00Z' },
      { userId: '2', user: mockUsers[1], role: 'member', joinedAt: '2024-02-02T00:00:00Z' },
      { userId: '3', user: mockUsers[2], role: 'member', joinedAt: '2024-02-03T00:00:00Z' }
    ],
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    name: '计算机协会',
    type: 'club',
    description: '学校计算机协会官方小组',
    avatar: '',
    inviteCode: 'CSCLUB',
    members: [
      { userId: '1', user: mockUsers[0], role: 'member', joinedAt: '2024-01-15T00:00:00Z' },
      { userId: '3', user: mockUsers[2], role: 'leader', joinedAt: '2024-01-10T00:00:00Z' }
    ],
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    name: '数模竞赛队',
    type: 'competition',
    description: '2024年全国大学生数学建模竞赛参赛队伍',
    avatar: '',
    inviteCode: 'MCM2024',
    members: [
      { userId: '1', user: mockUsers[0], role: 'member', joinedAt: '2024-03-01T00:00:00Z' },
      { userId: '2', user: mockUsers[1], role: 'member', joinedAt: '2024-03-01T00:00:00Z' }
    ],
    createdAt: '2024-03-01T00:00:00Z'
  }
]

export const mockGroupFiles: GroupFile[] = [
  {
    id: '1',
    groupId: '1',
    name: '需求分析文档.pdf',
    type: 'application/pdf',
    size: 1024000,
    version: 1,
    uploadedBy: mockUsers[0],
    uploadedAt: '2024-02-10T00:00:00Z',
    path: '',
    content: ''
  },
  {
    id: '2',
    groupId: '1',
    name: '系统设计.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 2048000,
    version: 2,
    uploadedBy: mockUsers[1],
    uploadedAt: '2024-02-15T00:00:00Z',
    path: '',
    content: ''
  },
  {
    id: '3',
    groupId: '2',
    name: '招新策划书.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 512000,
    version: 1,
    uploadedBy: mockUsers[2],
    uploadedAt: '2024-02-20T00:00:00Z',
    path: '',
    content: ''
  }
]

export const mockGroupMeetings: GroupMeeting[] = [
  {
    id: '1',
    groupId: '1',
    title: '项目进度讨论',
    date: '2024-03-16',
    startTime: '14:00',
    endTime: '16:00',
    agenda: '1. 需求确认\n2. 分工安排\n3. 进度汇报',
    minutes: '',
    creator: mockUsers[0],
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '2',
    groupId: '2',
    title: '招新筹备会议',
    date: '2024-03-18',
    startTime: '18:00',
    endTime: '19:30',
    agenda: '1. 招新方案讨论\n2. 宣传物料准备\n3. 人员分工',
    minutes: '',
    creator: mockUsers[2],
    createdAt: '2024-03-12T00:00:00Z'
  }
]

export const mockAnnouncements: CampusAnnouncement[] = [
  {
    id: '1',
    title: '春季校园招聘会',
    content: '我校将于3月20日举办春季校园招聘会，届时将有50+企业到场招聘，欢迎同学们参加。',
    type: 'activity',
    publisher: mockUsers[0],
    createdAt: '2024-03-10T00:00:00Z',
    deadline: '2024-03-20',
    tags: ['招聘', '就业']
  },
  {
    id: '2',
    title: '数学建模竞赛报名',
    content: '2024年全国大学生数学建模竞赛开始报名，截止日期3月25日，感兴趣的同学请及时报名。',
    type: 'competition',
    publisher: mockUsers[2],
    createdAt: '2024-03-08T00:00:00Z',
    deadline: '2024-03-25',
    tags: ['竞赛', '数学']
  },
  {
    id: '3',
    title: '人工智能前沿讲座',
    content: '邀请清华大学教授来校做人工智能前沿技术讲座，时间：3月17日晚7点，地点：学术报告厅。',
    type: 'lecture',
    publisher: mockUsers[1],
    createdAt: '2024-03-12T00:00:00Z',
    tags: ['讲座', 'AI']
  },
  {
    id: '4',
    title: '校园十佳歌手大赛',
    content: '第十届校园十佳歌手大赛即将开赛，报名时间：3月15日-3月22日，欢迎热爱唱歌的同学参与。',
    type: 'activity',
    publisher: mockUsers[0],
    createdAt: '2024-03-14T00:00:00Z',
    deadline: '2024-03-22',
    tags: ['活动', '音乐']
  }
]

export const mockTeamUpPosts: TeamUpPost[] = [
  {
    id: '1',
    title: '数模竞赛组队',
    description: '寻找数学建模竞赛队友，要求：数学基础扎实，会编程，有责任心。',
    type: 'competition',
    publisher: mockUsers[0],
    tags: ['数模', '竞赛', '数学', '编程'],
    requiredMembers: 2,
    currentMembers: 1,
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '2',
    title: '软件工程大作业组队',
    description: '寻找软件工程课程大作业队友，需要前端和后端开发人员。',
    type: 'course',
    publisher: mockUsers[1],
    tags: ['课程', '编程', '前端', '后端'],
    requiredMembers: 3,
    currentMembers: 1,
    createdAt: '2024-03-11T00:00:00Z'
  },
  {
    id: '3',
    title: '考研自习搭伴',
    description: '寻找考研小伙伴一起自习，互相监督，共同进步。专业不限。',
    type: 'study',
    publisher: mockUsers[2],
    tags: ['考研', '学习', '自习'],
    requiredMembers: 4,
    currentMembers: 2,
    createdAt: '2024-03-12T00:00:00Z'
  },
  {
    id: '4',
    title: '电竞社团招新',
    description: '电竞社团招新啦！欢迎英雄联盟、王者荣耀、CSGO等各类游戏爱好者加入。',
    type: 'club',
    publisher: mockUsers[0],
    tags: ['社团', '电竞', '游戏'],
    requiredMembers: 10,
    currentMembers: 5,
    createdAt: '2024-03-13T00:00:00Z'
  }
]

export const mockFriends: Friend[] = [
  {
    id: '1',
    userId: '1',
    friendId: '2',
    friend: mockUsers[1],
    status: 'accepted',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    friendId: '3',
    friend: mockUsers[2],
    status: 'pending',
    createdAt: '2024-03-10T00:00:00Z'
  }
]

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    sender: mockUsers[1],
    receiverId: '1',
    content: '明天的小组会议记得参加哦',
    type: 'group',
    read: false,
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    senderId: '3',
    sender: mockUsers[2],
    receiverId: '1',
    content: '你好，我是王五，想加你为好友',
    type: 'friend',
    read: false,
    createdAt: '2024-03-14T15:30:00Z'
  },
  {
    id: '3',
    senderId: 'system',
    sender: mockUsers[0],
    receiverId: '1',
    content: '你的作业《数据结构》还有2天截止',
    type: 'task',
    read: true,
    createdAt: '2024-03-13T09:00:00Z'
  }
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'task-due',
    title: '作业即将截止',
    content: '《数据结构》作业还有2天截止，请尽快完成',
    read: false,
    createdAt: '2024-03-15T09:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'class-reminder',
    title: '上课提醒',
    content: '高等数学还有10分钟开始，教室A101',
    read: false,
    createdAt: '2024-03-15T07:50:00Z'
  },
  {
    id: '3',
    userId: '1',
    type: 'group-update',
    title: '小组任务更新',
    content: '李四完成了任务"系统设计"',
    read: true,
    createdAt: '2024-03-14T16:00:00Z'
  },
  {
    id: '4',
    userId: '1',
    type: 'friend-request',
    title: '好友请求',
    content: '王五请求添加你为好友',
    read: false,
    createdAt: '2024-03-14T15:30:00Z'
  }
]
