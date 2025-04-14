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
    const [similarProjects, setSimilarProjects] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/`);
                setProject(response.data);
                setAverageRating(response.data.average_rating);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const handleRatingSubmit = async () => {
        try {
            await axios.post(`http://localhost:8000/api/projects/ratings/`, {
                project: project.id,
                value: userRating,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            Alert.success('Rating submitted!', 'Thank you for your feedback.');
            // Refresh project data
            const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/`);
            setProject(response.data);
            setAverageRating(response.data.average_rating);
            setUserRating(0);
        } catch (err) {
            Alert.error('Error!', err.response.data.detail);
        }
    };

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
                <p className="text-gray-600 mb-4"><strong>Average Rating:</strong> {averageRating || 'No ratings yet'}</p>
                
                <div className="mb-4">
                    <label className="block mb-2">Rate this project:</label>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star} 
                                className={`cursor-pointer text-2xl ${userRating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                                onClick={() => setUserRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <button 
                        onClick={handleRatingSubmit}
                        className={`mt-2 w-full p-2 rounded ${!userRating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        disabled={!userRating}
                    >
                        Submit Rating
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-blue-600">${project.total_donations}</h3>
                    <p className="text-gray-600">Raised of ${project.total_target}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-purple-600">${project.remaining_amount}</h3>
                    <p className="text-gray-600">Remaining</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-pink-600">{project.progress_percentage}%</h3>
                    <p className="text-gray-600">Funded</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <strong className="text-gray-600">Tags:</strong>
                    {project.tags.map(tag => (
                        <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                            {tag.name}
                        </span>
                    ))}
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Donations</h2>
                  {project.donations.length > 0 ? (
                    <div className="space-y-3">
                      {project.donations.map(donation => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            {donation.user_avatar && (
                              <img 
                                src={donation.user_avatar} 
                                alt={donation.user} 
                                className="w-8 h-8 rounded-full mr-3"
                              />
                            )}
                            <span className="text-gray-700">{donation.user}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-600">${donation.amount}</span>
                            <p className="text-xs text-gray-500">
                              {new Date(donation.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No donations yet. Be the first to support this project!</p>
                  )}
                </div>

                {/* Similar Projects Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Similar Projects</h2>
                    {similarProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {similarProjects.slice(0, 4).map(project => (
                                <div key={project.id} 
                                     className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                                     onClick={() => navigate(`/projects/${project.id}`)}>
                                    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{project.details}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-600 font-medium">${project.total_donations} raised</span>
                                        <span className="text-yellow-500">
                                            {project.average_rating ? '★'.repeat(Math.round(project.average_rating)) : 'Not rated'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No similar projects found</p>
                    )}
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
                        className={`${project.total_donations >= project.total_target ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white p-3 rounded-md transition duration-200`}
                        disabled={project.total_donations >= project.total_target}
                    >
                        {project.total_donations >= project.total_target ? 'Target Reached' : 'Donate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;