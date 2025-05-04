import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const SectionHeader = ({ title, link }) => {
    const colors = {
        primary: "#006A71",
        secondary: "#48A6A7",
        accent: "#9ACBD0",
        background: "#F2EFE7",
        textDark: "#1e1e1e",
        textLight: "#ffffff"
    };

    return (
        <motion.div
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <h2
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: colors.textDark }}
            >
                {title}
            </h2>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Link
                    to={link}
                    className="flex items-center gap-1 font-medium hover:underline"
                    style={{ color: colors.primary }}
                >
                    View All
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </motion.div>
        </motion.div>
    );
};

export default SectionHeader;