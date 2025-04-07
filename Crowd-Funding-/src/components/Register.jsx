import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { authAPI } from '../api';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...userData } = formData;
      await authAPI.register(userData);
      
      // Show verification message instead of logging in
      setLoading(false);
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account before logging in.' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">First Name:</label>
          <input 
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block">Last Name:</label>
          <input 
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block">Email:</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block">Password:</label>
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block">Confirm Password:</label>
          <input 
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="border p-2 w-full"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block">Mobile:</label>
          <input 
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;
