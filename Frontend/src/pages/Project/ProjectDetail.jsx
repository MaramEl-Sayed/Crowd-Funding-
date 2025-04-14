import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import './ProjectDetail.module.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}/`);
        setProject(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-container">
      <div className="project-header">
        <h1>{project.title}</h1>
        <p>By {project.owner}</p>
      </div>

      <div className="project-stats">
        <div className="stat">
          <h3>${project.total_donations}</h3>
          <p>Raised of ${project.total_target}</p>
        </div>
        <div className="stat">
          <h3>${project.remaining_amount}</h3>
          <p>Remaining to reach target</p>
        </div>
        <div className="stat">
          <h3>{project.progress_percentage}%</h3>
          <p>Funded</p>
        </div>
      </div>

      <div className="project-details">
        <img src={project.image} alt={project.title} />
        <p>{project.details}</p>
      </div>

      <div className="rating-section">
        <h2>Average Rating: {project.average_rating || 'No ratings yet'}</h2>
        <div className="rating-controls">
          <select 
            value={userRating} 
            onChange={(e) => setUserRating(Number(e.target.value))}
            className="rating-select"
          >
            <option value="0">Select a rating</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
          <button 
            onClick={handleRatingSubmit}
            className="rating-submit"
            disabled={!userRating}
          >
            Submit Rating
          </button>
        </div>
      </div>

      <div className="donations-section">
        <h2>Recent Donations</h2>
        {project.donations.length > 0 ? (
          <ul className="donations-list">
            {project.donations.map(donation => (
              <li key={donation.id} className="donation-item">
                <div className="donation-user">
                  {donation.user_avatar && (
                    <img src={donation.user_avatar} alt={donation.user} />
                  )}
                  <span>{donation.user}</span>
                </div>
                <div className="donation-info">
                  <span className="amount">${donation.amount}</span>
                  <span className="date">
                    {new Date(donation.date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No donations yet. Be the first to support this project!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
