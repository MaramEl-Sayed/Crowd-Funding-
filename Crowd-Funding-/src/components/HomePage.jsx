import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Sample data for projects with images
  const topRatedProjects = [
    { id: 1, title: 'Project A', rating: 4.8, image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
    { id: 2, title: 'Project B', rating: 4.7, image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
    { id: 3, title: 'Project C', rating: 4.6, image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
  ];

  const latestProjects = [
    { id: 4, title: 'Project D', image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
    { id: 5, title: 'Project E', image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
  ];

  const featuredProjects = [
    { id: 6, title: 'Project F', image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
    { id: 7, title: 'Project G', image: 'https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/' },
  ];

  const categories = ['Health', 'Education', 'Technology', 'Environment'];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = [...topRatedProjects, ...latestProjects, ...featuredProjects].filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <nav>
        <h1>Crowd-Funding Platform</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/">Projects</Link></li>
          <li><Link to="/">Categories</Link></li>
          <li><Link to="/">About</Link></li>
          <li><Link to="/">Contact</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
        </ul>
        <input
          type="text"
          placeholder="Search projects"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </nav>

      <h2>Top Rated Projects</h2>
      <div className="slider">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card">
            <img src={project.image} alt={project.title} />
            <h3>{project.title}</h3>
            <p>Rating: {project.rating}</p>
          </div>
        ))}
      </div>

      <h2>Latest Projects</h2>
      <div>
        {latestProjects.map(project => (
          <div key={project.id} className="project-card">
            <img src={project.image} alt={project.title} />
            <h3>{project.title}</h3>
          </div>
        ))}
      </div>

      <h2>Featured Projects</h2>
      <div>
        {featuredProjects.map(project => (
          <div key={project.id} className="project-card">
            <img src={project.image} alt={project.title} />
            <h3>{project.title}</h3>
          </div>
        ))}
      </div>

      <h2>Categories</h2>
      <ul>
        {categories.map((category, index) => (
          <li key={index}>{category}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;