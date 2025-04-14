import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";

const Home = () => {
    const [topRatedProjects, setTopRatedProjects] = useState([]);
    const [latestProjects, setLatestProjects] = useState([]);

    useEffect(() => {
        // جلب أعلى المشاريع تقييمًا
        axios.get("http://127.0.0.1:8000/api/projects/projects/top-rated/")
            .then((res) => setTopRatedProjects(res.data))
            .catch((err) => console.error("Error fetching top-rated projects", err));

        // جلب أحدث المشاريع
        axios.get("http://127.0.0.1:8000/api/projects/projects/latest/")
            .then((res) => setLatestProjects(res.data))
            .catch((err) => console.error("Error fetching latest projects", err));
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* سلايدر المشاريع الأعلى تقييمًا */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Top Rated Projects</h2>
            <Slider {...settings}>
                {topRatedProjects.map((project) => (
                    <div key={project.id} className="relative p-4">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row items-center">
                            <img
                                src={`http://localhost:8000${project.image}`}
                                alt={project.title}
                                className="w-full md:w-1/2 h-64 object-cover"
                            />
                            <div className="p-6 md:w-1/2">
                                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-4">{project.description}</p>
                                <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
                                    تبرع الآن
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>

            {/* قائمة أحدث 5 مشاريع */}
            <h2 className="text-2xl md:text-3xl font-bold my-10 text-center">Latest Projects</h2>
            <div className="grid gap-6 md:grid-cols-2">
                {latestProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4">
                        <img
                            src={`http://localhost:8000${project.image}`}
                            alt={project.title}
                            className="w-full md:w-48 h-48 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                            <p className="text-gray-600 line-clamp-3 mb-4">{project.description}</p>
                            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                                تبرع الآن
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
