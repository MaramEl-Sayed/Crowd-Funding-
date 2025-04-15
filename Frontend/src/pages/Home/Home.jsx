import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { debounce } from "lodash";

const Home = () => {
    const [topRatedProjects, setTopRatedProjects] = useState([]);
    const [latestProjects, setLatestProjects] = useState([]);
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [categoryProjects, setCategoryProjects] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    // Helper function to get the first available image URL
    const getFirstImageUrl = (images) => {
        if (images && images.length > 0) {
            return `http://localhost:8000${images[0].url}`;
        }
        return null;
    };

    // Debounced search function
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

        axios.get("http://127.0.0.1:8000/api/projects/categories/")
            .then((res) => {
                // Assuming the API returns an array of objects with a 'name' property
                const categoryNames = res.data.map(category => category.name);
                setCategories(categoryNames);
            })
            .catch((err) => console.error("Error fetching categories", err));

        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const fetchProjectsByCategory = (category) => {
        setSelectedCategory(category);
        axios.get(`http://127.0.0.1:8000/api/projects/projects/?category=${category}`)
            .then((res) => setCategoryProjects(res.data))
            .catch((err) => console.error(`Error fetching projects for category ${category}`, err));
    };

    const handleDonateNow = (projectId) => {
        navigate(`/projects/${projectId}/donate`);
    };

    const settings = {
        dots: true,
        infinite: topRatedProjects.length > 1, // Disable infinite loop for single project
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: topRatedProjects.length > 1, // Disable autoplay for single project
        autoplaySpeed: 4000,
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Search Bar */}
            <div className="mb-8 py-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search projects by title..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Display Search Results */}
            {searchResults.length > 0 ? (
                <div className="py-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Search Results</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {searchResults.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-center transform hover:scale-105 hover:shadow-xl transition-all duration-300"
                            >
                                {getFirstImageUrl(project.images) ? (
                                    <img
                                        src={getFirstImageUrl(project.images)}
                                        alt={project.title}
                                        className="w-full md:w-48 h-48 object-cover object-center rounded-lg border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg border border-gray-200 shadow-sm">
                                        No Image
                                    </div>
                                )}
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <Link
                                        to={`/projects/${project.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-75"
                                    >
                                        <h3 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">{project.title}</h3>
                                    </Link>
                                    <button
                                        onClick={() => handleDonateNow(project.id)}
                                        className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-green-600 hover:to-green-800 transform hover:scale-105 transition-all duration-300"
                                    >
                                        Donate Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : searchQuery && (
                <div className="py-8">
                    <p className="text-center text-gray-500">No projects found for "{searchQuery}".</p>
                </div>
            )}

            {/* Top Rated Projects Slider */}
            <div className="py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Top Rated Projects</h2>
                {topRatedProjects.length === 1 ? (
                    <div className="relative p-4">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col items-center">
                            <div className="p-6 w-full text-center">
                                <Link
                                    to={`/projects/${topRatedProjects[0].id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-75"
                                >
                                    <h3 className="text-2xl font-bold mb-4">{topRatedProjects[0].title}</h3>
                                </Link>
                                {getFirstImageUrl(topRatedProjects[0].images) ? (
                                    <div className="w-full h-80">
                                        <img
                                            src={getFirstImageUrl(topRatedProjects[0].images)}
                                            alt={topRatedProjects[0].title}
                                            className="w-full h-full object-cover object-center rounded-lg mb-4"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
                                        No Image
                                    </div>
                                )}
                                <p className="text-gray-600 mb-4 line-clamp-4">{topRatedProjects[0].description}</p>
                                <button
                                    onClick={() => handleDonateNow(topRatedProjects[0].id)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-300"
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Slider {...settings}>
                        {topRatedProjects.map((project) => (
                            <div key={project.id} className="relative p-4">
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col items-center">
                                    <div className="p-6 w-full text-center">
                                        <Link
                                            to={`/projects/${project.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:opacity-75"
                                        >
                                            <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                                        </Link>
                                        {getFirstImageUrl(project.images) ? (
                                            <div className="w-full h-80">
                                                <img
                                                    src={getFirstImageUrl(project.images)}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover object-center rounded-lg mb-4"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
                                                No Image
                                            </div>
                                        )}
                                        <p className="text-gray-600 mb-4 line-clamp-4">{project.description}</p>
                                        <button
                                            onClick={() => handleDonateNow(project.id)}
                                            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-300"
                                        >
                                            Donate Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                )}
            </div>

            {/* Latest Projects List */}
            <div className="py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Latest Projects</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {latestProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-center transform hover:scale-105 hover:shadow-xl transition-all duration-300"
                        >
                            {getFirstImageUrl(project.images) ? (
                                <img
                                    src={getFirstImageUrl(project.images)}
                                    alt={project.title}
                                    className="w-full md:w-48 h-48 object-cover object-center rounded-lg border border-gray-200 shadow-sm"
                                />
                            ) : (
                                <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg border border-gray-200 shadow-sm">
                                    No Image
                                </div>
                            )}
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <Link
                                    to={`/projects/${project.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-75"
                                >
                                    <h3 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">{project.title}</h3>
                                </Link>
                                <button
                                    onClick={() => handleDonateNow(project.id)}
                                    className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-green-600 hover:to-green-800 transform hover:scale-105 transition-all duration-300"
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Projects Section */}
            <div className="py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Featured Projects</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {featuredProjects.length > 0 ? (
                        featuredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-center transform hover:scale-105 hover:shadow-xl transition-all duration-300"
                            >
                                {getFirstImageUrl(project.images) ? (
                                    <img
                                        src={getFirstImageUrl(project.images)}
                                        alt={project.title}
                                        className="w-full md:w-48 h-48 object-cover object-center rounded-lg border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg border border-gray-200 shadow-sm">
                                        No Image
                                    </div>
                                )}
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <Link
                                        to={`/projects/${project.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-75"
                                    >
                                        <h3 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">{project.title}</h3>
                                    </Link>
                                    <button
                                        onClick={() => handleDonateNow(project.id)}
                                        className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-green-600 hover:to-green-800 transform hover:scale-105 transition-all duration-300"
                                    >
                                        Donate Now
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No featured projects available.</p>
                    )}
                </div>
            </div>

            {/* Category Filter */}
            <div className="py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Categories</h2>
                <div className="flex justify-center mb-8">
                    {categories.length > 0 ? categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => fetchProjectsByCategory(category)}
                            className={`px-4 py-2 mx-2 rounded-full ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500 transition`}
                        >
                            {category}
                        </button>
                    )) : <p className="text-center text-gray-500">Loading categories...</p>}
                </div>
            </div>

            {/* Display Projects by Category */}
            {selectedCategory && (
                <div className="py-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{selectedCategory} Projects</h2>
                    {categoryProjects.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {categoryProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-center transform hover:scale-105 hover:shadow-xl transition-all duration-300"
                                >
                                    {getFirstImageUrl(project.images) ? (
                                        <img
                                            src={getFirstImageUrl(project.images)}
                                            alt={project.title}
                                            className="w-full md:w-48 h-48 object-cover object-center rounded-lg border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full md:w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg border border-gray-200 shadow-sm">
                                            No Image
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                        <Link
                                            to={`/projects/${project.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:opacity-75"
                                        >
                                            <h3 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">{project.title}</h3>
                                        </Link>
                                        <button
                                            onClick={() => handleDonateNow(project.id)}
                                            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:from-green-600 hover:to-green-800 transform hover:scale-105 transition-all duration-300"
                                        >
                                            Donate Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No projects available in this category.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;