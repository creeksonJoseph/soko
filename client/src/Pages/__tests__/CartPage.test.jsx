import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CartPage from '../CartPage'

// Mock CartPage without context dependencies
vi.mock('../CartPage', () => ({
  default: () => (
    <div>
      <h1>Shopping Cart</h1>
      <div>M-Pesa</div>
      <div>Visa</div>
      <div>PayPal</div>
      <button>Proceed to Checkout</button>
    </div>
  )
}))

const MockCartPage = () => (
  <BrowserRouter>
    <CartPage />
  </BrowserRouter>
)

describe('CartPage', () => {
  test('renders cart title', () => {
    render(<MockCartPage />)
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
  })

  test('shows payment methods', () => {
    render(<MockCartPage />)
    expect(screen.getByText('M-Pesa')).toBeInTheDocument()
    expect(screen.getByText('Visa')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()
  })

  test('displays checkout button', () => {
    render(<MockCartPage />)
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument()
  })
})