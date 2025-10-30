import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Diamond } from 'lucide-react'

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle password reset logic here
    console.log('Reset password for:', email)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Diamond className="w-8 h-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold text-gray-900">SokoDigital</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Your Password?
            </h1>
            <p className="text-gray-600">
              No problem. Enter your email address below and we'll send you a link to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3"
              >
                Send Reset Link
              </button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  Back to log in
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link 
                to="/login" 
                className="inline-block text-primary hover:text-primary-hover font-medium"
              >
                Back to log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
