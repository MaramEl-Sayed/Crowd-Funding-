import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Alert from '../../alert/Alert';
import { FaDonate, FaSpinner, FaArrowLeft,FaPoundSign } from 'react-icons/fa';
import { motion } from 'framer-motion';

const DonationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [recentDonations, setRecentDonations] = useState([]);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        // Check if redirected after payment success
        const params = new URLSearchParams(location.search);
        if (params.get('payment') === 'success') {
            setPaymentSuccess(true);
            fetchRecentDonations();
        }
    }, [location.search]);

    const fetchRecentDonations = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/projects/donations/`);
            if (response.data.donations) {
                setRecentDonations(response.data.donations);
            }
        } catch (error) {
            console.error('Failed to fetch recent donations', error);
        }
    };

    const handleDonation = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call backend API to create Paymob payment intention
            const response = await axios.post('http://localhost:8000/api/projects/paymob/create_intention/', {
                project: id,
                amount: parseFloat(amount), // Convert to cents
                payment_methods: [5066659, 5066761],
                billing_data: {
                    first_name: '', // Optionally fill with user data
                    last_name: '',
                    email: '',
                    phone_number: '',
                    country: ''
                },
                notification_url: 'http://127.0.0.1:8000/api/projects/paymob/callback/',// Backend callback
                redirection_url: `http://localhost:3000/projects/${id}/?payment=success` // Frontend redirect
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            const { client_secret, public_key } = response.data;
            if (client_secret && public_key) {
                // Redirect to Paymob unifiedcheckout URL
                window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${public_key}&clientSecret=${client_secret}`;
            } else {
                Alert.error('Error!', 'Failed to get payment keys.');
            }
        } catch (err) {
            Alert.error('Error!', err.response?.data?.detail || 'There was an error processing your donation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-[#2563eb] p-6 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="absolute left-4 top-4"
                        >
                            <button
                                onClick={() => navigate(-1)}
                                className="text-white p-2 rounded-full hover:bg-[#3b82f6] transition duration-200"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                        </motion.div>
                        <FaDonate className="text-4xl text-white mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-white">Support This Campaign</h1>
                    </div>

                    <div className="p-6 sm:p-8">
                        {paymentSuccess && (
                            <div className="mb-4 p-4 bg-[#bfdbfe] text-[#374151] rounded-lg">
                                Thank you for your donation! Your support makes a difference.
                            </div>
                        )}

                        <form onSubmit={handleDonation} className="space-y-6">
                            <div className="relative">
<label className="block text-[#374151] font-medium mb-2">Donation Amount <FaPoundSign className="inline mb-1" /></label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#374151]"
                                    placeholder="Enter amount"
                                    min="1"
                                    step="0.01"
                                    required
                                />
                                <span className="absolute right-4 top-10 text-[#374151]">EGY</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
{[10, 25, 50, 100, 250, 500].map((value) => (
    <motion.button
        key={value}
        type="button"
        onClick={() => setAmount(value.toString())}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`py-2 rounded-lg border ${amount === value.toString()
            ? 'bg-[#2563eb] text-white border-[#2563eb]'
            : 'bg-white text-[#2563eb] border-[#bfdbfe] hover:bg-[#eff6ff]'}`}
    >
        <FaPoundSign className="inline mb-1 mr-1" />
        {value}
    </motion.button>
))}
                            </div>

                            <motion.button
                                type="submit"
                                className="w-full bg-[#2563eb] hover:bg-[#3b82f6] text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.02 } : {}}
                                whileTap={!loading ? { scale: 0.98 } : {}}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaDonate className="mr-2" />
                                        Donate Now
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-6 text-center text-sm text-[#374151]">
                            <p>Your donation will help bring this campaign to life.</p>
                            <p className="mt-1">Thank you for your support!</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DonationPage;
