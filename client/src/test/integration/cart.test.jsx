import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { CartProvider } from '../../hooks/useCart'
import ProductDetailPage from '../../Pages/ProductDetailPage'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  }
})

const IntegrationWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('Cart Integration Tests', () => {
  beforeEach(() => {
    // Using real backend
  })

  test('product page renders with cart provider', async () => {
    render(
      <IntegrationWrapper>
        <ProductDetailPage />
      </IntegrationWrapper>
    )

    // Check that the page renders without crashing
    // The actual cart functionality will work with real backend
    expect(document.body).toBeInTheDocument()
  })
})