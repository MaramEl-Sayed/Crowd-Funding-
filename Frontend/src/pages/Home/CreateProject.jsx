import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
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
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const categories = [
        "Technology",
        "Health",
        "Education",
        "Art",
        "Charity",
    ];

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/projects/tags/');
                setTags(response.data);
            } catch (err) {
                console.error('Error fetching tags:', err);
                Alert.error('Error!', err.response?.data?.detail || 'Error fetching tags.');
            }
        };

        fetchTags();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData(prevFormData => ({ ...prevFormData, image: files[0] }));
        } else {
            setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
        }
    }, []);

    const handleTagChange = useCallback((tagId) => {
        setSelectedTags(prevSelected =>
            prevSelected.includes(tagId)
                ? prevSelected.filter(id => id !== tagId)
                : [...prevSelected, tagId]
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.details || !formData.category || !formData.total_target || !formData.start_time || !formData.end_time) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }
        selectedTags.forEach(tag => formDataToSend.append('tags', tag));

        try {
            await axios.post('http://localhost:8000/api/projects/projects/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSuccess(true);
            setError(null);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.title?.[0] || 'Error creating project');
            setSuccess(false);
            console.log(err);
            Alert.error('Error!', err.response?.data?.title?.[0] || 'Error creating project.');
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
                {error && (
                    <div className="flex items-center justify-center mb-4 text-red-500">
                        <FaExclamationCircle className="mr-2" />
                        <p>{error}</p>
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
                            aria-label="Project Title"
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
                            aria-label="Project Details"
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
                            aria-label="Project Category"
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
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
                            aria-label="Total Target"
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
                            aria-label="Start Time"
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
                            aria-label="End Time"
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
                            aria-label="Project Image"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                    <span
                                        key={tagId}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {tag.name}
                                        <button
                                            type="button"
                                            onClick={() => handleTagChange(tagId)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                            aria-label={`Remove ${tag.name} tag`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleTagChange(e.target.value);
                                    e.target.value = "";
                                }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Select Tags"
                        >
                            <option value="">Select tags to add...</option>
                            {tags
                                .filter(tag => !selectedTags.includes(tag.id))
                                .map(tag => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Select tags that describe your project</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-200 flex items-center justify-center"
                        disabled={loading}
                        aria-label="Create Project"
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;