import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div className="bg-gradient-to-r py-10 from-blue-500 via-purple-500 to-pink-500 min-h-screen flex items-center justify-center">
      <div className="container bg-white shadow-lg rounded-lg p-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">Projects</h1>
          <button
            onClick={() => navigate('/create-project')}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Create Project
          </button>
        </div>
        <ul className="space-y-6">
          {projects.map(project => (
            <li key={project.id} className="border-b pb-4">
              <Link to={`/projects/${project.id}`} className="hover:underline">
                <h2 className="text-xl font-semibold text-blue-600">{project.title}</h2>
              </Link>
              <p className="text-gray-600 mt-2">{project.details}</p>
              <p className="text-gray-500">Category: {project.category}</p>
              <p className="text-gray-500">Average Rating: {project.average_rating || 'No ratings yet'}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;