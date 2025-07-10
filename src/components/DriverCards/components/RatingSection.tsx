import React from 'react';
import { IonCheckbox } from '@ionic/react';
import { Rating } from '../../Rating';
import { RatingSectionProps, TaskCompletion } from '../types';

export const RatingSection: React.FC<RatingSectionProps> = ({
    rating,
    onRatingChange,
    tasks,
    onTaskChange,
    isVisible
}) => {
    if (!isVisible) return null;

    return (
        <div className="mt-1 mb-1">
            {/* Чекбоксы задач */}
            <div className="mb-1">
                <div className="flex mb-05">
                    <IonCheckbox
                        checked={tasks.delivered}
                        onIonChange={(e) => onTaskChange('delivered', e.detail.checked)}
                        className="mr-05"
                    />
                    <div className="fs-08">
                        <div>Груз доставлен в целости и сохранности</div>
                        <div className="fs-07 cl-gray">
                            Отсутствуют видимые повреждения, которые могли возникнуть при транспортировке
                        </div>
                    </div>
                </div>

                <div className="flex mb-1">
                    <IonCheckbox
                        checked={tasks.documents}
                        onIonChange={(e) => onTaskChange('documents', e.detail.checked)}
                        className="mr-05"
                    />
                    <div className="fs-08">
                        <div>Все документы подписаны</div>
                        <div className="fs-07 cl-gray">
                            Товарно-транспортная накладная и акт приема-передачи подписаны заказчиком
                        </div>
                    </div>
                </div>
            </div>

            {/* Оценка качества услуг */}
            <Rating 
                value={rating}
                onChange={onRatingChange}
                label="Оцените качество услуг"
                size="medium"
                showText={true}
            />
        </div>
    );
};