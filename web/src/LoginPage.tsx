import React, { useState } from 'react';
import { API_URL } from './App';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  maxWidth: '400px',
  margin: '2rem auto',
};

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/authentication/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        // Login was successful
        const { data: token } = await response.json();

        login(token);

        alert('Login successful!');
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Login request failed:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  return (
    <div>
      <h1>Login to GopherSocial</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};