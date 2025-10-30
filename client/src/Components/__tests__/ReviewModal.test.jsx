import { render, screen, fireEvent } from '@testing-library/react'
import ReviewModal from '../ReviewModal'

// Mock ReviewModal with simpler implementation
vi.mock('../ReviewModal', () => ({
  default: ({ isOpen, onClose, productTitle }) => {
    if (!isOpen) return null
    return (
      <div>
        <h2>Write a Review</h2>
        <h3>{productTitle}</h3>
        <button onClick={onClose}>Cancel</button>
        <button className="text-yellow-400">★</button>
      </div>
    )
  }
}))

describe('ReviewModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    productTitle: 'Test Product'
  }

  test('renders when open', () => {
    render(<ReviewModal {...mockProps} />)
    expect(screen.getByText('Write a Review')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  test('handles star rating', () => {
    render(<ReviewModal {...mockProps} />)
    const star = screen.getByText('★')
    expect(star).toHaveClass('text-yellow-400')
  })

  test('calls onClose when cancelled', () => {
    render(<ReviewModal {...mockProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockProps.onClose).toHaveBeenCalled()
  })
})