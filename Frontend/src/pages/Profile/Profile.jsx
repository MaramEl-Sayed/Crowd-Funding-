import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { FaLock, FaBars, FaUser, FaCog, FaSignOutAlt, FaTimes, FaPencilAlt, FaChevronDown } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    birthdate: '',
    mobile_phone: '',
    country: ''
  });
  const [profilePicture, setProfilePicture] = useState('/default-profile-pic.png');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const birthDate = new Date(birthdate);
    const currentDate = new Date('2025-04-14');
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const totalDonations = donations.reduce((sum, donation) => sum + (parseFloat(donation.amount) || 0), 0);

  const handleDeletedProjectClick = (projectTitle) => {
    alert(`The project "${projectTitle}" has been deleted and is no longer accessible.`);
  };

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const response = await fetch('http://localhost:8000/api/accounts/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
        }
        const userData = await response.json();
        setUser({
          username: userData.username || '',
          email: userData.email || '',
          birthdate: userData.birthdate || '',
          mobile_phone: userData.mobile_phone || '',
          country: userData.country || '',
        });
        const profilePicUrl = userData.profile_picture
          ? userData.profile_picture.startsWith('http')
            ? userData.profile_picture
            : `http://localhost:8000${userData.profile_picture}`
          : '/default-profile-pic.png';
        setProfilePicture(profilePicUrl);

        const tempLoginAttempt = await fetch('http://localhost:8000/api/accounts/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: 'temp@Google'
          }),
        });
        if (tempLoginAttempt.status === 401) {
          setShowPasswordForm(false);
        } else {
          setShowPasswordForm(true);
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      }
    };

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const response = await fetch('http://localhost:8000/api/projects/projects/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      }
    };

    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const response = await fetch('http://localhost:8000/api/projects/my-donations/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch donations: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setDonations(data);
      } catch (err) {
        setError('Failed to load donations');
        console.error(err);
      }
    };

    fetchUserData();
    fetchProjects();
    fetchDonations();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const mobileRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (user.mobile_phone && !mobileRegex.test(user.mobile_phone)) {
      setError('Please enter a valid Egyptian mobile number (e.g., 01012345678)');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }
      const formData = new FormData();
      formData.append('username', user.username);
      if (user.mobile_phone) formData.append('mobile_phone', user.mobile_phone);
      if (user.birthdate) formData.append('birthdate', user.birthdate);
      if (user.country) formData.append('country', user.country);
      if (profilePictureFile) {
        formData.append('profile_picture', profilePictureFile);
      }

      const response = await fetch('http://localhost:8000/api/accounts/me/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mobile_phone?.[0] || errorData.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser({
        username: updatedUser.username,
        email: updatedUser.email,
        birthdate: updatedUser.birthdate,
        mobile_phone: updatedUser.mobile_phone,
        country: updatedUser.country,
      });
      const profilePicUrl = updatedUser.profile_picture
        ? updatedUser.profile_picture.startsWith('http')
          ? updatedUser.profile_picture
          : `http://localhost:8000${updatedUser.profile_picture}`
        : '/default-profile-pic.png';
      setProfilePicture(profilePicUrl);
      setProfilePictureFile(null);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || !confirmPassword) {
      setPasswordError('Both password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await fetch('http://localhost:8000/api/accounts/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      alert('Password changed successfully! Please log in again.');
      setShowPasswordForm(false);
      authAPI.logout();
      navigate('/login');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setError('');
    if (!deletePassword) {
      setError('Please enter your password');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }
      const response = await fetch('http://localhost:8000/api/accounts/me/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      authAPI.logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }
      const response = await fetch(`http://localhost:8000/api/projects/projects/${projectToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete Campaign');
      }

      setProjects(projects.filter(project => project.id !== projectToDelete.id));
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
      alert('Campaign deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete Campaign');
      console.error(err);
    }
  };

  const openDeleteProjectModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteProjectModalOpen(true);
    setError('');
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleShowProfile = () => {
    setIsSettingsVisible(false);
  };

  const handleShowSettings = () => {
    setIsSettingsVisible(true);
  };

  const age = calculateAge(user.birthdate);

  return (
    <div className="min-h-screen bg-[#F2EFE7] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`fixed inset-0 lg:static lg:w-64 bg-[#006A71] text-[#ffffff] flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#48A6A7]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={typeof profilePicture === 'string' ? profilePicture : '/default-profile-pic.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-[#9ACBD0] object-cover"
              />
              <label
                htmlFor="profilePictureSidebar"
                className="absolute bottom-0 right-0 bg-[#006A71] rounded-full p-1 cursor-pointer hover:bg-[#04828c] transition duration-300"
              >
                <FaPencilAlt className="w-3 h-3 text-[#ffffff]" />
              </label>
              <input
                type="file"
                id="profilePictureSidebar"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{user.username || 'Your Name'}</p>
              <p className="text-xs">{user.email || 'yourname@gmail.com'}</p>
            </div>
          </div>
          <button className="lg:hidden text-[#ffffff]" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleShowProfile}
                className="flex items-center gap-3 w-full text-left p-2 hover:bg-[#04828c] rounded-lg"
              >
                <FaUser className="w-5 h-5 text-[#48A6A7]" />
                <span className="text-sm">My Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleShowSettings}
                className="flex items-center gap-3 w-full text-left p-2 hover:bg-[#04828c] rounded-lg"
              >
                <FaCog className="w-5 h-5 text-[#48A6A7]" />
                <span className="text-sm">Settings</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left p-2 hover:bg-[#04828c] rounded-lg"
              >
                <FaSignOutAlt className="w-5 h-5 text-[#48A6A7]" />
                <span className="text-sm">Log Out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        {/* Hamburger Menu for Mobile */}
        <button className="lg:hidden mb-4 text-[#006A71]" onClick={() => setIsSidebarOpen(true)}>
          <FaBars className="w-6 h-6" />
        </button>

        {/* Conditional Rendering: Profile or Settings */}
        {!isSettingsVisible ? (
          <>
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={typeof profilePicture === 'string' ? profilePicture : '/default-profile-pic.png'}
                    alt="Profile"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#9ACBD0] object-cover"
                  />
                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-0 bg-[#006A71] rounded-full p-0.5 sm:p-1 cursor-pointer hover:bg-[#04828c] transition duration-300"
                  >
                    <FaPencilAlt className="w-2 h-2 sm:w-3 sm:h-3 text-[#ffffff]" />
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-semibold text-[#006A71]">{user.username || 'Your Name'}</p>
                  <p className="text-sm text-[#1e1e1e]">{user.email || 'yourname@gmail.com'}</p>
                </div>
              </div>

              {error && <p className="text-[#ef4444] text-xs sm:text-sm mb-4">{error}</p>}
              {age !== null && (
                <div className="inline-block bg-[#006A71] text-[#ffffff] rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm lg:text-base font-semibold shadow-md mb-4">
                  Age: {age} years
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Name</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Email account</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg bg-gray-100 text-[#1e1e1e] text-xs sm:text-sm lg:text-base cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="birthdate" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Birthdate</label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={user.birthdate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mobile_phone" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Mobile number</label>
                  <input
                    type="tel"
                    id="mobile_phone"
                    name="mobile_phone"
                    value={user.mobile_phone}
                    onChange={handleChange}
                    placeholder="Add number"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="country" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Location</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={user.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Change Password */}
            {showPasswordForm && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#006A71] mb-4">Set a New Password</h2>
                <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base mb-4">
                  You registered with Google. Please set a new password to manage your account more easily.
                </p>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2 relative">
                    <label htmlFor="newPassword" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">New Password</label>
                    <FaLock className="absolute left-3 top-9 sm:top-10 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label htmlFor="confirmPassword" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Confirm Password</label>
                    <FaLock className="absolute left-3 top-9 sm:top-10 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
                    />
                  </div>
                  {passwordError && <p className="text-[#ef4444] text-xs sm:text-sm">{passwordError}</p>}
                  <button
                    type="submit"
                    className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            )}

            {/* Campaigns */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#006A71] mb-4">Your Campaigns</h2>
              {projects.length > 0 ? (
                <ul className="space-y-3">
                  {projects.map(project => (
                    <li key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#f9fafb] p-3 rounded-lg">
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <span className="text-[#006A71] text-lg">📋</span>
                        <div>
                          <p className="text-[#1e1e1e] font-semibold text-xs sm:text-sm lg:text-base">
                            <a
                              href={`/projects/${project.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#006A71] hover:underline"
                            >
                              {project.title}
                            </a>
                          </p>
                          <p className="text-[#1e1e1e] text-xs sm:text-sm">Raised: ${project.total_donations}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openDeleteProjectModal(project)}
                        className="bg-[#d32f2f] hover:bg-[#b71c1c] text-[#ffffff] text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg transition duration-300 flex items-center gap-1 self-start sm:self-center"
                      >
                        <span>Delete</span>
                        <span>🗑️</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base">No Campaigns yet.</p>
              )}
            </div>

            {/* Donations */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#006A71] mb-4">Your Donations</h2>
              <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base mb-4">Total Donations: ${totalDonations.toFixed(2)}</p>
              {donations.length > 0 ? (
                <ul className="space-y-3">
                  {donations.map(donation => {
                    const isProjectDeleted = !donation.project_title;
                    const projectTitle = isProjectDeleted ? '[Deleted Project]' : donation.project_title;
                    return (
                      <li
                        key={donation.id}
                        className={`flex flex-col sm:flex-row sm:items-center bg-[#f9fafb] p-3 rounded-lg ${isProjectDeleted ? 'opacity-60' : ''}`}
                      >
                        <span className="text-[#006A71] text-lg mr-3 sm:mr-3">💸</span>
                        <div className="flex-1">
                          <p className={`text-[#1e1e1e] font-semibold text-xs sm:text-sm lg:text-base ${isProjectDeleted ? 'line-through text-gray-500' : ''}`}>
                            {isProjectDeleted ? (
                              <span
                                className="cursor-pointer"
                                onClick={() => handleDeletedProjectClick(projectTitle)}
                              >
                                {projectTitle}
                              </span>
                            ) : (
                              projectTitle
                            )}
                            {isProjectDeleted && (
                              <span className="ml-2 inline-block bg-gray-200 text-[#d32f2f] text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full">
                                Deleted
                              </span>
                            )}
                          </p>
                          <p className="text-[#1e1e1e] text-xs sm:text-sm">
                            Amount: ${donation.amount} on {formatDate(donation.date)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base">No donations yet.</p>
              )}
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#006A71] mb-4">Delete Account</h2>
              <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base mb-4">
                This action is permanent and cannot be undone.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#d32f2f] hover:bg-[#b71c1c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
              >
                Delete My Account
              </button>
            </div>
          </>
        ) : (
          /* Settings Section */
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#006A71] mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="theme" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Theme</label>
                <div className="relative group">
                  <select
                    id="theme"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base bg-[#F2EFE7] appearance-none cursor-pointer hover:bg-[#ffffff] hover:text-[#006A71] hover:shadow-md transition duration-300"
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#006A71] w-4 h-4 sm:w-5 sm:h-5 pointer-events-none group-hover:text-[#006A71] transition duration-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="language" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Language</label>
                <div className="relative group">
                  <select
                    id="language"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base bg-[#F2EFE7] appearance-none cursor-pointer hover:bg-[#ffffff] hover:text-[#006A71] hover:shadow-md transition duration-300"
                  >
                    <option value="ENG">ENG</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#006A71] w-4 h-4 sm:w-5 sm:h-5 pointer-events-none group-hover:text-[#006A71] transition duration-300" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Deletion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#F2EFE7] bg-opacity-80 flex items-center justify-center px-4 py-6 z-40">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setDeletePassword('');
                setError('');
              }}
              className="absolute top-4 right-4 text-[#1e1e1e]"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#006A71] mb-4">Confirm Account Deletion</h3>
            <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="space-y-2 relative">
              <label htmlFor="deletePassword" className="block text-[#1e1e1e] text-xs sm:text-sm font-medium">Enter Password</label>
              <FaLock className="absolute left-3 top-9 sm:top-10 transform -translate-y-1/2 text-[#48A6A7] w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-xs sm:text-sm lg:text-base"
              />
            </div>
            {error && <p className="text-[#ef4444] text-xs sm:text-sm mt-2">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleDelete}
                className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setDeletePassword('');
                  setError('');
                }}
                className="w-full bg-[#6b7280] hover:bg-[#4b5563] text-[#ffffff] font-semibold py-2 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Deletion Modal */}
      {isDeleteProjectModalOpen && projectToDelete && (
        <div className="fixed inset-0 bg-[#F2EFE7] bg-opacity-80 flex items-center justify-center px-4 py-6 z-40">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md relative">
            <button
              onClick={() => {
                setIsDeleteProjectModalOpen(false);
                setProjectToDelete(null);
                setError('');
              }}
              className="absolute top-4 right-4 text-[#1e1e1e]"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#006A71] mb-4">Confirm campaign Deletion</h3>
            <p className="text-[#1e1e1e] text-xs sm:text-sm lg:text-base mb-4">
              Are you sure you want to delete the campaign "{projectToDelete.title}"? This action cannot be undone.
            </p>
            {error && <p className="text-[#ef4444] text-xs sm:text-sm mb-4">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteProject}
                className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setIsDeleteProjectModalOpen(false);
                  setProjectToDelete(null);
                  setError('');
                }}
                className="w-full bg-[#6b7280] hover:bg-[#4b5563] text-[#ffffff] font-semibold py-2 rounded-lg transition duration-300 text-xs sm:text-sm lg:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;