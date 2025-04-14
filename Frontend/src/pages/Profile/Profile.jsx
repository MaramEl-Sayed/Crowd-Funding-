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
    mobile_phone: '', // Changed to match backend field name
    country: ''
  });
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8000/api/accounts/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUser({
          username: userData.username || '',
          email: userData.email || '',
          birthdate: userData.birthdate || '',
          mobile_phone: userData.mobile_phone || '',
          country: userData.country || '',
        });
        setProfilePicture(userData.profile_picture || defaultProfilePic);
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      }
    };

    // Fetch user's projects
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8000/api/projects/projects/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      }
    };

    // Fetch user's donations
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8000/api/projects/my-donations/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch donations');
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

    // Validate mobile number (Egyptian format: 01 followed by 0, 1, 2, or 5, then 8 digits)
    const mobileRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (user.mobile_phone && !mobileRegex.test(user.mobile_phone)) {
      setError('Please enter a valid Egyptian mobile number (e.g., 01012345678)');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('username', user.username);
      if (user.mobile_phone) formData.append('mobile_phone', user.mobile_phone);
      if (user.birthdate) formData.append('birthdate', user.birthdate);
      if (user.country) formData.append('country', user.country);
      if (profilePicture && profilePicture !== defaultProfilePic && typeof profilePicture !== 'string') {
        formData.append('profile_picture', profilePicture);
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
      setProfilePicture(updatedUser.profile_picture || defaultProfilePic);
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
      setProfilePicture(file); // Store the file object for FormData
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result); // Display the image preview
      };
      reader.readAsDataURL(file);
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

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Profile</h1>
        <p className={styles.subtitle}>Manage your personal information and contributions</p>
      </div>

      {/* Profile Picture Section */}
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

      {/* Personal Information Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Personal Information</h2>
        {error && <p className={styles.error}>{error}</p>}
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

      {/* Projects Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Your Projects</h2>
        {projects.length > 0 ? (
          <ul className={styles.list}>
            {projects.map(project => (
              <li key={project.id} className={styles.listItem}>
                <span className={styles.listIcon}>📋</span>
                <div>
                  <p className={styles.itemTitle}>{project.title}</p>
                  <p className={styles.itemDetail}>Raised: ${project.total_donations}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No projects yet.</p>
        )}
      </div>

      {/* Donations Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Your Donations</h2>
        {donations.length > 0 ? (
          <ul className={styles.list}>
            {donations.map(donation => (
              <li key={donation.id} className={styles.listItem}>
                <span className={styles.listIcon}>💸</span>
                <div>
                  <p className={styles.itemTitle}>{donation.project_title}</p>
                  <p className={styles.itemDetail}>Amount: ${donation.amount} on {donation.date}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No donations yet.</p>
        )}
      </div>

      {/* Delete Account Card */}
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

      {/* Delete Confirmation Modal */}
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
    </div>
  );
};

export default Profile;