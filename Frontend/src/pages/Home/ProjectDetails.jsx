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
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [error, setError] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const [reportType, setReportType] = useState('project');

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

                    <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-yellow-500 text-white p-3 rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                        Report Project
                    </button>




                    {showReportModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4 text-red-600">Report</h2>

                                <select
                                    className="w-full border border-gray-300 rounded p-2 mb-4"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="project">Project</option>
                                    <option value="comment">Comment</option>
                                </select>


                                <textarea
                                    className="w-full h-32 border border-gray-300 rounded p-2 mb-4"
                                    placeholder="Enter your reason for reporting..."
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                ></textarea>


                                <div className="flex justify-end space-x-2">
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                                        onClick={() => {
                                            setShowReportModal(false);
                                            setReportReason('');
                                            setReportType('project');
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                        onClick={async () => {
                                            try {
                                                const data = {
                                                    reason: reportReason,
                                                    report_type: reportType,
                                                };

                                                if (reportType === 'project' && project) {
                                                    data.project = project.id;
                                                } else if (reportType === 'comment' && comment) {
                                                    data.comment = comment.id;
                                                }

                                                await axios.post(`http://localhost:8000/api/projects/reports/`, data, {
                                                    headers: {
                                                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                                                    },
                                                });

                                                Alert.success('Reported', 'Your report has been submitted.');
                                                setShowReportModal(false);
                                                setReportReason('');
                                                setReportType('project');
                                            } catch (err) {
                                                Alert.error(
                                                    'Error reporting',
                                                    err.response?.data?.detail || 'Something went wrong.'
                                                );
                                            }
                                        }}
                                        disabled={!reportReason.trim()}
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;