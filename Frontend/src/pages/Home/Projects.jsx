import React, { useState, useEffect, useMemo, memo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Memoized DescriptionSection component to prevent unnecessary re-renders
const DescriptionSection = memo(({ details }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const DESCRIPTION_TRUNCATE_LENGTH = 48; // 80% of an average first line (~60 characters)

    const shouldTruncateDescription = details.length > DESCRIPTION_TRUNCATE_LENGTH;

    // Memoize the displayed description to avoid recalculating on every render
    const displayedDescription = useMemo(() => {
        return isDescriptionExpanded
            ? details
            : shouldTruncateDescription
            ? `${details.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`
            : details;
    }, [details, isDescriptionExpanded, shouldTruncateDescription]);

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    return (
        <div className="whitespace-pre-wrap break-words border border-gray-200 rounded-md p-3 shadow-sm">
            <p className="text-gray-600 mb-2">{displayedDescription}</p>
            {shouldTruncateDescription && (
                <button
                    onClick={(e) => {
                        e.preventDefault(); // Prevent the Link click when clicking the button
                        toggleDescription();
                    }}
                    className="text-blue-500 hover:underline text-sm cursor-pointer"
                >
                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
});

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/projects/projects/');
                setProjects(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error loading projects: {error.message}</p>;

    return (
        <div className="bg-gradient-to-r py-10 from-blue-500 via-purple-500 to-pink-500 min-h-screen flex items-center justify-center">
            <div className="container bg-white shadow-lg rounded-lg p-8 max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/create-project')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Create Project
                    </button>
                </div>
                <ul className="space-y-6">
                    {projects.map(project => (
                        <li
                            key={project.id}
                            className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-lg transition duration-200"
                        >
                            <Link to={`/projects/${project.id}`} className="hover:opacity-75">
                                <h2 className="text-2xl font-bold text-blue-600 mb-2">{project.title}</h2>
                            </Link>
                            <DescriptionSection details={project.details} />
                            <div className="text-sm text-gray-500 space-y-1 mt-3">
                                <p><strong>Category:</strong> {project.category}</p>
                                <p><strong>Average Rating:</strong> {project.average_rating || 'No ratings yet'}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Projects;