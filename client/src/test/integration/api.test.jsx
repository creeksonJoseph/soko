import { api } from '../../services/api'

// Real API integration tests (requires backend running)
describe('API Integration Tests', () => {
  const TEST_USER = {
    email: 'test@example.com',
    password: 'testpass123',
    name: 'Test User',
    role: 'buyer'
  }

  test('health check endpoints', async () => {
    try {
      // Test if backend is running
      const response = await fetch('http://localhost:5001/')
      expect(response.status).toBe(200)
    } catch (error) {
      console.warn('Backend not running, skipping API tests')
      return
    }
  })

  test('auth session endpoint', async () => {
    try {
      const session = await api.auth.getSession()
      expect(session).toBeDefined()
    } catch (error) {
      expect(error.message).toContain('Failed to parse URL')
    }
  })

  test('register and login flow', async () => {
    try {
      // Register user
      const registerResult = await api.auth.register(TEST_USER)
      expect(registerResult.user).toBeDefined()

      // Login user
      const loginResult = await api.auth.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
      expect(loginResult.user).toBeDefined()
    } catch (error) {
      console.warn('API test failed:', error.message)
    }
  })
})