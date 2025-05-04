import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import ProjectCard from "../../components/ProjectCard";
import SectionHeader from "../../components/SectionHeader";
import HeroSection from "../../components/HeroSection";

const Home = () => {
    const [topRatedProjects, setTopRatedProjects] = useState([]);
    const [latestProjects, setLatestProjects] = useState([]);
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const colors = {
        primary: "#006A71",
        secondary: "#48A6A7",
        accent: "#9ACBD0",
        background: "#F2EFE7",
        textDark: "#1e1e1e",
        textLight: "#ffffff"
    };

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: true,
        cssEase: "cubic-bezier(0.645, 0.045, 0.355, 1)",
        appendDots: dots => (
            <div className="bg-transparent rounded-lg p-4">
                <ul className="m-0 mt-10"> {dots} </ul>
            </div>
        ),
        customPaging: i => (
            <div className="w-3 h-3 mt-3 rounded-full bg-gray-300 hover:bg-primary transition-colors"></div>
        )
    };

    const getFirstImageUrl = (images) => {
        if (images && images.length > 0) {
            return `http://localhost:8000${images[0].url}`;
        }
        return null;
    };

    const debouncedSearch = useCallback(
        debounce((query) => {
            if (query.trim() !== "") {
                axios.get(`http://127.0.0.1:8000/api/projects/projects/?search=${query}`)
                    .then((res) => setSearchResults(res.data))
                    .catch((err) => console.error("Error fetching search results", err));
            } else {
                setSearchResults([]);
            }
        }, 300),
        []
    );

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleDonateNow = (projectId) => {
        navigate(`/projects/${projectId}/donate`);
    };

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/projects/projects/top-rated/")
            .then((res) => setTopRatedProjects(res.data))
            .catch((err) => console.error("Error fetching top-rated projects", err));

        axios.get("http://127.0.0.1:8000/api/projects/projects/latest/")
            .then((res) => setLatestProjects(res.data))
            .catch((err) => console.error("Error fetching latest projects", err));

        axios.get("http://127.0.0.1:8000/api/projects/projects/featured/")
            .then((res) => setFeaturedProjects(res.data))
            .catch((err) => console.error("Error fetching featured projects", err));

        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8" style={{ backgroundColor: colors.background }}>
            <HeroSection
                colors={colors}
                searchQuery={searchQuery}
                handleSearchInputChange={handleSearchInputChange}
                searchResults={searchResults}
                onClearSearch={handleClearSearch}
            />


            {/* Top Rated Projects Slider */}
            <motion.section
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <SectionHeader title="Top Rated Projects" link="/projects" />
                <Slider {...sliderSettings} className="mb-8">
                    {topRatedProjects.map((project) => (
                        <div key={project.id} className="px-2">
                            <motion.div
                                className="bg-white h-96 rounded-xl shadow-lg overflow-hidden border border-gray-100"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex flex-col md:flex-row h-full">
                                    {/* Image */}
                                    <div className="md:w-1/2 h-64 md:h-full">
                                        {getFirstImageUrl(project.images) ? (
                                            <img
                                                src={getFirstImageUrl(project.images)}
                                                alt={project.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                No Image Available
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="md:w-1/2 p-6 flex flex-col justify-between">
                                        <div>
                                            {/* Category and Status */}
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                                                    style={{ backgroundColor: colors.accent, color: colors.textDark }}>
                                                    {project.category?.name || "Uncategorized"}
                                                </span>
                                                {project.status === "active" ? (
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800">
                                                        {project.status || "Inactive"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary }}>
                                                <Link to={`/projects/${project.id}`} className="hover:underline">
                                                    {project.title || "Untitled Project"}
                                                </Link>
                                            </h3>

                                            {/* Owner */}
                                            <p className="text-sm text-gray-600 mb-3">
                                                By {project.owner || "Anonymous"}
                                            </p>

                                            {/* Description */}
                                            <p className="text-gray-700 mb-4 line-clamp-3">
                                                {project.details || "No description available"}
                                            </p>
                                        </div>

                                        <div>
                                            {/* Progress Bar */}
                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span style={{ color: colors.primary }}>
                                                        {project.progress_percentage?.toFixed(0) || 0}% funded
                                                    </span>
                                                    <span>
                                                        ${parseFloat(project.total_target || 0).toLocaleString()} goal
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            backgroundColor: colors.primary,
                                                            width: `${project.progress_percentage || 0}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Days remaining */}
                                            {project.end_time && (
                                                <p className="text-xs text-gray-500 mb-3">
                                                    {Math.max(0, Math.ceil((new Date(project.end_time) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining
                                                </p>
                                            )}

                                            {/* Donate Button */}
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                                                    ${parseFloat(project.total_donations || 0).toLocaleString()} raised
                                                </p>
                                                <motion.button
                                                    onClick={() => handleDonateNow(project.id)}
                                                    className="px-6 py-2 rounded-full text-white font-medium"
                                                    style={{ backgroundColor: colors.primary }}
                                                    whileHover={{ backgroundColor: colors.secondary }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Donate Now
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </Slider>
            </motion.section>

            {/* Latest Projects */}
            <motion.section
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <SectionHeader title="Recently Added" link="/projects" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {latestProjects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </motion.section>

            {/* Featured Projects */}
            <motion.section
                className="mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <SectionHeader title="Featured Projects" link="/projects" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {featuredProjects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </motion.section>

        </div>
    );
};

export default Home;