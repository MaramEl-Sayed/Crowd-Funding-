import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart, FaLock, FaShieldAlt } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
    return (
        <footer className="bg-[#006A71] text-[#FFFFFF] mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Athr</h3>
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
                            <li><a href="/search" className="hover:text-[#00C897] transition">Browse Campaigns</a></li>
                            <li><a href="/donate" className="hover:text-[#00C897] transition">Donate</a></li>
                            <li><a href="/fundraise" className="hover:text-[#00C897] transition">Start a Campaign</a></li>
                            <li><a href="/about" className="hover:text-[#00C897] transition">About Us</a></li>
                        </ul>
                    </div>

                    {/* Campaign Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Campaign Categories</h3>
                        <ul className="space-y-2">
                            <li><a href="/category/health" className="hover:text-[#00C897] transition">Health & Medical</a></li>
                            <li><a href="/category/education" className="hover:text-[#00C897] transition">Education</a></li>
                            <li><a href="/category/emergency" className="hover:text-[#00C897] transition">Emergency Relief</a></li>
                            <li><a href="/category/animals" className="hover:text-[#00C897] transition">Animals</a></li>
                            <li><a href="/category/community" className="hover:text-[#00C897] transition">Community</a></li>
                        </ul>
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
