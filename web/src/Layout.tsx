import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  backgroundColor: '#2c3e50',
  color: 'white',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
};

export const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  return (
      <div>
        <header style={headerStyle}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h2>GopherSocial</h2>
          </Link>
          <nav style={navStyle}>
            <Link to="/">Home</Link>
            {/* 3. Use the isAuthenticated flag for conditional rendering */}
            {isAuthenticated ? (
              <>
                <span>Welcome, User {user?.sub}!</span>
                {/* We will add logout functionality in a later step */}
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </header>
        <main style={{ padding: '1rem' }}>
          <Outlet />
        </main>
      </div>
    );
  };