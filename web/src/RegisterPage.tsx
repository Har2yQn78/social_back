import React, { useState } from 'react';
import { API_URL } from './App'; 

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  maxWidth: '400px',
  margin: '2rem auto',
};

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Send the POST request to our backend's registration endpoint
      const response = await fetch(`${API_URL}/authentication/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Convert our form data into a JSON string
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.status === 202) {
        // A 202 Accepted status means the user was created but needs to activate
        alert('Registration successful! Please check your email to activate your account.');
        // Here you could redirect the user or clear the form
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        // If the backend returned an error (e.g., duplicate email), display it
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Registration request failed:', error);
      alert('An error occurred during registration. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register for GopherSocial</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          // This onChange handler updates the username state every time the user types
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};