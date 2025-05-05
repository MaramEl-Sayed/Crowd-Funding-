import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';

const HeroSection = ({
    searchQuery,
    handleSearchInputChange,
    searchResults,
    onClearSearch,
    isLoading
}) => {
    const [visibleProjects, setVisibleProjects] = useState(8);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setVisibleProjects(8);
        setHasMore(searchResults.length > 8);
    }, [searchResults]);

    const loadMoreProjects = () => {
        if (visibleProjects >= searchResults.length) {
            setHasMore(false);
            return;
        }
        setVisibleProjects(prev => prev + 8);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop !==
                document.documentElement.offsetHeight ||
                !hasMore
            ) return;
            loadMoreProjects();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, searchResults.length]);

    return (
        <>
            <motion.section
                className="mb-12 text-center py-12 px-4 rounded-xl relative overflow-hidden bg-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Background subtle animation */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-accent via-secondary to-primary opacity-10"
                    animate={{ x: [0, 50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: 'blur(40px)' }}
                />

                <motion.h1
                    className="relative text-3xl md:text-4xl font-bold mb-4 text-text-dark"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Support Causes That Matter
                </motion.h1>
                <motion.p
                    className="relative text-lg max-w-2xl mx-auto mb-6 text-text-dark"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Discover and donate to campaigns making a difference in communities worldwide.
                </motion.p>

                <motion.div
                    className="max-w-xl mx-auto relative"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        placeholder="Search for Campaigns..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-3.5">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                    )}
                </motion.div>
            </motion.section>

            {/* Search Results */}
            {isLoading ? (
                <div className="flex justify-center my-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : searchResults.length > 0 ? (
                <motion.section
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">
                            {searchResults.length} Search Results
                        </h2>
                        <button
                            onClick={onClearSearch}
                            className="text-sm text-gray-600 hover:text-primary flex items-center"
                        >
                            Clear search
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {searchResults.slice(0, visibleProjects).map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMoreProjects}
                                className="px-6 py-2 rounded-full font-medium border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </motion.section>
            ) : searchQuery && !isLoading ? (
                <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="text-xl font-medium mb-2 text-text-dark">
                        No Campaigns found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        We couldn't find any Campaigns matching "{searchQuery}"
                    </p>
                    <button
                        onClick={onClearSearch}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-text-light"
                    >
                        Clear search
                    </button>
                </motion.div>
            ) : null}
        </>
    );
};

export default HeroSection;
