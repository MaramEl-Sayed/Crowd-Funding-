import { useMemo, useState } from "react";

const DESCRIPTION_TRUNCATE_LENGTH = 100;

const colors = {
    primary: "#2563eb",
    secondary: "#3b82f6",
    accent: "#bfdbfe",
    background: "#eff6ff",
    textDark: "#374151",
    textLight: "#ffffff"
};

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
        <div
            className="whitespace-pre-wrap break-words rounded-lg p-4"
            style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.accent}`
            }}
        >
            <p className="mb-2" style={{ color: colors.textDark }}>
                {displayedDescription}
            </p>
            {shouldTruncateDescription && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleDescription();
                    }}
                    className="text-sm font-medium cursor-pointer"
                    style={{
                        color: colors.primary
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = colors.secondary}
                    onMouseLeave={e => e.currentTarget.style.color = colors.primary}
                >
                    {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

export default DescriptionSection;
