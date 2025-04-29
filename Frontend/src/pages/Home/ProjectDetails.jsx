import React, { useState, useEffect, useMemo, memo } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Slider from "react-slick";
import Alert from '../../alert/Alert';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, AnimatePresence } from "framer-motion";


// Memoized DescriptionSection component to prevent unnecessary re-renders
const DescriptionSection = memo(({ details }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const DESCRIPTION_TRUNCATE_LENGTH = 40;

    const shouldTruncateDescription = details.length > DESCRIPTION_TRUNCATE_LENGTH;

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
        <div className="mb-4 pt-4">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={isDescriptionExpanded ? 'expanded' : 'collapsed'}
                    className="text-gray-700 mb-2 whitespace-pre-wrap break-words p-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    {displayedDescription}
                </motion.div>
            </AnimatePresence>

            {shouldTruncateDescription && (
                <motion.button
                    onClick={toggleDescription}
                    className="mt-1 px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600 transition duration-200 shadow-md"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                >
                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                </motion.button>
            )}
        </div>
    );
});

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [error, setError] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportType, setReportType] = useState('project');
    const [reportTargetId, setReportTargetId] = useState(null);
    const [reportedBy, setReportedBy] = useState(null);

    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState(null);

    const [similarProjects, setSimilarProjects] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [similarError, setSimilarError] = useState(null);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 3000,
    };

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

    const fetchSimilarProjects = async () => {
        setSimilarLoading(true);
        setSimilarError(null);
        try {
            const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/similar/`);
            setSimilarProjects(response.data);
        } catch (err) {
            setSimilarError('Failed to load similar projects.');
        } finally {
            setSimilarLoading(false);
        }
    };

    const fetchComments = async () => {
        setCommentsLoading(true);
        setCommentsError(null);
        try {
            const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/comments/`);
            setComments(response.data);
        } catch (err) {
            setCommentsError('Failed to load comments.');
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            // Check for payment success query param
            const params = new URLSearchParams(location.search);
            if (params.get('payment') === 'success') {
                Alert.success('Payment Successful!', 'Thank you for your donation.');
                // Refetch project details to update donations
                fetchProjectDetails();
            }
            fetchProjectDetails();
            fetchSimilarProjects();
            fetchComments();
        }
    }, [id, location.search]);

    const postComment = async (parentId = null) => {
        if ((parentId === null && !newCommentText.trim()) || (parentId !== null && !replyText.trim())) {
            Alert.error('Error', 'Comment text cannot be empty.');
            return;
        }
        try {
            const data = {
                text: parentId === null ? newCommentText : replyText,
                parent: parentId,
            };
            await axios.post(`http://localhost:8000/api/projects/projects/${id}/comments/`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            Alert.success('Success', 'Comment posted.');
            if (parentId === null) {
                setNewCommentText('');
            } else {
                setReplyText('');
                setReplyToCommentId(null);
            }
            await fetchComments();
        } catch (err) {
            Alert.error('Error', err.response?.data?.detail || 'Failed to post comment.');
        }
    };

    const openReportModal = (type, targetId) => {
        setReportType(type);
        setReportTargetId(targetId);
        setReportReason('');
        setShowReportModal(true);
    };

    const submitReport = async () => {
        if (!reportReason.trim()) {
            Alert.error('Error', 'Reason is required for reporting.');
            return;
        }
        try {
            const data = {
                reason: reportReason,
                report_type: reportType,
            };
            if (reportType === 'project') {
                data.project = reportTargetId;
            } else if (reportType === 'comment') {
                data.comment = reportTargetId;
            }
            await axios.post(`http://localhost:8000/api/projects/reports/`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            Alert.success('Reported', 'Your report has been submitted.');
            setShowReportModal(false);
            setReportedBy('You');
            setReportReason('');
            setReportTargetId(null);
            await fetchComments();
        } catch (err) {
            Alert.error('Error reporting', err.response?.data?.detail || 'Something went wrong.');
        }
    };

    const renderComments = (commentsList) => {
        return commentsList.map((comment) => (
            <div key={comment.id} className="border rounded p-3 mb-3 bg-gray-50 relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-blue-700">{comment.user}</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                        <button
                            onClick={() => openReportModal('comment', comment.id)}
                            title="Report Comment"
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                            aria-label="Report Comment"
                        >
                            ⚑
                        </button>
                    </div>
                </div>
                <p className="mb-2">{comment.text}</p>
                {comment.reported_by && (
                    <p className="text-sm text-red-600 mb-1">Reported by: {comment.reported_by}</p>
                )}
                <button
                    className="text-sm text-blue-500 hover:underline mb-2"
                    onClick={() => setReplyToCommentId(comment.id === replyToCommentId ? null : comment.id)}
                >
                    {comment.id === replyToCommentId ? 'Cancel Reply' : 'Reply'}
                </button>
                {comment.id === replyToCommentId && (
                    <div className="mb-2">
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 mb-1"
                            rows="3"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                        />
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => postComment(comment.id)}
                        >
                            Submit Reply
                        </button>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-3 border-l-2 border-gray-300 pl-4">
                        {renderComments(comment.replies)}
                    </div>
                )}
            </div>
        ));
    };

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
            await fetchProjectDetails();
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

    // New function to open social media share windows and log share event
    const openShareWindow = async (platform, url) => {
        window.open(url, '_blank', 'width=600,height=400');
        try {
            await axios.post('http://localhost:8000/api/projects/shares/', {
                project: project.id,
                platform: platform,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
        } catch (err) {
            console.error('Error logging share event:', err);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error loading project: {error.message}</p>;

    // Construct share URL using project slug
    const shareUrl = project ? `${window.location.origin}/projects/${project.slug}` : '';

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center py-10">
            <div className="container bg-white shadow-lg rounded-lg p-8 max-w-3xl">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">{project.title}</h1>

                {project.images && project.images.length > 1 ? (
                    <div className="mb-4">
                        <Slider {...sliderSettings}>
                            {project.images.map((image, index) => (
                                <div key={image.id}>
                                    <img
                                        src={`http://localhost:8000${image.url}`}
                                        alt={`${project.title} image ${index + 1}`}
                                        className="w-full h-64 object-cover rounded-md"
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>
                ) : project.images && project.images.length === 1 ? (
                    <img
                        src={`http://localhost:8000${project.images[0].url}`}
                        alt={project.title}
                        className="w-full h-64 object-cover rounded-md mb-4"
                    />
                ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md mb-4">
                        No Images
                    </div>
                )}

                <DescriptionSection details={project.details} />

                <p className="text-gray-600 mb-2"><strong>Category:</strong> {project.category.name}</p>
                <p className="text-gray-600 mb-2"><strong>Total Target:</strong> ${project.total_target}</p>
                <p className="text-gray-600 mb-2"><strong>Start:</strong> {new Date(project.start_time).toLocaleDateString()} - <strong>End:</strong> {new Date(project.end_time).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4"><strong>Average Rating:</strong> {averageRating || 'No ratings yet'}</p>

                {/* Social Media Share Buttons */}
                <div className="mb-6 flex space-x-4 justify-center">
                    <button
                        onClick={() => openShareWindow('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                        aria-label="Share on Facebook"
                    >
                        Facebook
                    </button>
                    <button
                        onClick={() => openShareWindow('twitter', `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(project.title)}`)}
                        className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-200"
                        aria-label="Share on Twitter"
                    >
                        Twitter
                    </button>
                    <button
                        onClick={() => openShareWindow('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
                        className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition duration-200"
                        aria-label="Share on LinkedIn"
                    >
                        LinkedIn
                    </button>
                    <button
                        onClick={() => openShareWindow('whatsapp', `https://api.whatsapp.com/send?text=${encodeURIComponent(project.title + ' ' + shareUrl)}`)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                        aria-label="Share on WhatsApp"
                    >
                        WhatsApp
                    </button>
                </div>

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
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Similar Projects</h2>
                    {similarLoading && <p>Loading similar projects...</p>}
                    {similarError && <p className="text-red-500">{similarError}</p>}
                    {!similarLoading && similarProjects.length === 0 && <p>No similar projects found.</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {similarProjects.map(similar => {
                            const imageUrl = similar.images && similar.images.length > 0 ? `http://localhost:8000${similar.images[0].url}` : null;
                            return (
                                <Link
                                    key={similar.id}
                                    to={`/projects/${similar.id}`}
                                    className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-200"
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={similar.title}
                                            className="w-full h-40 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-blue-600">{similar.title}</h3>
                                        <p className="text-gray-600 text-sm truncate">{similar.details}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
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
                        onClick={() => openReportModal('project', project.id)}
                        className="bg-yellow-500 text-white p-3 rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                        Report Project
                    </button>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Comments</h2>

                    {commentsLoading && <p>Loading comments...</p>}
                    {commentsError && <p className="text-red-500">{commentsError}</p>}

                    <div className="mb-4">
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 mb-2"
                            rows="4"
                            placeholder="Write a comment..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => postComment(null)}
                        >
                            Post Comment
                        </button>
                    </div>

                    <div>
                        {comments.length === 0 && !commentsLoading && <p>No comments yet. Be the first to comment!</p>}
                        {renderComments(comments)}
                    </div>
                </div>

                {showReportModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
                            <h2 className="text-xl font-bold mb-4 text-red-600">Report</h2>

                            <p className="mb-2 font-semibold">Reporting: {reportType === 'project' ? 'Project' : 'Comment'}</p>
                            <p className="mb-2 text-sm text-gray-700">
                                This report will be sent to the {reportType === 'project' ? 'project creator' : 'admin'} for review.
                            </p>
                            <p className="mb-4 text-sm text-gray-600">Reported by: You</p>

                            <textarea
                                className="w-full h-32 border border-gray-300 rounded p-2 mb-4 resize-none focus:outline-blue-500"
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
                                        setReportTargetId(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                    onClick={submitReport}
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
    );
};

export default ProjectDetails;
