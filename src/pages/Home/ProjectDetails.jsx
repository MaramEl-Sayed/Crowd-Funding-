// src/pages/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../alert/Alert';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/`);
                setProject(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const handleCancelProject = async () => {
        const result = await Alert.confirm(
            'Are you sure?',
            'Do you really want to cancel this project?',
            'Yes, cancel it!'
        );

        if (result.isConfirmed) {
            try {
                await axios.post(`http://127.0.0.1:8000/api/projects/projects/${id}/cancel/`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                Alert.success('Cancelled!', 'Your project has been cancelled.');
                navigate('/home');
            } catch (err) {
                Alert.error('Error!', err.response.data.detail);
            }
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error loading project: {error.message}</p>;

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <div className="container bg-white shadow-lg rounded-lg p-8 max-w-3xl">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">{project.title}</h1>
                <img src={`http://localhost:8000${project.image}`} alt={project.title} className="w-full h-64 object-cover rounded-md mb-4" />
                <p className="text-gray-700 mb-4">{project.details}</p>
                <p className="text-gray-600 mb-2"><strong>Category:</strong> {project.category}</p>
                <p className="text-gray-600 mb-2"><strong>Total Target:</strong> ${project.total_target}</p>
                <p className="text-gray-600 mb-2"><strong>Start:</strong> {new Date(project.start_time).toLocaleDateString()} - <strong>End:</strong> {new Date(project.end_time).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4"><strong>Average Rating:</strong> {project.average_rating || 'No ratings yet'}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    <strong className="text-gray-600">Tags:</strong>
                    {project.tags.map(tag => (
                        <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                            {tag.name}
                        </span>
                    ))}
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={handleCancelProject}
                        className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-200"
                    >
                        Cancel Project
                    </button>
                    <button
                        onClick={() => navigate(`/projects/${id}/update`)}
                        className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Update Project
                    </button>
                    <button
                        onClick={() => navigate(`/projects/${id}/donate`)}
                        className="bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition duration-200"
                    >
                        Donate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;