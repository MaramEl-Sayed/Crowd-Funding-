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

  // New states for comments
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

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
    fetchComments();
  }, [id]);

  // Fetch comments for the project
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

  // Post a new comment or reply
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
      fetchComments();
    } catch (err) {
      Alert.error('Error', err.response?.data?.detail || 'Failed to post comment.');
    }
  };

  // Render comments recursively with replies
  const renderComments = (commentsList) => {
    return commentsList.map((comment) => (
      <div key={comment.id} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-blue-800">{comment.user || 'Anonymous User'}</span>
          <span className="text-xs text-gray-400 italic">{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <p className="mb-3 text-gray-700 whitespace-pre-wrap">{comment.text}</p>
        <button
          className="text-sm text-blue-600 hover:underline mb-3"
          onClick={() => setReplyToCommentId(comment.id === replyToCommentId ? null : comment.id)}
        >
          {comment.id === replyToCommentId ? 'Cancel Reply' : 'Reply'}
        </button>
        {comment.id === replyToCommentId && (
          <div className="mb-4">
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-2"
              rows="3"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
            />
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              onClick={() => postComment(comment.id)}
            >
              Submit Reply
            </button>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-4 border-l-2 border-gray-300 pl-6">
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
      // Refresh project data
      const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/comments/`);
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
    <div className="min-h-screen bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 flex items-center justify-center py-10 px-4">
      <div className="container bg-white shadow-lg rounded-xl p-10 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-700">{project.title}</h1>
        <img
          src={`http://localhost:8000${project.image}`}
          alt={project.title}
          className="w-full h-72 object-cover rounded-lg mb-6 shadow-md"
        />
        <p className="text-gray-800 mb-6 leading-relaxed whitespace-pre-line">{project.details}</p>
        <div className="grid grid-cols-2 gap-6 mb-6 text-gray-700 font-medium">
          <div>
            <p><span className="font-semibold">Category:</span> {project.category}</p>
            <p><span className="font-semibold">Total Target:</span> ${project.total_target}</p>
            <p><span className="font-semibold">Start Date:</span> {new Date(project.start_time).toLocaleDateString()}</p>
            <p><span className="font-semibold">End Date:</span> {new Date(project.end_time).toLocaleDateString()}</p>
          </div>
          <div>
            <p><span className="font-semibold">Average Rating:</span> {averageRating || 'No ratings yet'}</p>
            <p><span className="font-semibold">Total Donations:</span> ${project.total_donations}</p>
            <p><span className="font-semibold">Remaining Amount:</span> ${project.remaining_amount}</p>
            <p><span className="font-semibold">Funded:</span> {project.progress_percentage}%</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <strong className="text-gray-700 mr-2">Tags:</strong>
          {project.tags.map(tag => (
            <span
              key={tag.id}
              className="bg-blue-100 text-blue-900 text-sm font-semibold px-3 py-1 rounded-full shadow-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Donations</h2>
          {project.donations.length > 0 ? (
            <div className="space-y-4">
              {project.donations.map(donation => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
                >
                  <div className="flex items-center">
                    {donation.user_avatar && (
                      <img
                        src={donation.user_avatar}
                        alt={donation.user}
                        className="w-10 h-10 rounded-full mr-4 shadow"
                      />
                    )}
                    <span className="text-gray-800 font-medium">{donation.user || 'Anonymous User'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">${donation.amount}</span>
                    <p className="text-xs text-gray-500">
                      {new Date(donation.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No donations yet. Be the first to support this project!</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Rate this project:</label>
          <div className="flex mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer text-3xl ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setUserRating(star)}
                aria-label={`${star} star`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setUserRating(star); }}
              >
                ★
              </span>
            ))}
          </div>
          <button
            onClick={handleRatingSubmit}
            className={`w-full p-3 rounded-lg font-semibold text-white transition ${
              !userRating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={!userRating}
          >
            Submit Rating
          </button>
        </div>

        <div className="flex justify-between mb-8 space-x-4 flex-wrap">
          <button
            onClick={handleCancelProject}
            className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Cancel Project
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/update`)}
            className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Update Project
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/donate`)}
            className={`flex-1 text-white p-3 rounded-lg font-semibold transition ${
              project.total_donations >= project.total_target
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={project.total_donations >= project.total_target}
          >
            {project.total_donations >= project.total_target ? 'Target Reached' : 'Donate'}
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex-1 bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition font-semibold"
          >
            Report Project
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Comments</h2>

          {commentsLoading && <p className="text-gray-600">Loading comments...</p>}
          {commentsError && <p className="text-red-500">{commentsError}</p>}

          {/* New Comment Input */}
          <div className="mb-6">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <button
              className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition font-semibold"
              onClick={() => postComment(null)}
            >
              Post Comment
            </button>
          </div>

          {/* Comments List */}
          <div>
            {comments.length === 0 && !commentsLoading && (
              <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
            )}
            {renderComments(comments)}
          </div>
        </div>

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
  );
};

export default ProjectDetails;
