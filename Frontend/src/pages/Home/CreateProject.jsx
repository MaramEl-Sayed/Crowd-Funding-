import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaCamera, FaFileUpload, FaIdCard } from 'react-icons/fa';
import Alert from '../../alert/Alert';

const COLORS = {
    primary: "#2563eb",     // blue-600
    secondary: "#3b82f6",   // blue-500
    accent: "#bfdbfe",      // blue-200
    background: "#eff6ff",  // blue-100
    textDark: "#374151",    // gray-700
    textLight: "#ffffff"    // white
};

const CreateCampaign = () => {
    const token = localStorage.getItem('accessToken');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        category_id: '',
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

    // New frontend-only state
    const [userPhoto, setUserPhoto] = useState(null);
    const [userPhotoPreview, setUserPhotoPreview] = useState('');
    const [idFrontImage, setIdFrontImage] = useState(null);
    const [idFrontPreview, setIdFrontPreview] = useState('');
    const [idBackImage, setIdBackImage] = useState(null);
    const [idBackPreview, setIdBackPreview] = useState('');
    const [supportingFiles, setSupportingFiles] = useState([]);
    const [supportingFilePreviews, setSupportingFilePreviews] = useState([]);
    const [instructions] = useState([
        '1. Ensure all information provided is accurate and truthful.',
        '2. Campaigns will be reviewed within 24-48 hours.',
        '3. Provide clear images and supporting documents.',
        '4. False information may result in campaign rejection.',
        '5. Contact support if you need assistance.'
    ].join('\n'));

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

    const handleUserPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserPhoto(file);
            setUserPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleIdFrontChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdFrontImage(file);
            setIdFrontPreview(URL.createObjectURL(file));
        }
    };

    const handleIdBackChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdBackImage(file);
            setIdBackPreview(URL.createObjectURL(file));
        }
    };

    const handleSupportingFilesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSupportingFiles(prev => [...prev, ...files]);
            const previews = files.map(file => ({
                url: URL.createObjectURL(file),
                name: file.name,
                type: file.type
            }));
            setSupportingFilePreviews(prev => [...prev, ...previews]);
        }
    };

    const removeSupportingFile = (index) => {
        setSupportingFiles(prev => prev.filter((_, i) => i !== index));
        setSupportingFilePreviews(prev => {
            URL.revokeObjectURL(prev[index].url);
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
            setError('Please upload at least one campaign image.');
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

            // Clean up object URLs
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
            if (userPhotoPreview) URL.revokeObjectURL(userPhotoPreview);
            if (idFrontPreview) URL.revokeObjectURL(idFrontPreview);
            if (idBackPreview) URL.revokeObjectURL(idBackPreview);
            supportingFilePreviews.forEach(file => URL.revokeObjectURL(file.url));

            // Reset all states
            setNewImages([]);
            setNewImagePreviews([]);
            setUserPhoto(null);
            setUserPhotoPreview('');
            setIdFrontImage(null);
            setIdFrontPreview('');
            setIdBackImage(null);
            setIdBackPreview('');
            setSupportingFiles([]);
            setSupportingFilePreviews([]);

            setSuccess(true);
            setError(null);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.title?.[0] || 'Error creating campaign');
            setSuccess(false);
            console.log(err);
            Alert.error('Error!', err.response?.data?.title?.[0] || 'Error creating campaign.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#eff6ff] p-4">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="w-full bg-[#2563eb] p-6 flex flex-col justify-center items-center text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-2">Create New Campaign</h1>
                    <p className="text-[#ffffff] text-sm sm:text-base">Bring your creative ideas to life</p>
                </div>

                <div className="p-6 sm:p-8">
                    {success && (
                        <div className="flex items-center justify-center mb-4 text-green-500">
                            <FaCheckCircle className="mr-2" />
                            <p>Campaign created successfully!</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center justify-center mb-4 text-red-500">
                            <FaExclamationCircle className="mr-2" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Campaign Title"
                                className="w-full pl-4 pr-4 py-2 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151] text-sm sm:text-base"
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
                                className="w-full pl-4 pr-4 py-2 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151] text-sm sm:text-base"
                                required
                                aria-label="Campaign Details"
                            />
                        </div>

                        <div className="relative">
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full pl-4 pr-4 py-2 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151] text-sm sm:text-base"
                                required
                                aria-label="Campaign Category"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
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
                                className="w-full pl-4 pr-4 py-2 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151] text-sm sm:text-base"
                                required
                                aria-label="Total Target"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    type="date"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-4 py-2 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151] text-sm sm:text-base"
                                    required
                                    aria-label="Start Time"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-4 py-2 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151] text-sm sm:text-base"
                                    required
                                    aria-label="End Time"
                                />
                            </div>
                        </div>
                        {/* Tags Section */}
                        <div className="mb-4">
                            <label className="block text-text-dark mb-2 text-sm sm:text-base">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedTags.map(tagName => (
                                    <span
                                        key={tagName}
                                        className="bg-accent text-text-dark px-3 py-1 rounded-full text-sm flex items-center"
                                    >
                                        {tagName}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(tagName)}
                                            className="ml-2 text-[#2563eb] hover:text-text-dark"
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
                                    className="flex-1 p-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
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
                                    className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-secondary transition duration-300"
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
                                    className="w-full p-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
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

                        <div className="relative">
                            <label className="block mb-2 text-text-dark text-sm sm:text-base">Campaign Images</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-accent border-dashed rounded-lg cursor-pointer hover:bg-backgroundStart">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaCamera className="text-accent w-8 h-8 mb-2" />
                                        <p className="text-sm text-text-dark">Click to upload campaign images</p>
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
                                                alt={`Campaign image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-accent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 text-xs"
                                                aria-label="Remove campaign image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Verification Section */}
                        <div className="border-t border-b border-[#bfdbfe] py-6 my-6">
                            <h2 className="text-xl font-semibold mb-4 text-[#3B82F6]">User Verification</h2>

                            {/* User Photo */}
                            <div className="mb-6">
                                <label className="block mb-2 text-[#2D3748]">Your Photo</label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-32 border-2 border-[#bfdbfe] border-dashed rounded-lg cursor-pointer hover:bg-[#E1ECF5]">
                                        {userPhotoPreview ? (
                                            <img src={userPhotoPreview} alt="User preview" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <FaCamera className="text-[#3B82F6] w-6 h-6 mb-2" />
                                                <p className="text-xs text-center text-[#2D3748]">Upload your photo</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            required
                                            onChange={handleUserPhotoChange}
                                            accept="image/*"
                                        />
                                    </label>
                                    <div className="text-sm text-gray-600 flex-1">
                                        <p className="font-medium">Profile Photo Requirements:</p>
                                        <ul className="list-disc pl-5 mt-1 space-y-1">
                                            <li>Clear, recent photo of your face</li>
                                            <li>No filters or heavy editing</li>
                                            <li>Well-lit with neutral background</li>
                                            <li>Must match your ID photo</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* ID Front */}
                            <div className="mb-6">
                                <label className="block mb-2 text-[#2D3748]">ID Front Side</label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-32 border-2 border-[#bfdbfe] border-dashed rounded-lg cursor-pointer hover:bg-[#E1ECF5]">
                                        {idFrontPreview ? (
                                            <img src={idFrontPreview} alt="ID front preview" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <FaIdCard className="text-[#3B82F6] w-6 h-6 mb-2" />
                                                <p className="text-xs text-center text-[#2D3748]">Upload ID front</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            required
                                            onChange={handleIdFrontChange}
                                            accept="image/*"
                                        />
                                    </label>
                                    <div className="text-sm text-gray-600 flex-1">
                                        <p className="font-medium">ID Front Requirements:</p>
                                        <ul className="list-disc pl-5 mt-1 space-y-1">
                                            <li>Clear photo of the front of your government-issued ID</li>
                                            <li>Must show full document with all corners visible</li>
                                            <li>All text must be readable</li>
                                            <li>Accepted IDs: Passport, Driver's License, National ID</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* ID Back */}
                            <div className="mb-2">
                                <label className="block mb-2 text-[#2D3748]">ID Back Side</label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="flex-shrink-0 flex flex-col items-center justify-center w-32 h-32 border-2 border-[#bfdbfe] border-dashed rounded-lg cursor-pointer hover:bg-[#E1ECF5]">
                                        {idBackPreview ? (
                                            <img src={idBackPreview} alt="ID back preview" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <FaIdCard className="text-[#3B82F6] w-6 h-6 mb-2" />
                                                <p className="text-xs text-center text-[#2D3748]">Upload ID back</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            required
                                            onChange={handleIdBackChange}
                                            accept="image/*"
                                        />
                                    </label>
                                    <div className="text-sm text-gray-600 flex-1">
                                        <p className="font-medium">ID Back Requirements:</p>
                                        <ul className="list-disc pl-5 mt-1 space-y-1">
                                            <li>Clear photo of the back of your ID</li>
                                            <li>Must show any security features or additional information</li>
                                            <li>All text must be readable</li>
                                            <li>Ensure barcode/magnetic strip is visible if present</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supporting Documents */}
                        <div className="mb-6">
                            <label className="block mb-2 text-[#2D3748]">Supporting Documents</label>
                            <div className="flex flex-col space-y-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#bfdbfe] border-dashed rounded-lg cursor-pointer hover:bg-[#E1ECF5]">
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <FaFileUpload className="text-[#3B82F6] w-8 h-8 mb-2" />
                                        <p className="text-sm text-[#2D3748]">Upload supporting documents</p>
                                        <p className="text-xs text-gray-500">(PDF, JPG, PNG up to 5MB each)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        required
                                        onChange={handleSupportingFilesChange}
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </label>

                                {supportingFilePreviews.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        {supportingFilePreviews.map((file, index) => (
                                            <div key={index} className="relative border border-[#bfdbfe] rounded-lg p-2">
                                                {file.type.startsWith('image/') ? (
                                                    <div className="flex flex-col h-full">
                                                        <img
                                                            src={file.url}
                                                            alt={`Supporting document ${index + 1}`}
                                                            className="w-full h-32 object-contain"
                                                        />
                                                        <p className="text-xs text-center truncate mt-2">{file.name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <div className="bg-[#E1ECF5] rounded-full p-4 mb-2">
                                                            <FaFileUpload className="text-[#3B82F6] w-6 h-6" />
                                                        </div>
                                                        <p className="text-xs text-center truncate w-full">{file.name}</p>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSupportingFile(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Upload any documents that support your campaign (medical reports, bills, certificates, etc.)
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-[#E1ECF5] p-4 rounded-lg">
                            <h3 className="font-semibold text-[#3B82F6] mb-2">Important Instructions</h3>
                            <div className="bg-white p-3 rounded">
                                <pre className="text-sm text-[#2D3748] whitespace-pre-wrap font-sans">{instructions}</pre>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-[#ffffff] font-semibold py-2 sm:py-3 rounded-lg transition duration-300 text-sm sm:text-base flex items-center justify-center"
                            disabled={loading}
                            aria-label="Create Campaign"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Creating Campaign...
                                </>
                            ) : 'Create Campaign'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;