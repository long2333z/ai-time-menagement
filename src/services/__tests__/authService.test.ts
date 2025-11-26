import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isAuthenticated, getCachedUser, logout } from '../authService'
import { getToken, setToken, removeToken } from '../apiClient'

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Authentication Status', () => {
    it('should return false when no token exists', () => {
      const authenticated = isAuthenticated()
      expect(authenticated).toBe(false)
    })

    it('should return true when token exists', () => {
      setToken('test-token')
      
      const authenticated = isAuthenticated()
      expect(authenticated).toBe(true)
    })

    it('should return false after logout', () => {
      setToken('test-token')
      expect(isAuthenticated()).toBe(true)
      
      logout()
      
      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('User Cache', () => {
    it('should return null when no cached user exists', () => {
      const user = getCachedUser()
      expect(user).toBeNull()
    })

    it('should return cached user when exists', () => {
      const testUser = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
      }
      
      localStorage.setItem('user_profile', JSON.stringify(testUser))
      
      const user = getCachedUser()
      expect(user).toEqual(testUser)
    })

    it('should return null when cached data is invalid', () => {
      localStorage.setItem('user_profile', 'invalid-json')
      
      const user = getCachedUser()
      expect(user).toBeNull()
    })
  })

  describe('Logout', () => {
    it('should clear token', () => {
      setToken('test-token')
      
      logout()
      
      expect(getToken()).toBeNull()
    })

    it('should clear user profile', () => {
      const testUser = {
        id: 'test-id',
        email: 'test@example.com',
      }
      localStorage.setItem('user_profile', JSON.stringify(testUser))
      
      logout()
      
      expect(localStorage.getItem('user_profile')).toBeNull()
    })

    it('should clear app state', () => {
      localStorage.setItem('app_state', 'some-state')
      
      logout()
      
      expect(localStorage.getItem('app_state')).toBeNull()
    })

    it('should clear all auth-related data', () => {
      setToken('test-token')
      localStorage.setItem('user_profile', JSON.stringify({ id: 'test' }))
      localStorage.setItem('app_state', 'state')
      
      logout()
      
      expect(getToken()).toBeNull()
      expect(localStorage.getItem('user_profile')).toBeNull()
      expect(localStorage.getItem('app_state')).toBeNull()
    })
  })

  describe('Token Validation', () => {
    it('should validate token format', () => {
      // 测试有效的JWT格式
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
      setToken(validToken)
      
      expect(isAuthenticated()).toBe(true)
    })

    it('should handle empty token', () => {
      setToken('')
      
      expect(isAuthenticated()).toBe(false)
    })
  })
})
