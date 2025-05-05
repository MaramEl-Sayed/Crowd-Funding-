import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Slider from "react-slick";
import Alert from '../../alert/Alert';
import { FaExclamationCircle, FaSpinner, FaFlag, FaComment, FaDonate, FaEdit, FaTimes, FaShareAlt, FaFacebook, FaWhatsapp, FaTwitter, FaLinkedin, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import AuthPopup from '../../components/AuthPopup';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
                    className="text-[#374151] mb-2 whitespace-pre-wrap break-words p-4 border border-[#bfdbfe] rounded-lg bg-[#eff6ff] transition-all duration-300"
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
                    className="mt-1 px-3 py-1 rounded-md bg-[#2563eb] hover:bg-[#3b82f6] text-white text-sm transition duration-200 shadow-md"
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
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [previousRating, setPreviousRating] = useState(null);
    const [ratingLoading, setRatingLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [error, setError] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportType, setReportType] = useState('project');
    const [reportTargetId, setReportTargetId] = useState(null);
    const [reportedBy, setReportedBy] = useState(null);
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const [showAuthPopup, setShowAuthPopup] = useState(false);

    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState(null);

    const [similarProjects, setSimilarProjects] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [similarError, setSimilarError] = useState(null);
    const shareButtonRef = useRef(null);

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
    const handleRatingSubmit = async (ratingValue) => {
        try {
            const response = await axios.post(`http://localhost:8000/api/projects/ratings/`, {
                project: project.id,
                value: ratingValue,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });
            setPreviousRating(response.data.value);
            setUserRating(response.data.value);
            Alert.success('Rating submitted!', 'Thank you for your feedback.');
            await fetchProjectDetails();
        } catch (err) {
            console.error('Rating submission error:', err.response?.data);
            Alert.error('Error!', err.response?.data?.detail || 'Failed to submit rating.');
        }
    };
    const fetchUserRating = async () => {
        setRatingLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setPreviousRating(null);
                setUserRating(0);
                return;
            }
            const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/ratings/user/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.value !== undefined) {
                setPreviousRating(response.data.value);
                setUserRating(response.data.value);
            }
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 401) {
                setPreviousRating(null);
                setUserRating(0);
            } else {
                Alert.error('Error!', 'Failed to fetch your rating.');
            }
        } finally {
            setRatingLoading(false);
        }
    };

    const fetchSimilarProjects = async () => {
        setSimilarLoading(true);
        setSimilarError(null);
        try {
            const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/similar/`);
            setSimilarProjects(response.data);
        } catch (err) {
            setSimilarError('Failed to load similar Campaigns.');
            Alert.error('Error!', err.response?.data?.detail || 'Failed to load similar campaigns.');
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
            Alert.error('Error!', err.response?.data?.detail || 'Failed to load comments.');
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProjectDetails();
            fetchUserRating();
            fetchSimilarProjects();
            fetchComments();
        }
    }, [id]);

    const handleShare = () => {
        setShowShareDropdown(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareButtonRef.current && !shareButtonRef.current.contains(event.target)) {
                setShowShareDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowAuthPopup(true);
            return;
        }
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

    const shareLinks = project ? [
        {
            platform: 'Facebook',
            icon: <FaFacebook size={20} />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/projects/${id}`)}`,
        },
        {
            platform: 'WhatsApp',
            icon: <FaWhatsapp size={20} />,
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this campaign: ${project.title} ${window.location.origin}/projects/${id}`)}`,
        },
        {
            platform: 'Twitter',
            icon: <FaTwitter size={20} />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this campaign: ${project.title}`)}&url=${encodeURIComponent(`${window.location.origin}/projects/${id}`)}`,
        },
        {
            platform: 'LinkedIn',
            icon: <FaLinkedin size={20} />,
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${window.location.origin}/projects/${id}`)}&title=${encodeURIComponent(project.title)}&summary=${encodeURIComponent(project.details.substring(0, 200))}`,
        },
    ] : [];
    const renderComments = (commentsList) => {
        return commentsList.map((comment) => (
            <div key={comment.id} className="border border-[#bfdbfe] rounded-lg p-4 mb-3 bg-[#eff6ff] relative">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#2563eb]">{comment.user}</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#374151]">{new Date(comment.created_at).toLocaleString()}</span>
                        <button
                            onClick={() => openReportModal('comment', comment.id)}
                            title="Report Comment"
                            className="text-[#2563eb] hover:bg-[#3b82f6]  focus:outline-none"
                            aria-label="Report Comment"
                        >
                            <FaFlag size={14} />
                        </button>
                    </div>
                </div>
                <p className="mb-2 text-[#374151]">{comment.text}</p>
                {comment.reported_by && (
                    <p className="text-sm text-red-600 mb-1">Reported by: {comment.reported_by}</p>
                )}
                <button
                    className="text-sm text-[#2563eb] hover:bg-[#3b82f6]  mb-2 flex items-center"
                    onClick={() => setReplyToCommentId(comment.id === replyToCommentId ? null : comment.id)}
                >
                    <FaComment className="mr-1" size={12} />
                    {comment.id === replyToCommentId ? 'Cancel Reply' : 'Reply'}
                </button>
                {comment.id === replyToCommentId && (
                    <div className="mb-2">
                        <textarea
                            className="w-full border border-[#bfdbfe] rounded-lg p-2 mb-1 focus:ring-2 focus:ring-[#2563eb]"
                            rows="3"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                        />
                        <button
                            className="hover:bg-[#3b82f6] text-white px-3 py-1 rounded-lg bg-[#2563eb] transition duration-200"
                            onClick={() => postComment(comment.id)}
                        >
                            Submit Reply
                        </button>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-3 border-l-2 border-[#bfdbfe] pl-4">
                        {renderComments(comment.replies)}
                    </div>
                )}
            </div>
        ));
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#eff6ff]">
            <div className="text-[#2563eb]">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-[#eff6ff]">
            <div className="flex items-center text-red-500">
                <FaExclamationCircle className="mr-2" />
                <p>Error loading project: {error.message}</p>
            </div>
        </div>
    );

    const isAuthenticated = !!localStorage.getItem('accessToken');

    const handleAuthAction = (action) => {
        if (!isAuthenticated) {
            setShowAuthPopup(true);
        } else {
            action();
        }
    };

    const handleDonate = () => navigate(`/projects/${id}/donate`);

    return (
        <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="w-full bg-[#2563eb] p-6 flex flex-col justify-center items-center text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-2">{project.title}</h1>
                    <p className="text-[#ffffff] text-sm sm:text-base">Created by {project.owner}</p>
                </div>

                <div className="p-6 sm:p-8">
                    {project.images && project.images.length > 1 ? (
                        <div className="mb-6">
                            <Slider {...sliderSettings}>
                                {project.images.map((image, index) => (
                                    <div key={image.id}>
                                        <img
                                            src={`http://localhost:8000${image.url}`}
                                            alt={`${project.title} image ${index + 1}`}
                                            className="w-full h-80 object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    ) : project.images && project.images.length === 1 ? (
                        <img
                            src={`http://localhost:8000${project.images[0].url}`}
                            alt={project.title}
                            className="w-full h-80 object-cover rounded-lg mb-6"
                        />
                    ) : (
                        <div className="w-full h-64 bg-[#bfdbfe] flex items-center justify-center text-[#374151] rounded-lg mb-6">
                            No Images Available
                        </div>
                    )}

                    <DescriptionSection details={project.details} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-[#eff6ff] p-4 rounded-lg border border-[#bfdbfe]">
                            <h3 className="text-lg font-semibold text-[#2563eb] mb-3">Campaign Details</h3>
                            <div className="space-y-2">
                                <p className="text-[#374151]"><span className="font-medium">Category:</span> {project.category.name}</p>
                                <p className="text-[#374151]"><span className="font-medium">Target:</span> ${project.total_target}</p>
                                <p className="text-[#374151]"><span className="font-medium">Start Date:</span> {new Date(project.start_time).toLocaleDateString()}</p>
                                <p className="text-[#374151]"><span className="font-medium">End Date:</span> {new Date(project.end_time).toLocaleDateString()}</p>
                                <p className="text-[#374151]"><span className="font-medium">Status:</span> {project.status}</p>
                            </div>
                        </div>

                        <div className="bg-[#eff6ff] p-4 rounded-lg border border-[#bfdbfe]">
                            <h3 className="text-lg font-semibold text-[#2563eb] mb-3">Funding Progress</h3>
                            <div className="mb-4">
                                <div className="w-full bg-[#bfdbfe] rounded-full h-4">
                                    <div
                                        className="bg-[#2563eb] h-4 rounded-full"
                                        style={{ width: `${project.progress_percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-right mt-1 text-[#374151]">{project.progress_percentage}% funded</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-[#2563eb] p-2 rounded-lg text-center text-white">
                                    <p className="text-sm">Raised</p>
                                    <p className="font-bold">${project.total_donations}</p>
                                </div>
                                <div className="bg-[#bfdbfe] p-2 rounded-lg text-center text-[#374151]">
                                    <p className="text-sm">Remaining</p>
                                    <p className="font-bold">${project.remaining_amount}</p>
                                </div>
                                <div className="bg-[#2563eb] p-2 rounded-lg text-center text-white">
                                    <p className="text-sm">Target</p>
                                    <p className="font-bold">${project.total_target}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map(tag => (
                            <span key={tag.id} className="bg-[#bfdbfe] text-[#374151] text-sm font-semibold px-3 py-1 rounded-full">
                                {tag.name}
                            </span>
                        ))}
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#2563eb]">Rate this Campaign</h2>
                            <div className="flex items-center space-x-2 bg-[#eff6ff] px-4 py-2 rounded-full border border-[#bfdbfe]">
                                <span className="text-[#2563eb] font-semibold">Average Rating:</span>
                                <div className="flex items-center">
                                    <span className="text-amber-500 text-xl mr-1">★</span>
                                    <span className="text-[#374151] font-bold">{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
                                    {!averageRating && <span className="text-gray-500 text-sm ml-1">(No ratings yet)</span>}
                                </div>
                            </div>
                        </div>
                        {ratingLoading ? (
                            <div className="flex justify-center">
                                <FaSpinner className="animate-spin text-[#2563eb] text-2xl" />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <label
                                        key={star}
                                        htmlFor={`rating-star-${star}`}
                                        className="cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            id={`rating-star-${star}`}
                                            name="rating"
                                            value={star}
                                            className="hidden"
                                            checked={star === (previousRating || userRating)}
                                            onChange={() => {
                                                setUserRating(star);
                                                if (previousRating !== null) {
                                                    setPreviousRating(star);
                                                    handleRatingSubmit(star);
                                                }
                                            }}
                                        />
                                        <span
                                            className={`text-3xl ${star <= (previousRating || userRating)
                                                ? 'text-amber-500'
                                                : 'text-gray-300'
                                                } hover:scale-110 transition-transform`}
                                            aria-label={`Rate ${star} star`}
                                        >
                                            ★
                                        </span>
                                    </label>
                                ))}
                                {(previousRating || userRating) > 0 && (
                                    <span className="text-[#2563eb] text-lg font-semibold">
                                        {previousRating || userRating}
                                    </span>
                                )}
                            </div>
                        )}
                        {previousRating === null && !ratingLoading && (
                            <button
                                onClick={() => handleAuthAction(() => handleRatingSubmit(userRating))}
                                className={`w-full p-2 rounded-lg ${!userRating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#3b82f6] text-white'
                                    } transition duration-200`}
                                disabled={!userRating}
                            >
                                Submit Rating
                            </button>
                        )}
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-[#2563eb] mb-4">Recent Donations</h2>
                        {project.donations.length > 0 ? (
                            <div className="space-y-3">
                                {project.donations.slice(0, 5).map(donation => (
                                    <div key={donation.id} className="flex items-center justify-between p-3 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]">
                                        <div className="flex items-center">
                                            {donation.user_avatar && (
                                                <img
                                                    src={donation.user_avatar}
                                                    alt={donation.user}
                                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-[#374151]">{donation.user}</p>
                                                <p className="text-xs text-[#374151]">
                                                    {new Date(donation.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#2563eb]">${donation.amount}</span>
                                    </div>
                                ))}
                                {project.donations.length > 5 && (
                                    <button
                                        className="text-[#2563eb] hover:bg-[#3b82f6] text-sm"
                                        onClick={() => navigate(`/projects/${id}/donations`)}
                                    >
                                        View all {project.donations.length} donations →
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]">
                                <p className="text-[#374151]">No donations yet. Be the first to support this Campaign!</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mb-8 relative">
                        <button
                            onClick={() => handleAuthAction(handleDonate)}
                            className={`flex items-center px-6 py-3 rounded-lg ${project.total_donations >= project.total_target
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#2563eb] hover:bg-[#3b82f6] text-white'
                                } transition duration-200`}
                            disabled={project.total_donations >= project.total_target}
                        >
                            <FaDonate className="mr-2" />
                            {project.total_donations >= project.total_target ? 'Target Reached' : 'Donate Now'}
                        </button>

                        <button
                            onClick={() => handleAuthAction(() => openReportModal('project', project.id))}
                            className="flex items-center px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition duration-200"
                        >
                            <FaFlag className="mr-2" />
                            Report Campaign
                        </button>

                        <div ref={shareButtonRef} className="relative">
                            <button
                                onClick={() => handleAuthAction(handleShare)}
                                className="flex items-center px-6 py-3 rounded-lg bg-[#2563eb] hover:bg-[#3b82f6] text-white transition duration-200"
                            >
                                <FaShareAlt className="mr-2" />
                                Share
                            </button>
                            <AnimatePresence>
                                {showShareDropdown && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#bfdbfe] z-50"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="py-2">
                                            {shareLinks.map(({ platform, icon, url }) => (
                                                <button
                                                    key={platform}
                                                    onClick={() => {
                                                        openShareWindow(platform, url);
                                                        setShowShareDropdown(false);
                                                    }}
                                                    className="flex w-full text-left items-center px-4 py-2 text-[#2563eb] hover:bg-[#eff6ff] transition duration-200"
                                                    aria-label={`Share on ${platform}`}
                                                >
                                                    <span className="mr-2">{icon}</span>
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="border-t border-[#bfdbfe] pt-6">
                        <h2 className="text-xl font-bold text-[#2563eb] mb-4 flex items-center">
                            <FaComment className="mr-2" />
                            Comments ({comments.length})
                        </h2>

                        {commentsLoading && (
                            <div className="flex justify-center">
                                <FaSpinner className="animate-spin text-[#2563eb] text-2xl" />
                            </div>
                        )}
                        {commentsError && <p className="text-red-500">{commentsError}</p>}

                        <div className="mb-6">
                            <textarea
                                className="w-full border border-[#bfdbfe] rounded-lg p-3 focus:ring-2 focus:ring-[#2563eb] text-[#374151]"
                                rows="4"
                                placeholder="Share your thoughts about this Campaign..."
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    className="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg  transition duration-200"
                                    onClick={() => handleAuthAction(postComment)}
                                >
                                    Post Comment
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {comments.length === 0 && !commentsLoading && (
                                <div className="text-center py-6 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]">
                                    <p className="text-[#374151]">No comments yet. Be the first to comment!</p>
                                </div>
                            )}
                            {renderComments(comments)}
                        </div>
                    </div>
                </div>

                {showReportModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50">
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-[#bfdbfe]"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-xl font-bold mb-4 text-[#2563eb] flex items-center">
                                <FaFlag className="mr-2" />
                                Report {reportType === 'project' ? 'Campaign' : 'Comment'}
                            </h2>

                            <p className="mb-4 text-[#374151]">
                                Please explain why you're reporting this {reportType}. Your report will be reviewed by our team.
                            </p>

                            <textarea
                                className="w-full h-32 border border-[#bfdbfe] rounded-lg p-3 mb-4 focus:ring-2 focus:ring-[#2563eb] text-[#374151]"
                                placeholder="Enter your reason for reporting..."
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 rounded-lg border border-[#bfdbfe] text-[#374151] hover:bg-[#eff6ff] transition duration-200"
                                    onClick={() => setShowReportModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-white ${!reportReason.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                                        } transition duration-200`}
                                    onClick={submitReport}
                                    disabled={!reportReason.trim()}
                                >
                                    Submit Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showAuthPopup && <AuthPopup onConfirm={() => navigate('/register')} onCancel={() => setShowAuthPopup(false)} />}

                <div className="p-6 sm:p-8">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-[#2563eb] mb-4">Similar Campaigns</h2>
                        {similarLoading && (
                            <div className="flex justify-center">
                                <FaSpinner className="animate-spin text-[#2563eb] text-2xl" />
                            </div>
                        )}
                        {similarError && <p className="text-red-500">{similarError}</p>}
                        {!similarLoading && similarProjects.length === 0 && (
                            <p className="text-[#374151]">No similar Campaigns found.</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {similarProjects.map(similar => {
                                const imageUrl = similar.images && similar.images.length > 0
                                    ? `http://localhost:8000${similar.images[0].url}`
                                    : null;
                                return (
                                    <Link
                                        key={similar.id}
                                        to={`/projects/${similar.id}`}
                                        className="border border-[#bfdbfe] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200"
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={similar.title}
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-[#bfdbfe] flex items-center justify-center text-[#374151]">
                                                No Image
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-[#2563eb] mb-1">{similar.title}</h3>
                                            <p className="text-sm text-[#374151] line-clamp-2">{similar.details}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-xs text-[#374151]">
                                                    {similar.progress_percentage}% funded
                                                </span>
                                                <span className="text-xs font-medium text-[#2563eb]">
                                                    ${similar.total_donations} raised
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;