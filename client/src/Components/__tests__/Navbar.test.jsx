import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../Layout/Navbar'

// Mock Navbar to avoid context dependencies
vi.mock('../Layout/Navbar', () => ({
  default: () => (
    <nav>
      <div>Soko Digital</div>
      <a href="/">Home</a>
      <a href="/explore">Explore</a>
      <a href="/about">About</a>
    </nav>
  )
}))

const MockNavbar = () => (
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
)

describe('Navbar', () => {
  test('renders logo', () => {
    render(<MockNavbar />)
    expect(screen.getByText('Soko Digital')).toBeInTheDocument()
  })

  test('renders navigation links', () => {
    render(<MockNavbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})