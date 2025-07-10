import React from 'react';
import { DriverCardProps } from './types';
import { useDriverActions } from './hooks/useDriverActions';
import { useDriverState } from './hooks/useDriverState';
import { DriverInfo } from './components/DriverInfo';
import { ActionButtons } from './components/ActionButtons';
import { RatingSection } from './components/RatingSection';

export const DriverCard: React.FC<DriverCardProps> = ({
    info,
    mode,
    setPage,
    onAccept,
    onReject,
    onComplete,
    onChat
}) => {
    const {
        isLoading,
        handleAccept,
        handleReject,
        handleComplete,
        handleChat
    } = useDriverActions({ info, mode, setPage });

    const {
        tasks,
        rating,
        canComplete,
        shouldShowRatingSection,
        formattedCurrency,
        setRating,
        handleTaskChange
    } = useDriverState({ info, mode });

    const onAcceptClick = async () => {
        if (onAccept) {
            await onAccept(info);
        } else {
            await handleAccept();
        }
    };

    const onRejectClick = async () => {
        if (onReject) {
            await onReject(info);
        } else {
            await handleReject();
        }
    };

    const onCompleteClick = async () => {
        if (onComplete) {
            await onComplete(info, rating, tasks);
        } else {
            await handleComplete(rating, tasks);
        }
    };

    const onChatClick = () => {
        if (onChat) {
            onChat(info);
        } else {
            handleChat();
        }
    };

    return (
        <div className="cr-card mt-1">
            <DriverInfo 
                info={info}
                mode={mode}
                formattedCurrency={formattedCurrency}
            />

            <RatingSection
                rating={rating}
                onRatingChange={setRating}
                tasks={tasks}
                onTaskChange={handleTaskChange}
                isVisible={shouldShowRatingSection}
            />

            <ActionButtons
                mode={mode}
                isLoading={isLoading}
                canComplete={canComplete}
                onAccept={onAcceptClick}
                onReject={onRejectClick}
                onComplete={onCompleteClick}
                onChat={onChatClick}
            />
        </div>
    );
};

// Компонент секции для группировки водителей
export const InvoiceSection: React.FC<{
    title: string;
    invoices: any[];
    mode: 'offered' | 'assigned' | 'delivered' | 'completed';
    setPage?: (page: any) => void;
}> = ({ title, invoices, mode, setPage }) => {
    if (invoices.length === 0) return null;

    return (
        <>
            <div className="ml-1 mt-1">
                <b><strong>{title} ({invoices.length})</strong></b>
            </div>
            {invoices.map((invoice, index) => (
                <DriverCard 
                    key={invoice.guid || index}
                    info={invoice} 
                    mode={mode} 
                    setPage={setPage} 
                />
            ))}
        </>
    );
};