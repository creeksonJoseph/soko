import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SimpleNav = () => {
  const { user, logout } = useAuth()

  return (
    <nav style={{ 
      padding: '10px 20px', 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ marginRight: '20px', textDecoration: 'none' }}>Home</Link>
        <Link to="/products" style={{ marginRight: '20px', textDecoration: 'none' }}>Products</Link>
      </div>
      
      <div>
        {user ? (
          <div>
            <span style={{ marginRight: '15px' }}>Welcome, {user.name || user.email}</span>
            <button 
              onClick={logout}
              style={{ 
                padding: '5px 10px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ marginRight: '10px', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default SimpleNav