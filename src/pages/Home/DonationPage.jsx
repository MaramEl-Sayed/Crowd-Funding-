import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../alert/Alert';

const DonationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDonation = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://127.0.0.1:8000/api/projects/donations/', {
                project: id,
                amount: parseFloat(amount),
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            Alert.success('Thank you!', 'Your donation has been successfully processed.');
            navigate(`/projects/${id}`);
        } catch (err) {
            Alert.error('Error!', err.response.data.detail || 'There was an error processing your donation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <div className="container bg-white shadow-lg rounded-lg p-8 max-w-md">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Make a Donation</h1>
                <form onSubmit={handleDonation} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold">Donation Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Donate'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DonationPage;