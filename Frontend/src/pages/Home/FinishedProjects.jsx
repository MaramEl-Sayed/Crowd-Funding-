import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import MainProjectCard from '../../components/MainProjectCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaFolder, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import AuthPopup from '../../components/AuthPopup'; // update the path if needed

const FinishedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const token = localStorage.getItem('accessToken');

  const navigate = useNavigate();
  const colors = {
    primary: "#2563eb",
    secondary: "#3b82f6",
    accent: "#bfdbfe",
    background: "#eff6ff",
    textDark: "#374151",
    textLight: "#ffffff"
};
  useEffect(() => {
    const fetchProjectsAndCategories = async () => {
      try {
        const [projectsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/projects/projects/finished/'),
          axios.get('http://localhost:8000/api/projects/categories/')
        ]);
        setProjects(projectsRes.data);
        setFilteredProjects(projectsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndCategories();
  }, []);

  useEffect(() => {
    let results = projects;

    if (searchTerm) {
      results = results.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      results = results.filter(project =>
        project.category?.id.toString() === selectedCategory
      );
    }

    setFilteredProjects(results);
  }, [searchTerm, selectedCategory, projects]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
      <FaSpinner className="animate-spin text-4xl" style={{ color: colors.primary }} />
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="text-center p-6 rounded-lg shadow-md max-w-md bg-white">
        <div className="mb-4 text-red-500">
          <FaExclamationCircle className="text-4xl mx-auto" />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: colors.textDark }}>Error loading Campaigns</h2>
        <p className="mb-4" style={{ color: colors.textDark }}>{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg transition duration-200"
          style={{ backgroundColor: colors.secondary, color: colors.textLight }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
  const handleStartCampaign = () => {
    if (token) {
      navigate("/create-campaign");
    } else {
      setShowPopup(true);
    }
  };
  const handleConfirm = () => {
    setShowPopup(false);
    navigate("/register");
  };

  const handleCancel = () => {
    setShowPopup(false);
  };
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.background }}>
      <AnimatePresence>
        {showPopup && (
          <AuthPopup onConfirm={handleConfirm} onCancel={handleCancel} />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Explore Campaigns</h1>
          <button
            onClick={handleStartCampaign}
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#3b82f6] text-white px-6 py-3 rounded-lg transition duration-200 shadow-md"
          >
            <FaPlus />
            Create Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative col-span-1 md:col-span-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch style={{ color: colors.accent }} />
            </div>
            <input
              type="text"
              placeholder="Search Campaigns..."
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${colors.accent}`,
                color: colors.textDark,
                backgroundColor: colors.textLight,
                focusRingColor: colors.primary
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="rounded-lg p-2 focus:outline-none focus:ring-2"
            style={{
              border: `1px solid ${colors.accent}`,
              color: colors.textDark,
              backgroundColor: colors.textLight,
              focusRingColor: colors.primary
            }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-white" style={{ borderColor: colors.accent }}>
            <div className="mb-4" style={{ color: colors.accent }}>
              <FaSearch className="text-5xl mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.textDark }}>No Campaigns found</h3>
            <p className="mb-4" style={{ color: colors.textDark }}>
              {searchTerm || selectedCategory
                ? "Try adjusting your search or filter criteria"
                : "There are currently no Campaigns available"}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="px-4 py-2 rounded-lg transition duration-200"
                style={{ backgroundColor: colors.secondary, color: colors.textLight }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <MainProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinishedProjects;