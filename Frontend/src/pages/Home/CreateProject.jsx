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
        category_id: '', // Use category_id instead of category
        total_target: '',
        start_time: '',
        end_time: '',
        is_active: true,
    });
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagInput, setNewTagInput] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [categories, setCategories] = useState([]);

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

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/projects/categories/');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                Alert.error('Error!', err.response?.data?.detail || 'Error fetching categories.');
            }
        };

        fetchTags();
        fetchCategories();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }, []);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setNewImages(prev => [...prev, ...files]);
        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prev => [...prev, ...previews]);
        e.target.value = null;
    };

    const handleRemoveNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => {
            const previewToRemove = prev[index];
            URL.revokeObjectURL(previewToRemove);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleTagRemove = useCallback((tagName) => {
        setSelectedTags(prevSelected => prevSelected.filter(t => t !== tagName));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.details || !formData.category_id || !formData.total_target || !formData.start_time || !formData.end_time) {
            setError('Please fill in all required fields.');
            return;
        }
        if (newImages.length === 0) {
            setError('Please upload at least one image.');
            return;
        }
        setLoading(true);
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }
        selectedTags.forEach(tag => formDataToSend.append('tags_ids', tag));
        newImages.forEach((image) => {
            formDataToSend.append('images_files', image);
        });

        try {
            await axios.post('http://localhost:8000/api/projects/projects/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
            setNewImages([]);
            setNewImagePreviews([]);
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
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                            aria-label="Project Category"
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
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
                        <label className="block text-gray-700 font-semibold">Images</label>
                        <input
                            type="file"
                            name="images"
                            onChange={handleImageChange}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            accept="image/*"
                            multiple
                            aria-label="Project Images"
                        />
                        {newImagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {newImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`New project image ${index + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            aria-label="Remove new image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTags.map(tagName => (
                                <span
                                    key={tagName}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                    {tagName}
                                    <button
                                        type="button"
                                        onClick={() => handleTagRemove(tagName)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                        aria-label={`Remove ${tagName} tag`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                placeholder="Add new tag"
                                className="w-full p-3 border border-gray-300 rounded-md"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTagInput.trim()) {
                                        e.preventDefault();
                                        if (!selectedTags.includes(newTagInput.trim())) {
                                            setSelectedTags([...selectedTags, newTagInput.trim()]);
                                        }
                                        setNewTagInput('');
                                    }
                                }}
                                aria-label="Add new tag"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newTagInput.trim() && !selectedTags.includes(newTagInput.trim())) {
                                        setSelectedTags([...selectedTags, newTagInput.trim()]);
                                        setNewTagInput('');
                                    }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                aria-label="Add tag"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-2">
                            <label className="block text-gray-700 font-semibold mb-2">Select Existing Tags</label>
                            <select
                                value=""
                                onChange={(e) => {
                                    if (e.target.value && !selectedTags.includes(e.target.value)) {
                                        setSelectedTags([...selectedTags, e.target.value]);
                                    }
                                    e.target.value = "";
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Select existing tags"
                            >
                                <option value="">Add existing tag...</option>
                                {tags
                                    .filter(tag => !selectedTags.includes(tag.name))
                                    .map(tag => (
                                        <option key={tag.id} value={tag.name}>
                                            {tag.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
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