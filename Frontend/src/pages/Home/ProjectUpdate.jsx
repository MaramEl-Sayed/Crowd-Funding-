import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../alert/Alert';

const ProjectUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        category: '',
        total_target: '',
        start_time: '',
        end_time: '',
        image: null,
        is_active: true
    });

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/projects/projects/${id}/`);
                setProject(response.data);
                setSelectedTags(response.data.tags.map(tag => tag.id));
                setFormData({
                    title: response.data.title,
                    details: response.data.details,
                    category: response.data.category,
                    total_target: response.data.total_target,
                    start_time: response.data.start_time,
                    end_time: response.data.end_time,
                    image: null,
                    is_active: response.data.is_active
                });
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchTags = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/tags/');
                setTags(response.data);
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        };

        fetchProjectDetails();
        fetchTags();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleTagChange = (tagId) => {
        setSelectedTags(prevSelected => 
            prevSelected.includes(tagId) 
                ? prevSelected.filter(id => id !== tagId) 
                : [...prevSelected, tagId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formDataToSend = new FormData();
        for (const key in formData) {
            if (formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        }
        selectedTags.forEach(tag => formDataToSend.append('tags', tag));

        try {
            await axios.put(`http://localhost:8000/api/projects/projects/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            Alert.success('Updated!', 'Project updated successfully');
            navigate(`/projects/${id}`);
        } catch (err) {
            Alert.error('Error!', err.response?.data?.detail || 'Failed to update project');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error loading project: {error.message}</p>;

    return (
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 min-h-screen py-10">
            <div className="container mx-auto max-w-3xl bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Update Project</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Other form fields same as CreateProject.jsx */}
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
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectUpdate;
