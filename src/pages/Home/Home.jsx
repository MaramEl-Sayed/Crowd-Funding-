// filepath: d:\crwod-demo\aregFront\src\pages\Home\Home.jsx
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
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 min-h-screen flex items-center justify-center">
      <div className="container bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-400">Projects</h1>
        <ul className="space-y-4">
          {projects.map(project => (
            <li key={project.id} className="border-b pb-4">
              <Link to={`/projects/${project.id}`}>
                <h2 className="text-xl font-semibold text-blue-200">{project.title}</h2>
              </Link>
              <p className="text-gray-200">{project.details}</p>
              <p className="text-gray-200">Category: {project.category}</p>
              <p className="text-gray-200">Average Rating: {project.average_rating || 'No ratings yet'}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;