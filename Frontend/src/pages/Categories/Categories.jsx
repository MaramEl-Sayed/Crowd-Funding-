import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus, FaSearch, FaFolder, FaSpinner,
  FaLaptop, FaHeartbeat, FaBook, FaPaintBrush, FaHandsHelping,
  FaArrowRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPopup from '../../components/AuthPopup';

const COLORS = {
  primary: "#2563eb",     // blue-600
  secondary: "#3b82f6",   // blue-500
  accent: "#bfdbfe",      // blue-200
  background: "#eff6ff",  // blue-100
  textDark: "#374151",    // gray-700
  textLight: "#ffffff"    // white
};

const BASE_URL = 'http://localhost:8000';

const Categories = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(3);
  const [showCategories, setShowCategories] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesResponse = await axios.get('http://localhost:8000/api/projects/categories/');
        setCategories(categoriesResponse.data);

        const projectsResponse = await axios.get('http://localhost:8000/api/projects/projects/');
        if (projectsResponse.data.length === 0) {
          setProjects([
            {
              id: 1,
              title: "Tech Project",
              category: { id: 1, name: "Technology" },
              images: [{ url: "/media/project_images/tech.jpg" }],
              owner: "John Doe",
              details: "A tech project description",
              total_donations: 500,
              total_target: 1000
            },
            {
              id: 2,
              title: "Health Project",
              category: { id: 2, name: "Health" },
              images: [{ url: "/media/project_images/health.jpg" }],
              owner: "Jane Doe",
              details: "A health project description",
              total_donations: 300,
              total_target: 1000
            }
          ]);
        } else {
          setProjects(projectsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowCategories(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const getProjectsByCategory = (categoryId) => {
    return projects.filter((project) => project.category.id === categoryId).slice(0, 3);
  };

  const handleShowMoreCategories = () => {
    setVisibleCategoriesCount((prevCount) => prevCount + 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#eff6ff]">
        <FaSpinner className="animate-spin text-[#2563eb] text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <p style={{ color: COLORS.textDark }}>{error}</p>
      </div>
    );
  }

  const visibleCategories = categories.slice(0, visibleCategoriesCount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <main className="container mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
            Browse fundraisers by category
          </h1>
          <p className="text-lg mb-6" style={{ color: COLORS.textDark }}>
            People around the world are raising money for what they are passionate about.
          </p>
          <button
            onClick={handleStartCampaign}
            className="px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: COLORS.primary, color: COLORS.textLight }}
          >
            Start New Campaign
          </button>
        </div>

        <div className="mb-12 mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className={`bg-white rounded-lg p-4 flex flex-col items-center justify-center h-32 transition-opacity duration-500 ${showCategories ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <div className="mb-2 inline-flex w-10 h-10">
                  <img
                    src={`${BASE_URL}${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/40';
                    }}
                  />
                </div>
                <p className="text-sm text-center" style={{ color: COLORS.textDark }}>
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <hr className="my-8 border-t-2" style={{ borderColor: COLORS.secondary }} />

        {visibleCategories.length === 0 ? (
          <p className="text-center" style={{ color: COLORS.textDark }}>
            No categories available.
          </p>
        ) : (
          visibleCategories.map((category, index) => {
            const categoryProjects = getProjectsByCategory(category.id);
            if (categoryProjects.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="mb-12">
                  <h2 className="text-2xl font-semibold mb-6" style={{ color: COLORS.textDark }}>
                    {category.name} Fundraisers
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {categoryProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="relative">
                          <img
                            src={
                              project.images && project.images.length > 0
                                ? `${BASE_URL}${project.images[0].url}`
                                : 'https://via.placeholder.com/300x200'
                            }
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-white bg-opacity-50 text-blue-500 text-sm px-2 py-1 rounded">
                            {project.owner}
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.textDark }}>
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{project.details}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (project.total_donations / parseFloat(project.total_target)) * 100,
                                  100
                                )}%`,
                                backgroundColor: COLORS.primary,
                              }}
                            ></div>
                          </div>
                          <p className="text-sm" style={{ color: COLORS.textDark }}>
                            ${project.total_donations.toLocaleString()} raised
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="text-right mt-6">
                    <Link
                      to={`/categories/${category.id}`}
                      className="text-sm font-semibold inline-flex items-center hover:underline"
                      style={{ color: COLORS.primary }}
                    >
                      See more
                      <FaArrowRight className="ml-2 relative top-0.5" style={{ color: COLORS.primary }} />
                    </Link>
                  </div>
                </div>

                {index < visibleCategories.length - 1 && (
                  <hr className="my-8 border-t-2" style={{ borderColor: COLORS.secondary }} />
                )}
              </div>
            );
          })
        )}

        {visibleCategoriesCount < categories.length && (
          <div className="text-center mt-8">
            <button
              onClick={handleShowMoreCategories}
              className="px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: COLORS.primary, color: COLORS.textLight }}
            >
              Show More Categories
            </button>
          </div>
        )}

        <AnimatePresence>
          {showPopup && (
            <AuthPopup
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Categories;