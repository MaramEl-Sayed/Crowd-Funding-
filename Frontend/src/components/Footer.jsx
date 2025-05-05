import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaLock, FaShieldAlt } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/projects/categories/');
                setCategories(response.data);
            } catch (err) {
                setError('Failed to load categories');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <footer className="bg-[#006A71] text-[#FFFFFF] mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold"><span className="text-[#00C897]">Athr</span></h3>
                        <p className="text-sm">
                            Empowering communities through collective giving. Join us in making a difference one donation at a time.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-[#00C897] transition"><FaFacebook size={20} /></a>
                            <a href="#" className="hover:text-[#00C897] transition"><FaTwitter size={20} /></a>
                            <a href="#" className="hover:text-[#00C897] transition"><FaInstagram size={20} /></a>
                            <a href="#" className="hover:text-[#00C897] transition"><FaLinkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="/home" className="hover:text-[#00C897] transition">Home</a></li>
                            <li><a href="/campaigns" className="hover:text-[#00C897] transition">Browse Campaigns</a></li>
                            <li><a href="/campaigns" className="hover:text-[#00C897] transition">Donate</a></li>
                            <li><a href="/create-campaign" className="hover:text-[#00C897] transition">Start a Campaign</a></li>
                            <li><a href="/about" className="hover:text-[#00C897] transition">About Us</a></li>
                        </ul>
                    </div>

                    {/* Campaign Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Campaign Categories</h3>
                        {loading && <p>Loading categories...</p>}
                        {error && <p>{error}</p>}
                        {!loading && !error && (
                            <ul className="space-y-2">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <a href={`/categories/${category.id}`} className="hover:text-[#00C897] transition">
                                            {category.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Contact & Security */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Us</h3>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <MdEmail className="text-[#00C897]" />
                                <span>crowddunding449@gmail.com</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MdPhone className="text-[#00C897]" />
                                <span>+1 (800) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MdLocationOn className="text-[#00C897]" />
                                <span>123 Giving St, Charity City</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex items-center space-x-2 text-sm">
                                <FaLock />
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <FaShieldAlt />
                                <span>Trust & Safety</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t" style={{ borderColor: 'rgba(0, 200, 151, 0.2)' }}></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-8">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <FaHeart className="text-[#00C897]" />
                        <span className="text-sm">Made with love for a better world</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <a href="/privacy" className="hover:text-[#00C897] transition">Privacy Policy</a>
                        <a href="/terms" className="hover:text-[#00C897] transition">Terms of Service</a>
                        <a href="/cookies" className="hover:text-[#00C897] transition">Cookie Policy</a>
                        <a href="/faq" className="hover:text-[#00C897] transition">FAQs</a>
                    </div>

                    <div className="text-sm mt-4 md:mt-0">
                        © {new Date().getFullYear()} Athr. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
