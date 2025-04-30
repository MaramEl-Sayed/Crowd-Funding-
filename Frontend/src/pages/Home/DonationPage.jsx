import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Alert from '../../alert/Alert';

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
                amount: parseFloat(amount),
                payment_methods: [
                    5066659,5066761
                ],  
                billing_data: {
                    first_name: '', // Optionally fill with user data
                    last_name: '',
                    email: '',
                    phone_number: '',
                    country: ''
                },
                notification_url: 'http://localhost:8000/api/projects/paymob/callback/',
                redirection_url: `http://localhost:3000/projects/${id}/?payment=success`
                
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
        <div className="min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
            <div className="container bg-white shadow-lg rounded-lg p-8 max-w-md">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Make a Donation</h1>
                {paymentSuccess && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                        Thank you for your donation! Recent donations have been updated.
                    </div>
                )}
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
