import { useMemo, useState } from "react";

const DESCRIPTION_TRUNCATE_LENGTH = 100;

const DescriptionSection = ({ details }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const shouldTruncateDescription = details.length > DESCRIPTION_TRUNCATE_LENGTH;

    const displayedDescription = useMemo(() => {
        return isDescriptionExpanded
            ? details
            : shouldTruncateDescription
                ? `${details.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`
                : details;
    }, [details, isDescriptionExpanded]);

    const toggleDescription = () => {
        setIsDescriptionExpanded(prev => !prev);
    };

    return (
        <div className="whitespace-pre-wrap break-words border border-[#9ACBD0] rounded-lg p-4 bg-[#F2EFE7]">
            <p className="text-[#1e1e1e] mb-2">{displayedDescription}</p>
            {shouldTruncateDescription && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleDescription();
                    }}
                    className="text-[#006A71] hover:text-[#48A6A7] text-sm font-medium cursor-pointer"
                >
                    {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};
export default DescriptionSection;