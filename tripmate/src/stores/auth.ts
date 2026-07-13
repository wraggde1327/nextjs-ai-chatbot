import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../types'
import { testUser } from '../data/mock'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  function login(username: string, password: string): boolean {
    if (username === 'Test' && password === '123') {
      user.value = testUser
      isAuthenticated.value = true
      localStorage.setItem('tripmate_auth', 'true')
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('tripmate_auth')
  }

  function checkAuth() {
    if (localStorage.getItem('tripmate_auth') === 'true') {
      user.value = testUser
      isAuthenticated.value = true
    }
  }

  return { user, isAuthenticated, login, logout, checkAuth }
})
