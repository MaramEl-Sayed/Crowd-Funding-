import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [topRatedProjects, setTopRatedProjects] = useState([]);
    const [latestProjects, setLatestProjects] = useState([]);
    const [categoryProjects, setCategoryProjects] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const categories = [
        "Technology",
        "Health",
        "Education",
        "Art",
        "Charity",
    ];

    useEffect(() => {
        // Fetch top-rated projects
        axios.get("http://127.0.0.1:8000/api/projects/projects/top-rated/")
            .then((res) => setTopRatedProjects(res.data))
            .catch((err) => console.error("Error fetching top-rated projects", err));

        // Fetch latest projects
        axios.get("http://127.0.0.1:8000/api/projects/projects/latest/")
            .then((res) => setLatestProjects(res.data))
            .catch((err) => console.error("Error fetching latest projects", err));
    }, []);

    const fetchProjectsByCategory = (category) => {
        setSelectedCategory(category);
        axios.get(`http://127.0.0.1:8000/api/projects/projects/?category=${category}`)
            .then((res) => setCategoryProjects(res.data))
            .catch((err) => console.error(`Error fetching projects for category ${category}`, err));
    };

    const handleSearch = () => {
        if (searchQuery.trim() !== "") {
            axios.get(`http://127.0.0.1:8000/api/projects/projects/?search=${searchQuery}`)
                .then((res) => setSearchResults(res.data))
                .catch((err) => console.error("Error fetching search results", err));
        } else {
            setSearchResults([]); // Clear search results if the query is empty
        }
    };

    const handleDonateNow = (projectId) => {
        navigate(`/projects/${projectId}/donate`);
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Search Bar */}
            <div className="mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects by title..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    className="mt-2 w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
                >
                    Search
                </button>
            </div>

            {/* Display Search Results */}
            {searchResults.length > 0 ? (
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Search Results</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {searchResults.map((project) => (
                            <div key={project.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4">
                                <img
                                    src={`http://localhost:8000${project.image}`}
                                    alt={project.title}
                                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                    <p className="text-gray-600 line-clamp-3 mb-4">{project.description}</p>
                                    <button
                                        onClick={() => handleDonateNow(project.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                    >
                                        Donate Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : searchQuery && (
                <p className="text-center text-gray-500">No projects found for "{searchQuery}".</p>
            )}

            {/* Top Rated Projects Slider */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Top Rated Projects</h2>
            <Slider {...settings}>
                {topRatedProjects.map((project) => (
                    <div key={project.id} className="relative p-4">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row items-center">
                            <img
                                src={`http://localhost:8000${project.image}`}
                                alt={project.title}
                                className="w-full md:w-1/2 h-64 object-cover"
                            />
                            <div className="p-6 md:w-1/2">
                                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-4">{project.description}</p>
                                <button
                                    onClick={() => handleDonateNow(project.id)}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
                                >
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            {/* Latest Projects List */}
            <h2 className="text-2xl md:text-3xl font-bold my-10 text-center">Latest Projects</h2>
            <div className="grid gap-6 md:grid-cols-2">
                {latestProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4">
                        <img
                            src={`http://localhost:8000${project.image}`}
                            alt={project.title}
                            className="w-full md:w-48 h-48 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                            <p className="text-gray-600 line-clamp-3 mb-4">{project.description}</p>
                            <button
                                onClick={() => handleDonateNow(project.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                            >
                                Donate Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Filter */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Categories</h2>
            <div className="flex justify-center mb-8">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => fetchProjectsByCategory(category)}
                        className={`px-4 py-2 mx-2 rounded-full ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500 transition`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Display Projects by Category */}
            {selectedCategory && (
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{selectedCategory} Projects</h2>
                    {categoryProjects.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {categoryProjects.map((project) => (
                                <div key={project.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4">
                                    <img
                                        src={`http://localhost:8000${project.image}`}
                                        alt={project.title}
                                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                        <p className="text-gray-600 line-clamp-3 mb-4">{project.category}</p>
                                        <button
                                            onClick={() => handleDonateNow(project.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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