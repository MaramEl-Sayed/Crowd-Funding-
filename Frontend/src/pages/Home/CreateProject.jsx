import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Alert from '../../alert/Alert';

const CreateProject = () => {
    const token = localStorage.getItem('accessToken');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        category: '',
        total_target: '',
        start_time: '',
        end_time: '',
        image: null,
        is_active: true,
    });
    const [categories, setCategories] = useState([]);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/projects/tags/');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }

        try {
            await axios.post('http://localhost:8000/api/projects/projects/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            Alert.success('Success', 'Project created successfully!');
            setSuccess(true);
            navigate('/home');
        } catch (err) {
            const errorMessage = err.response ? JSON.stringify(err.response.data.detail) : 'Error creating project';
            Alert.error('Error', errorMessage);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r py-10 from-blue-500 via-purple-500 to-pink-500 min-h-screen flex items-center justify-center">
            <div className="container bg-white shadow-lg rounded-lg p-8 max-w-3xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Create New Project</h1>
                {success && (
                    <div className="flex items-center justify-center mb-4 text-green-500">
                        <FaCheckCircle className="mr-2" />
                        <p>Project created successfully!</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Details</label>
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Total Target</label>
                        <input
                            type="number"
                            name="total_target"
                            value={formData.total_target}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Start Time</label>
                        <input
                            type="date"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">End Time</label>
                        <input
                            type="date"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            accept="image/*"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-200 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
