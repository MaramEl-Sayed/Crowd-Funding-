import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from "react-router-dom";
import {
    FaSpinner, FaArrowLeft
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const COLORS = {
    primary: "#2563eb",     // blue-600
    secondary: "#3b82f6",   // blue-500
    accent: "#bfdbfe",      // blue-200
    background: "#eff6ff",  // blue-100
    textDark: "#374151",    // gray-700
    textLight: "#ffffff"    // white
  };

const BASE_URL = 'http://localhost:8000';

const CategoryCampaigns = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const categoriesResponse = await axios.get(`${BASE_URL}/api/projects/categories/`);
                const allCategories = categoriesResponse.data;

                const currentCategory = allCategories.find(cat => cat.id.toString() === id);

                if (!currentCategory) {
                    throw new Error('Category not found');
                }

                setCategory(currentCategory);

                const projectsResponse = await axios.get(
                    `${BASE_URL}/api/projects/projects/?category=${currentCategory.name}`
                );
                setProjects(projectsResponse.data);
                console.log(projectsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message || 'Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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
                <Link
                    to="/categories"
                    className="ml-4 text-[#2563eb] hover:underline"
                >
                    Back to categories
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <main className="container mx-auto py-12 px-6">
                <div className="mb-8">
                    <Link
                        to="/categories"
                        className="flex items-center text-[#2563eb] hover:underline"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to all categories
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
                        {category.name} Fundraisers
                    </h1>
                    <p className="text-lg mb-6" style={{ color: COLORS.textDark }}>
                        Browse all projects in this category
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg" style={{ color: COLORS.textDark }}>
                            No projects found in this category.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                    >
                        {projects.map((project) => (
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
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.details}</p>
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
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: COLORS.textDark }}>
                                            ${project.total_donations.toLocaleString()} raised
                                        </span>
                                        <span style={{ color: COLORS.textDark }}>
                                            {Math.round((project.total_donations / parseFloat(project.total_target)) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default CategoryCampaigns;