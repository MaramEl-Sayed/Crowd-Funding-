import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { authAPI } from '../api';

function UserProfile() {
  const { authState, setAuthState } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoading(true);
    authAPI.logout()
      .then(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
        navigate('/');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Logout failed');
        setLoading(false);
      });
  };

  const handleDeleteAccount = () => {
    setError('Account deletion is currently unavailable. Please contact support.');
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {authState.user ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Name:</h3>
            <p>{authState.user.firstName} {authState.user.lastName}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email:</h3>
            <p>{authState.user.email}</p>
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <div className="mt-6 space-x-4">
        <button 
          onClick={handleLogout}
          className="bg-blue-500 text-white p-2 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Logout'}
        </button>
        <button 
          onClick={handleDeleteAccount}
          className="bg-red-500 text-white p-2 disabled:bg-red-300"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
