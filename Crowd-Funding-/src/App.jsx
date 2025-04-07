import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import CreateProject from './components/CreateProject';
import ProjectDetails from './components/ProjectDetails';
import { authAPI } from './api';

export const AuthContext = createContext();

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.refreshToken({
          refresh: localStorage.getItem('refresh_token')
        });
        localStorage.setItem('access_token', response.data.access);
        setAuthState({
          isAuthenticated: true,
          user: null, // You would fetch user data here
          loading: false
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    if (localStorage.getItem('refresh_token')) {
      checkAuth();
    } else {
      setAuthState(prev => ({...prev, loading: false}));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;