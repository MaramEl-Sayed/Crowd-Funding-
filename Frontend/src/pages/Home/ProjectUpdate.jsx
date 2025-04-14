import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../alert/Alert';

const ProjectUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16); // yyyy-MM-ddThh:mm
    };

    useEffect(() => {


        const fetchProjectDetails = async () => {
            try {
                const [projectRes, tagsRes] = await Promise.all([
                    axios.get(`http://localhost:8000/api/projects/projects/${id}/`),
                    axios.get('http://localhost:8000/api/projects/tags/')
                ]);

                const project = projectRes.data;
                setFormData({
                    title: project.title,
                    details: project.details,
                    category: project.category,
                    total_target: project.total_target,
                    start_time: formatDateForInput(project.start_time),
                    end_time: formatDateForInput(project.end_time),
                    image: null,
                    is_active: project.is_active
                });

                setSelectedTags(project.tags.map(tag => tag.id));
                setTags(tagsRes.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, image: files[0] });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleTagChange = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) data.append(key, value);
        });

        selectedTags.forEach(tag => data.append('tags', tag));

        try {
            await axios.put(`http://localhost:8000/api/projects/projects/${id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            Alert.success('Updated!', 'Project updated successfully');
            navigate(`/projects/${id}`);
        } catch (err) {
            Alert.error('Error!', err.response?.data?.detail || 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

    return (
        <div className="bg-gray-100 min-h-screen py-10">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Update Project</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="text" name="title" value={formData.title} onChange={handleChange}
                        placeholder="Title" className="w-full p-3 border rounded" required />

                    <textarea name="details" value={formData.details} onChange={handleChange}
                        placeholder="Details" rows="4" className="w-full p-3 border rounded" required />

                    <input type="text" name="category" value={formData.category} onChange={handleChange}
                        placeholder="Category" className="w-full p-3 border rounded" />

                    <input type="number" name="total_target" value={formData.total_target} onChange={handleChange}
                        placeholder="Total Target" className="w-full p-3 border rounded" />

                    <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange}
                        className="w-full p-3 border rounded" />

                    <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange}
                        className="w-full p-3 border rounded" />

                    <div>
                        <label className="block mb-2 font-medium">Upload Image</label>
                        <input type="file" name="image" accept="image/*" onChange={handleChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0 file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                    <span key={tagId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
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
                                    handleTagChange(parseInt(e.target.value));
                                    e.target.value = "";
                                }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        >
                            <option value="">Add more tags...</option>
                            {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="h-4 w-4"
                        />
                        <span className="text-gray-700">Active</span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
                    >
                        {loading ? 'Updating...' : 'Update Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectUpdate;
