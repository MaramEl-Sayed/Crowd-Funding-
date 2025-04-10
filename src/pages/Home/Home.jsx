// src/Home.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="container">
      <h1 className="title">Projects</h1>
      <ul className="project-list">
        {projects.map(project => (
          <li key={project.id} className="project-item">
            <Link to={`/projects/${project.id}`}>
              <h2 className="project-title">{project.title}</h2>
            </Link>
            <p className="project-details">{project.details}</p>
            <p className="project-category">Category: {project.category}</p>
            <p className="project-rating">Average Rating: {project.average_rating || 'No ratings yet'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;