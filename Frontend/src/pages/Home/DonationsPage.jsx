import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaArrowLeft, FaDonate } from 'react-icons/fa';
import Alert from '../../alert/Alert';

const DonationsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                setLoading(true);
                // Fetch project details first
                const projectResponse = await axios.get(`http://localhost:8000/api/projects/projects/${id}/`);
                setProject(projectResponse.data);

                // Then fetch all donations
                const donationsResponse = await axios.get(`http://localhost:8000/api/projects/projects/${id}/donations/`);
                setDonations(donationsResponse.data);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to load donations');
                Alert.error('Error', err.response?.data?.detail || 'Failed to load donations');
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#eff6ff]">
                <FaSpinner className="animate-spin text-[#2563eb] text-4xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#eff6ff]">
                <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
                    <h2 className="text-xl font-bold text-red-500 mb-4">Error Loading Donations</h2>
                    <p className="text-[#374151] mb-4">{error}</p>
                    <button
                        onClick={() => navigate(`/projects/${id}`)}
                        className="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg"
                    >
                        Back to Project
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-[#2563eb] p-6 text-white">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(`/projects/${id}`)}
                            className="flex items-center hover:bg-[#3b82f6] px-3 py-1 rounded-lg transition"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Project
                        </button>
                        <h1 className="text-2xl font-bold text-center flex-1">
                            All Donations for {project?.title}
                        </h1>
                    </div>
                    <div className="mt-4 flex justify-center items-center space-x-4">
                        <div className="bg-white text-[#2563eb] px-4 py-2 rounded-lg shadow-sm">
                            <span className="font-bold">Total Donations:</span> ${project?.total_donations}
                        </div>
                        <div className="bg-white text-[#2563eb] px-4 py-2 rounded-lg shadow-sm">
                            <span className="font-bold">Donors:</span> {donations.length}
                        </div>
                    </div>
                </div>

                {/* Donations List */}
                <div className="p-6">
                    {donations.length === 0 ? (
                        <div className="text-center py-12">
                            <FaDonate className="text-4xl text-[#2563eb] mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-[#374151]">No donations yet</h3>
                            <p className="text-[#374151] mt-2">Be the first to support this campaign!</p>
                            <button
                                onClick={() => navigate(`/projects/${id}/donate`)}
                                className="mt-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white px-6 py-2 rounded-lg"
                            >
                                Donate Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 font-semibold text-[#2563eb] border-b border-[#bfdbfe] pb-2 mb-2">
                                <div className="col-span-5">Donor</div>
                                <div className="col-span-3">Amount</div>
                                <div className="col-span-4">Date</div>
                            </div>
                            {donations.map((donation) => (
                                <div
                                    key={donation.id}
                                    className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-[#eff6ff] rounded-lg transition"
                                >
                                    <div className="col-span-5 flex items-center">
                                        {donation.user_avatar && (
                                            <img
                                                src={donation.user_avatar}
                                                alt={donation.user}
                                                className="w-10 h-10 rounded-full mr-3 object-cover"
                                            />
                                        )}
                                        <span className="font-medium text-[#374151]">{donation.user}</span>
                                    </div>
                                    <div className="col-span-3 font-bold text-[#2563eb]">
                                        ${donation.amount}
                                    </div>
                                    <div className="col-span-4 text-sm text-[#374151]">
                                        {new Date(donation.date).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonationsPage;