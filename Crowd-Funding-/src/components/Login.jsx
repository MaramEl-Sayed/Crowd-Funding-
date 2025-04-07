import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { authAPI } from '../api';

function Login() {
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setAuthState({
        isAuthenticated: true,
        user: null, // You would fetch user data here
        loading: false
      });
      
      navigate('/');
    } catch (err) {
      let errorMsg = err.message || 'Login failed';
      
      // Handle unverified accounts specifically
      if (err.response?.status === 401 && err.response?.data?.detail?.includes('not verified')) {
        errorMsg = 'Account not verified. Please check your email for verification link.';
      }
      
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {message && <div className="text-green-500 mb-4">{message}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block">Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
