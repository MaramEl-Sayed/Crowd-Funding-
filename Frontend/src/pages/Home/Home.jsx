import React, { useEffect, useState, useCallback, useRef } from "react";
import Slider from "react-slick";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import ProjectCard from "../../components/ProjectCard";
import SectionHeader from "../../components/SectionHeader";
import HeroSection from "../../components/HeroSection";
import AuthPopup from "../../components/AuthPopup";

const API_BASE_URL = "http://127.0.0.1:8000/api/projects";

const Home = () => {
    const [projects, setProjects] = useState({
        topRated: [],
        latest: [],
        featured: []
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState({
        topRated: true,
        latest: true,
        featured: true,
        search: false
    });
    const [showAuthPopup, setShowAuthPopup] = useState(false);
    const navigate = useNavigate();
    const observer = useRef();

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
            <div className="w-3 h-3 mt-3 rounded-full bg-gray-300 hover:bg-blue-600 transition-colors"></div>
        )
    };

    const getFirstImageUrl = (images) => {
        if (images?.length > 0) {
            return `${API_BASE_URL.replace('/api/projects', '')}${images[0].url}`;
        }
        return null;
    };

    const fetchProjects = async (endpoint, key) => {
        try {
            setLoading(prev => ({ ...prev, [key]: true }));
            const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
            setProjects(prev => ({ ...prev, [key]: response.data }));
        } catch (error) {
            console.error(`Error fetching ${key} projects`, error);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.trim() === "") {
                setSearchResults([]);
                return;
            }

            try {
                setLoading(prev => ({ ...prev, search: true }));
                const response = await axios.get(`${API_BASE_URL}/projects/?search=${query}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Error fetching search results", error);
            } finally {
                setLoading(prev => ({ ...prev, search: false }));
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
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowAuthPopup(true);
        } else {
            navigate(`/projects/${projectId}/donate`);
        }
    };

    const handleAuthConfirm = () => {
        setShowAuthPopup(false);
        navigate("/register");
    };

    const handleAuthCancel = () => {
        setShowAuthPopup(false);
    };

    useEffect(() => {
        const fetchAllProjects = async () => {
            await Promise.all([
                fetchProjects("projects/top-rated/", "topRated"),
                fetchProjects("projects/latest/", "latest"),
                fetchProjects("projects/featured/", "featured")
            ]);
        };

        fetchAllProjects();

        return () => {
            debouncedSearch.cancel();
            if (observer.current) observer.current.disconnect();
        };
    }, [debouncedSearch]);

    const getDaysRemaining = (endTime) => {
        try {
            const endDate = new Date(endTime);
            const today = new Date();

            if (isNaN(endDate.getTime())) {
                return "Invalid end date";
            }

            const timeDiff = endDate - today;
            const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

            return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`;
        } catch (error) {
            console.error("Error calculating days remaining:", error);
            return "Date calculation error";
        }
    };

    const renderNoProjectsMessage = (sectionName) => (
        <div className="text-center py-12">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <h3 className="text-xl font-medium mb-2 text-blue-600">
                No {sectionName} campaigns available
            </h3>
            <p className="text-gray-600">
                Check back later for new {sectionName.toLowerCase()} campaigns
            </p>
        </div>
    );

    const renderProjectSliderItem = (project) => (
        <div key={project.id} className="px-2">
            <motion.div
                className="bg-white h-96 rounded-xl shadow-lg overflow-hidden border border-gray-100"
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex flex-col md:flex-row h-full">
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

                    <div className="md:w-1/2 p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                                    {project.category?.name || "Uncategorized"}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${project.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {project.status === "active" ? "Active" : project.status || "Inactive"}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-blue-600">
                                <Link to={`/projects/${project.id}`} className="hover:underline">
                                    {project.title || "Untitled Campaigns"}
                                </Link>
                            </h3>

                            <p className="text-sm text-gray-600 mb-3">
                                By {project.owner || "Anonymous"}
                            </p>

                            <p className="text-gray-700 mb-4 line-clamp-3">
                                {project.details || "No description available"}
                            </p>
                        </div>

                        <div>
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-blue-600">
                                        {project.progress_percentage?.toFixed(0) || 0}% funded
                                    </span>
                                    <span>
                                        {`$${parseFloat(project.total_target || 0).toLocaleString()}`} goal
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-blue-600"
                                        style={{
                                            width: `${project.progress_percentage || 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {project.end_time && (
                                <p className="text-xs text-gray-500 mb-3">
                                    {getDaysRemaining(project.end_time)}
                                </p>
                            )}

                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold text-blue-600">
                                    {`$${parseFloat(project.total_donations || 0).toLocaleString()}`} raised
                                </p>
                                <motion.button
                                    onClick={() => handleDonateNow(project.id)}
                                    className="px-6 py-2 rounded-full text-white font-medium bg-blue-600 hover:bg-blue-700"
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
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 to-white">
            {showAuthPopup && (
                <AuthPopup
                    onConfirm={handleAuthConfirm}
                    onCancel={handleAuthCancel}
                />
            )}

            <HeroSection
                searchQuery={searchQuery}
                handleSearchInputChange={handleSearchInputChange}
                searchResults={searchResults}
                onClearSearch={handleClearSearch}
                isLoading={loading.search}
            />

            {searchResults.length === 0 && (
                <>
                    {/* Top Rated Campaigns Slider */}
                    <motion.section
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <SectionHeader title="Top Rated Campaigns" link="/campaigns" />
                        {loading.topRated ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : projects.topRated.length > 0 ? (
                            <Slider {...sliderSettings} className="mb-8">
                                {projects.topRated.map(renderProjectSliderItem)}
                            </Slider>
                        ) : renderNoProjectsMessage("Top Rated")}
                    </motion.section>

                    {/* Latest Campaigns */}
                    <motion.section
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <SectionHeader title="Recently Added Campaigns" link="/campaigns" />
                        {loading.latest ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : projects.latest.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {projects.latest.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        handleDonateNow={() => handleDonateNow(project.id)}
                                    />
                                ))}
                            </div>
                        ) : renderNoProjectsMessage("Latest")}
                    </motion.section>

                    {/* Featured Campaigns */}
                    <motion.section
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <SectionHeader title="Featured Campaigns" link="/campaigns" />
                        {loading.featured ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : projects.featured.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {projects.featured.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        handleDonateNow={() => handleDonateNow(project.id)}
                                    />
                                ))}
                            </div>
                        ) : renderNoProjectsMessage("Featured")}
                    </motion.section>
                </>
            )}
        </div>
    );
};

export default Home;
