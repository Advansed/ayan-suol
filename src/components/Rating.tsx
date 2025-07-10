import { useState } from 'react';

interface RatingProps {
    value: number;
    onChange: (rating: number) => void;
    maxRating?: number;
    size?: 'small' | 'medium' | 'large';
    readonly?: boolean;
    showText?: boolean;
    label?: string;
}

export const Rating = ({ 
    value, 
    onChange, 
    maxRating = 5, 
    size = 'medium',
    readonly = false,
    showText = true,
    label = "Оцените качество услуг"
}: RatingProps) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleStarClick = (rating: number) => {
        if (!readonly) {
            onChange(rating);
        }
    };

    const handleMouseEnter = (rating: number) => {
        if (!readonly) {
            setHoverRating(rating);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    // Размеры в зависимости от пропа size
    const getSizeClass = () => {
        switch (size) {
            case 'small': return 'fs-08';
            case 'large': return 'fs-15';
            default: return 'fs-12';
        }
    };

    const currentRating = hoverRating || value;

    return (
        <div className="rating-component">
            {label && (
                <div className="fs-08 mb-05 a-center">
                    <b>{label}</b>
                </div>
            )}
            
            <div className="flex fl-center">
                {Array.from({ length: maxRating }, (_, index) => {
                    const starValue = index + 1;
                    const isActive = starValue <= currentRating;
                    
                    return (
                        <span 
                            key={starValue}
                            className={`${getSizeClass()} mr-05`}
                            style={{
                                cursor: readonly ? 'default' : 'pointer',
                                filter: readonly ? 'none' : (isActive ? 'none' : 'grayscale(100%)'),
                                opacity: isActive ? 1 : 0.3,
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => handleStarClick(starValue)}
                            onMouseEnter={() => handleMouseEnter(starValue)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isActive ? '⭐' : '☆'}
                        </span>
                    );
                })}
            </div>

            {showText && value > 0 && (
                <div className="fs-07 cl-gray mt-05 a-center">
                    {readonly 
                        ? `Оценка: ${value} из ${maxRating} звезд`
                        : `Выбрана оценка: ${value} из ${maxRating} звезд`
                    }
                </div>
            )}
        </div>
    );
};

// Компонент для отображения только рейтинга (без возможности изменения)
export const RatingDisplay = ({ value, maxRating = 5, size = 'small' }: {
    value: number;
    maxRating?: number;
    size?: 'small' | 'medium' | 'large';
}) => {
    return (
        <Rating 
            value={value}
            onChange={() => {}} // Пустая функция
            maxRating={maxRating}
            size={size}
            readonly={true}
            showText={false}
            label=""
        />
    );
};