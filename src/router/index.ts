import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue')
    },
    {
      path: '/',
      component: () => import('@/views/layout/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue')
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: () => import('@/views/schedule/Schedule.vue')
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/views/tasks/Tasks.vue')
        },
        {
          path: 'pomodoro',
          name: 'pomodoro',
          component: () => import('@/views/pomodoro/Pomodoro.vue')
        },
        {
          path: 'stats',
          name: 'stats',
          component: () => import('@/views/stats/Stats.vue')
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: () => import('@/views/calendar/Calendar.vue')
        },
        {
          path: 'groups',
          name: 'groups',
          component: () => import('@/views/groups/Groups.vue')
        },
        {
          path: 'group/:id',
          name: 'group-detail',
          component: () => import('@/views/groups/GroupDetail.vue')
        },
        {
          path: 'campus',
          name: 'campus',
          component: () => import('@/views/campus/Campus.vue')
        },
        {
          path: 'teamup',
          name: 'teamup',
          component: () => import('@/views/campus/TeamUp.vue')
        },
        {
          path: 'friends',
          name: 'friends',
          component: () => import('@/views/campus/Friends.vue')
        },
        {
          path: 'messages',
          name: 'messages',
          component: () => import('@/views/messages/Messages.vue')
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/messages/Notifications.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/Profile.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
