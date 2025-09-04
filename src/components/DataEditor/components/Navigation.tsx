import React from 'react';

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onSave?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  totalPages, 
  onPrev, 
  onNext, 
  canGoPrev, 
  canGoNext,
  onSave 
}) => {
  return (
    <div className="navigation">
      <button onClick={onPrev} disabled={!canGoPrev}>
        Назад
      </button>
      
      <span className="page-indicator">
        {currentPage + 1} из {totalPages}
      </span>
      
      {canGoNext ? (
        <button onClick={onNext}>
          Далее
        </button>
      ) : (
        onSave && (
          <button onClick={onSave} className="save-btn">
            Сохранить
          </button>
        )
      )}
    </div>
  );
};