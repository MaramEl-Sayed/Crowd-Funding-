import { FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AuthPopup = ({ onConfirm, onCancel }) => {
    const Colors = {
        primary: "#2563eb",        // main buttons, links, key highlights
        secondary: "#3b82f6",      // hover states, secondary buttons
        accent: "#bfdbfe",         // subtle highlights, badges, or backgrounds
        backgroundStart: "#eff6ff",// main page background
        backgroundEnd: "#eff6ff",  // gradients, footers
        "text-dark": "#374151",    // default body text
        "text-light": "#ffffff"    // text on dark/primary backgrounds
      };
      

    return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border border-[#3b82f6]"
            >
                <div className="flex items-start mb-4">
                    <FaExclamationCircle className="text-2xl text-[#2563eb] mr-3 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-[#1e1e1e]">Account Required</h3>
                        <p className="text-[#1e1e1e] mt-1">
                            You need to register an account before starting a campaign. Would you like to register now?
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border border-[#3b82f6] text-[#1e1e1e] hover:bg-[#F2EFE7] transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg  bg-blue-600 hover:bg-blue-700 text-white transition duration-200 flex items-center"
                    >
                        Register Now <FaArrowRight className="ml-2 relative top-[3px]" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPopup;
