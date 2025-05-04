import { Link } from "react-router-dom";
import DescriptionSection from "./DescriptionSection";
import { FaStar, FaFolder } from 'react-icons/fa';
import { motion } from "framer-motion";

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    },
    hover: {
        y: -5,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

// const progressBarVariants = {
//     initial: { width: 0 },
//     animate: {
//         width: "100%",
//         transition: {
//             duration: 1,
//             ease: "easeOut"
//         }
//     }
// };


const MainProjectCard = ({ project }) => {
    const progressPercentage = Math.min(
        Math.round((project.total_donations / project.total_target) * 100),
        100
    );

    const progress = project.progress_percentage !== undefined
        ? project.progress_percentage
        : project.total_donations && project.total_target
            ? Math.min(100, (project.total_donations / project.total_target) * 100)
            : 0;
    return (
        <motion.div
            className="bg-white border border-[#9ACBD0] rounded-lg overflow-hidden shadow-sm hover:shadow-md"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <Link to={`/projects/${project.id}`} className="block hover:opacity-90">
                <motion.div
                    className="relative h-48 bg-[#9ACBD0] overflow-hidden"
                    whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.3 }
                    }}
                >
                    {project.images && project.images.length > 0 ? (
                        <motion.img
                            src={`http://localhost:8000${project.images[0].url}`}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0.9 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1e1e1e]">
                            <FaFolder className="text-4xl" />
                        </div>
                    )}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-[#006A71] bg-opacity-80 text-white p-2"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{
                            delay: 0.2,
                            duration: 0.5
                        }}
                    >
                        <h3 className="text-lg font-bold truncate">{project.title}</h3>
                    </motion.div>
                </motion.div>

                <div className="p-4">
                    <DescriptionSection details={project.details} />

                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <motion.span
                                className="text-sm font-medium text-[#1e1e1e]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                ${project.total_donations} raised
                            </motion.span>
                            <motion.span
                                className="text-sm font-medium text-[#006A71]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {progressPercentage}%
                            </motion.span>
                        </div>
                        <div className="w-full bg-[#9ACBD0] rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="h-2 rounded-full"
                                style={{ backgroundColor: '#006A71' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                            ></motion.div>
                        </div>
                    </div>

                    <motion.div
                        className="mt-3 flex justify-between items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FaStar className="text-yellow-500 mr-1" />
                            </motion.div>
                            <span className="text-sm text-[#1e1e1e]">
                                {project.average_rating?.toFixed(1) || 'New'}
                            </span>
                        </div>
                        <motion.span
                            className="text-xs px-2 py-1 bg-[#9ACBD0] text-[#1e1e1e] rounded-full"
                            whileHover={{ scale: 1.05 }}
                        >
                            {project.category?.name || 'Uncategorized'}
                        </motion.span>
                    </motion.div>
                </div>
            </Link>
        </motion.div>
    );
};

export default MainProjectCard;