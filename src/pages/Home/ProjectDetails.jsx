
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
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

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error loading project: {error.message}</p>;

    return (
        <div className="project-details-container">
            <h1 className="project-title">{project.title}</h1>
            <img src={`http://localhost:8000${project.image}`} alt={project.title} className="project-image" />
            <p className="project-details">{project.details}</p>
            <p className="project-category">Category: {project.category}</p>
            <p className="project-target">Total Target: ${project.total_target}</p>
            <p className="project-dates">Start: {new Date(project.start_time).toLocaleDateString()} - End: {new Date(project.end_time).toLocaleDateString()}</p>
            <p className="project-rating">Average Rating: {project.average_rating || 'No ratings yet'}</p>
            <div className="project-tags">
                Tags: {project.tags.map(tag => <span key={tag.id} className="project-tag">{tag.name}</span>)}
            </div>
        </div>
    );
};

export default ProjectDetails;