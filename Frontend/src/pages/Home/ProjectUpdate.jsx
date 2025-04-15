import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../alert/Alert';

const ProjectUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagInput, setNewTagInput] = useState('');
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        details: '',
        category: '',
        total_target: '',
        start_time: '',
        end_time: '',
        is_active: true
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
    };

    const fetchProjectDetails = async () => {
        try {
            const [projectRes, tagsRes, categoriesRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/projects/projects/${id}/`),
                axios.get('http://localhost:8000/api/projects/tags/'),
                axios.get('http://localhost:8000/api/projects/categories/')
            ]);

            const project = projectRes.data;
            setFormData({
                title: project.title,
                details: project.details,
                category: project.category,
                total_target: project.total_target,
                start_time: formatDateForInput(project.start_time),
                end_time: formatDateForInput(project.end_time),
                is_active: project.is_active
            });

            setExistingImages(project.images || []);
            setSelectedTags(project.tags.map(tag => tag.name));
            setTags(tagsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

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

    const handleDeleteExistingImage = async (imageId, index) => {
        const result = await Alert.confirm(
            'Are you sure?',
            'Do you really want to delete this image?',
            'Yes, delete it!'
        );

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:8000/api/projects/projects/${id}/images/${imageId}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setExistingImages(prev => prev.filter((_, i) => i !== index));
            Alert.success('Deleted!', 'Image has been deleted.');
        } catch (err) {
            Alert.error('Error!', err.response?.data?.detail || 'Failed to delete image');
        }
    };

    const handleTagRemove = (tagName) => {
        setSelectedTags(prev => prev.filter(t => t !== tagName));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                data.append(key, value);
            }
        });

        selectedTags.forEach(tag => data.append('tags_ids', tag));

        newImages.forEach((image, index) => {
            data.append('images_files', image);
        });

        try {
            await axios.put(`http://localhost:8000/api/projects/projects/${id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
            setNewImages([]);
            setNewImagePreviews([]);
            // Refetch project details to update existingImages
            await fetchProjectDetails();
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
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Title"
                        className="w-full p-3 border rounded"
                        required
                    />

                    <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        placeholder="Details"
                        rows="4"
                        className="w-full p-3 border rounded"
                        required
                    />

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="total_target"
                        value={formData.total_target}
                        onChange={handleChange}
                        placeholder="Total Target"
                        className="w-full p-3 border rounded"
                    />

                    <input
                        type="datetime-local"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                    />

                    <input
                        type="datetime-local"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                    />

                    <div>
                        <label className="block mb-2 font-medium">Existing Images</label>
                        {existingImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {existingImages.map((image, index) => (
                                    <div key={image.id} className="relative">
                                        <img
                                            src={`http://localhost:8000${image.url}`}
                                            alt={`Existing project image ${index + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingImage(image.id, index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            aria-label="Delete image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No existing images.</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Upload New Images</label>
                        <input
                            type="file"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                                <span key={tagName} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    {tagName}
                                    <button
                                        type="button"
                                        onClick={() => handleTagRemove(tagName)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
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
                                className="w-full p-3 border border-gray-300 rounded-md"
                            >
                                <option value="">Add existing tag...</option>
                                {tags.filter(tag => !selectedTags.includes(tag.name)).map(tag => (
                                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                                ))}
                            </select>
                        </div>
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