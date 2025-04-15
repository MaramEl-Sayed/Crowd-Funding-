import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import styles from './Profile.module.css';
import defaultProfilePic from '../../assets/default-profile-pic.png';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    birthdate: '',
    mobile_phone: '',
    country: ''
  });
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  // New states for password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
          : defaultProfilePic;
        setProfilePicture(profilePicUrl);

        // Check if user registered with Google by attempting to log in with a known Google temp password format
        // This is a workaround since we can't directly check the registration method
        const tempLoginAttempt = await fetch('http://localhost:8000/api/accounts/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            password: 'temp@Google' // A placeholder to check if login fails
          }),
        });
        if (tempLoginAttempt.status === 401) {
          // If login fails with a temp password, user likely didn't register with Google
          setShowPasswordForm(false);
        } else {
          // If login succeeds or we can't determine, assume Google registration and prompt for new password
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
        : defaultProfilePic;
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
        throw new Error(errorData.error || 'Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== projectToDelete.id));
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
      alert('Project deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      console.error(err);
    }
  };

  const openDeleteProjectModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteProjectModalOpen(true);
    setError('');
  };

  const age = calculateAge(user.birthdate);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Profile</h1>
        <p className={styles.subtitle}>Manage your personal information and contributions</p>
      </div>

      <div className={styles.profilePictureCard}>
        <div className={styles.profilePictureWrapper}>
          <img
            src={typeof profilePicture === 'string' ? profilePicture : defaultProfilePic}
            alt="Profile"
            className={styles.profilePicture}
          />
          <div className={styles.uploadOverlay}>
            <label htmlFor="profilePictureInput" className={styles.uploadLabel}>
              Change Picture
            </label>
            <input
              type="file"
              id="profilePictureInput"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className={styles.uploadInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Personal Information</h2>
        {error && <p className={styles.error}>{error}</p>}
        {age !== null && (
          <p className={styles.ageDisplay}>Age: {age} years</p>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              disabled
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="birthdate" className={styles.label}>Birthdate</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={user.birthdate}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mobile_phone" className={styles.label}>Mobile Number</label>
            <input
              type="tel"
              id="mobile_phone"
              name="mobile_phone"
              value={user.mobile_phone}
              onChange={handleChange}
              placeholder="01012345678"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="country" className={styles.label}>Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={user.country}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.saveButton}>Save Changes</button>
        </form>
      </div>

      {showPasswordForm && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Set a New Password</h2>
          <p className={styles.warning}>
            You registered with Google. Please set a new password to manage your account more easily.
          </p>
          <form onSubmit={handleChangePassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
              />
            </div>
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            <button type="submit" className={styles.saveButton}>Change Password</button>
          </form>
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Your Projects</h2>
        {projects.length > 0 ? (
          <ul className={styles.list}>
            {projects.map(project => (
              <li key={project.id} className={styles.listItem}>
                <span className={styles.listIcon}>📋</span>
                <div className="flex-1">
                  <p className={styles.itemTitle}>
                    <a
                      href={`/projects/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-bold hover:opacity-75 transition-opacity duration-200"
                    >
                      {project.title}
                    </a>
                  </p>
                  <p className={styles.itemDetail}>Raised: ${project.total_donations}</p>
                </div>
                <button
                  onClick={() => openDeleteProjectModal(project)}
                  className={`${styles.deleteButton} flex items-center gap-1 ml-2`}
                >
                  <span>Delete</span>
                  <span>🗑️</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No projects yet.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Your Donations</h2>
        <p className={styles.ageDisplay}>Total Donations: ${totalDonations.toFixed(2)}</p>
        {donations.length > 0 ? (
          <ul className={styles.list}>
            {donations.map(donation => {
              const isProjectDeleted = !donation.project_title;
              const projectTitle = isProjectDeleted ? '[Deleted Project]' : donation.project_title;
              return (
                <li
                  key={donation.id}
                  className={`${styles.listItem} ${isProjectDeleted ? 'opacity-60' : ''}`}
                >
                  <span className={styles.listIcon}>💸</span>
                  <div>
                    <p className={`${styles.itemTitle} ${isProjectDeleted ? 'line-through text-gray-500' : ''}`}>
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
                        <span className="ml-2 inline-block bg-gray-200 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                          Deleted
                        </span>
                      )}
                    </p>
                    <p className={styles.itemDetail}>
                      Amount: ${donation.amount} on {formatDate(donation.date)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No donations yet.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Delete Account</h2>
        <p className={styles.warning}>This action is permanent and cannot be undone.</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.deleteButton}
        >
          Delete My Account
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Account Deletion</h3>
            <p className={styles.modalText}>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className={styles.formGroup}>
              <label htmlFor="deletePassword" className={styles.label}>Enter Password</label>
              <input
                type="password"
                id="deletePassword"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalButtons}>
              <button onClick={handleDelete} className={styles.confirmButton}>
                Confirm
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setDeletePassword('');
                  setError('');
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteProjectModalOpen && projectToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Project Deletion</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the project "{projectToDelete.title}"? This action cannot be undone.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalButtons}>
              <button onClick={handleDeleteProject} className={styles.confirmButton}>
                Confirm
              </button>
              <button
                onClick={() => {
                  setIsDeleteProjectModalOpen(false);
                  setProjectToDelete(null);
                  setError('');
                }}
                className={styles.cancelButton}
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