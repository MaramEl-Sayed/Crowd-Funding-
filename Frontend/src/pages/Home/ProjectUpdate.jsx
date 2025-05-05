import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaCamera } from 'react-icons/fa';
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

        newImages.forEach((image) => {
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
            await fetchProjectDetails();
            Alert.success('Updated!', 'Project updated successfully');
            navigate(`/projects/${id}`);
        } catch (err) {
            Alert.error('Error!', err.response?.data?.detail || 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F2EFE7]">
            <div className="text-[#006A71]">
                <FaSpinner className="animate-spin text-4xl" />
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F2EFE7]">
            <div className="flex items-center text-red-500">
                <FaExclamationCircle className="mr-2" />
                <p>Error: {error.message}</p>
            </div>
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F2EFE7] p-4">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="w-full bg-[#006A71] p-6 flex flex-col justify-center items-center text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-2">Update Campaign</h1>
                    <p className="text-[#ffffff] text-sm sm:text-base">Edit your Campaign details</p>
                </div>

                <div className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Campaign Title"
                                className="w-full pl-4 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                                required
                                aria-label="Campaign Title"
                            />
                        </div>

                        <div className="relative">
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                placeholder="Campaign Details"
                                rows="4"
                                className="w-full pl-4 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                                required
                                aria-label="Campaign Details"
                            />
                        </div>

                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full pl-4 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                                required
                                aria-label="Campaign Category"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                name="total_target"
                                value={formData.total_target}
                                onChange={handleChange}
                                placeholder="Total Target"
                                className="w-full pl-4 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                                required
                                aria-label="Total Target"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                                    required
                                    aria-label="Start Time"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-4 py-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71] text-[#1e1e1e] text-sm sm:text-base"
                                    required
                                    aria-label="End Time"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-[#1e1e1e] text-sm sm:text-base">Existing Images</label>
                            {existingImages.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                    {existingImages.map((image, index) => (
                                        <div key={image.id} className="relative">
                                            <img
                                                src={`http://localhost:8000${image.url}`}
                                                alt={`Existing Campaign image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-[#9ACBD0]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteExistingImage(image.id, index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 text-xs"
                                                aria-label="Delete image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[#1e1e1e]">No existing images.</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 text-[#1e1e1e] text-sm sm:text-base">Upload New Images</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#9ACBD0] border-dashed rounded-lg cursor-pointer hover:bg-[#F2EFE7]">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaCamera className="text-[#48A6A7] w-8 h-8 mb-2" />
                                        <p className="text-sm text-[#1e1e1e]">Click to upload images</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        multiple
                                        aria-label="Campaign Images"
                                    />
                                </label>
                            </div>
                            {newImagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                    {newImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`New Campaign image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-[#9ACBD0]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 text-xs"
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
                            <label className="block text-[#1e1e1e] mb-2 text-sm sm:text-base">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedTags.map(tagName => (
                                    <span
                                        key={tagName}
                                        className="bg-[#9ACBD0] text-[#1e1e1e] px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {tagName}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tagName)}
                                            className="ml-2 text-[#006A71] hover:text-[#1e1e1e]"
                                            aria-label={`Remove ${tagName} tag`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    placeholder="Add new tag"
                                    className="flex-1 p-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71]"
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
                                    className="bg-[#48A6A7] text-white px-4 py-2 rounded-lg hover:bg-[#006A71] transition duration-300"
                                    aria-label="Add tag"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-2">
                                <select
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value && !selectedTags.includes(e.target.value)) {
                                            setSelectedTags([...selectedTags, e.target.value]);
                                        }
                                        e.target.value = "";
                                    }}
                                    className="w-full p-2 border border-[#9ACBD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006A71]"
                                    aria-label="Select existing tags"
                                >
                                    <option value="">Add existing tag...</option>
                                    {tags.filter(tag => !selectedTags.includes(tag.name)).map(tag => (
                                        <option key={tag.id} value={tag.name}>{tag.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#006A71] hover:bg-[#04828c] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base flex items-center justify-center"
                            aria-label="Update Campaign"
                        >
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Update Campaign'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProjectUpdate;