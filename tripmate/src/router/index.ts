import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../views/LoginPage.vue') },
  { path: '/home', name: 'Home', component: () => import('../views/HomePage.vue'), meta: { requiresAuth: true } },
  {
    path: '/trip/:tripId',
    component: () => import('../views/trip/TripTabs.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: (to) => `${to.path}/chat` },
      { path: 'chat', name: 'TripChat', component: () => import('../views/trip/ChatTab.vue') },
      { path: 'money', name: 'TripMoney', component: () => import('../views/trip/MoneyTab.vue') },
      { path: 'today', name: 'TripToday', component: () => import('../views/trip/TodayTab.vue') },
      { path: 'tasks', name: 'TripTasks', component: () => import('../views/trip/TasksTab.vue') },
      { path: 'info', name: 'TripInfo', component: () => import('../views/trip/InfoTab.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.checkAuth()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return '/home'
  }
})

export default router
