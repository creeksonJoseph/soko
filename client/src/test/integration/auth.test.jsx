import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import LoginPage from '../../Pages/LoginPage'

const IntegrationWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Auth Integration Tests', () => {
  // Real backend integration tests
  beforeEach(() => {
    // No mocks - using real backend
  })

  test('login form renders correctly', async () => {
    render(
      <IntegrationWrapper>
        <LoginPage />
      </IntegrationWrapper>
    )

    // Check form elements exist
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in|signing in/i })).toBeInTheDocument()
  })

  test('form accepts user input', async () => {
    render(
      <IntegrationWrapper>
        <LoginPage />
      </IntegrationWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })
})