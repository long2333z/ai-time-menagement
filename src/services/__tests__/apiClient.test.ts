import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getToken, setToken, removeToken, isTokenExpired } from '../apiClient'

describe('API Client - Token Management', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Token Storage', () => {
    it('should store token correctly', () => {
      const testToken = 'test-jwt-token'
      setToken(testToken)
      
      const storedToken = getToken()
      expect(storedToken).toBe(testToken)
    })

    it('should remove token correctly', () => {
      const testToken = 'test-jwt-token'
      setToken(testToken)
      
      removeToken()
      
      const storedToken = getToken()
      expect(storedToken).toBeNull()
    })

    it('should return null when no token exists', () => {
      const token = getToken()
      expect(token).toBeNull()
    })
  })

  describe('Token Expiry', () => {
    it('should not be expired immediately after setting', () => {
      setToken('test-token', 24 * 60 * 60 * 1000) // 24 hours
      
      const expired = isTokenExpired()
      expect(expired).toBe(false)
    })

    it('should be expired when expiry time has passed', () => {
      // 设置一个已过期的token
      const testToken = 'test-token'
      localStorage.setItem('auth_token', testToken)
      localStorage.setItem('token_expiry', (Date.now() - 1000).toString())
      
      const expired = isTokenExpired()
      expect(expired).toBe(true)
    })

    it('should be expired when no expiry time exists', () => {
      localStorage.setItem('auth_token', 'test-token')
      // 不设置expiry
      
      const expired = isTokenExpired()
      expect(expired).toBe(true)
    })

    it('should set custom expiry time', () => {
      const customExpiry = 1000 // 1 second
      setToken('test-token', customExpiry)
      
      // 立即检查应该未过期
      expect(isTokenExpired()).toBe(false)
      
      // 等待过期
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(isTokenExpired()).toBe(true)
          resolve(true)
        }, 1100)
      })
    })
  })

  describe('Token Cleanup', () => {
    it('should remove both token and expiry', () => {
      setToken('test-token')
      
      removeToken()
      
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('token_expiry')).toBeNull()
    })
  })
})

describe('API Client - Network Status', () => {
  it('should detect online status', () => {
    // 这个测试依赖于浏览器环境
    // 在测试环境中,navigator.onLine 默认为 true
    expect(navigator.onLine).toBeDefined()
  })
})
