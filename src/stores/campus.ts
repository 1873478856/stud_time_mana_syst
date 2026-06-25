import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CampusAnnouncement, TeamUpPost, Friend } from '@/types'
import { mockAnnouncements, mockTeamUpPosts, mockFriends } from '@/data/mockData'

export const useCampusStore = defineStore('campus', () => {
  const announcements = ref<CampusAnnouncement[]>([])
  const teamUpPosts = ref<TeamUpPost[]>([])
  const friends = ref<Friend[]>([])

  const initData = () => {
    announcements.value = [...mockAnnouncements]
    teamUpPosts.value = [...mockTeamUpPosts]
    const saved = localStorage.getItem('friends')
    if (saved) {
      friends.value = JSON.parse(saved)
    } else {
      friends.value = [...mockFriends]
      localStorage.setItem('friends', JSON.stringify(friends.value))
    }
  }

  const addAnnouncement = (announcement: Omit<CampusAnnouncement, 'id' | 'createdAt'>) => {
    const newAnnouncement: CampusAnnouncement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    announcements.value.unshift(newAnnouncement)
  }

  const addTeamUpPost = (post: Omit<TeamUpPost, 'id' | 'createdAt'>) => {
    const newPost: TeamUpPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    teamUpPosts.value.unshift(newPost)
  }

  const addFriend = (friendId: string) => {
    const existing = friends.value.find(f => f.friendId === friendId)
    if (!existing) {
      const newFriend: Friend = {
        id: Date.now().toString(),
        userId: '1',
        friendId,
        friend: {
          id: friendId,
          username: 'friend_' + friendId,
          email: '',
          studentId: '',
          avatar: '',
          name: '好友',
          major: '',
          grade: '',
          campus: '',
          isVerified: false,
          createdAt: new Date().toISOString()
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      friends.value.push(newFriend)
      localStorage.setItem('friends', JSON.stringify(friends.value))
    }
  }

  const acceptFriend = (friendId: string) => {
    const friend = friends.value.find(f => f.friendId === friendId)
    if (friend) {
      friend.status = 'accepted'
      localStorage.setItem('friends', JSON.stringify(friends.value))
    }
  }

  const getAcceptedFriends = () => {
    return friends.value.filter(f => f.status === 'accepted')
  }

  const getPendingRequests = () => {
    return friends.value.filter(f => f.status === 'pending')
  }

  return {
    announcements,
    teamUpPosts,
    friends,
    initData,
    addAnnouncement,
    addTeamUpPost,
    addFriend,
    acceptFriend,
    getAcceptedFriends,
    getPendingRequests
  }
})
