import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { chatboxEllipsesOutline, cubeOutline } from 'ionicons/icons';
import { DriverInfo } from '../../../../Store/cargoStore';
import { useChats } from '../../../../Store/useChats';
import offerStyles from './OfferCard.module.css';
import { PhotoPreview } from '../../../Chats/PhotoPreview';

/** Статус изображений «фото кузова при приезде на погрузку» (см. Works sendImage …, 14) */
const BODY_PHOTO_STATUS = 14;

interface OnLoadingCardProps {
    info: DriverInfo;
    onChat?: (info: DriverInfo) => void;
    onStartLoading?: (info: DriverInfo) => void;
    isLoading?: boolean;
}

export const OnLoadingCard: React.FC<OnLoadingCardProps> = ({
    info,
    onChat,
    onStartLoading,
    isLoading,
}) => {
    const [fotos, setFotos] = useState<any[]>([]);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState('');
    const { getPhotos } = useChats();

    const formatPrice = (price: number): string => {
        return price.toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    useEffect(() => {
        let isMounted = true;
        setPhotosLoading(true);

        getPhotos(info.recipient, info.cargo, BODY_PHOTO_STATUS)
            .then((data: any[]) => {
                if (!isMounted) return;
                setFotos(data || []);
            })
            .catch((err: unknown) => {
                console.error(err);
                if (isMounted) setFotos([]);
            })
            .finally(() => {
                if (isMounted) setPhotosLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [info.recipient, info.cargo, getPhotos]);

    const canStartLoading = !photosLoading && fotos.length > 0;

    return (
        <div className={offerStyles.offerCard}>
            <div className={offerStyles.notificationCard}>
                <div className={offerStyles.notificationHeader}>
                    <div className={offerStyles.notificationTitleRow}>
                        <IonIcon icon={cubeOutline} className={offerStyles.notificationIcon} />
                        <h2 className={offerStyles.notificationTitle}>На погрузке</h2>
                    </div>
                    <p className={offerStyles.notificationSubtitle}>
                        Водитель прибыл на место погрузки
                    </p>
                </div>
            </div>

            <div className={offerStyles.detailsCard}>
                <div className={offerStyles.infoRow}>
                    <div className={offerStyles.infoField}>
                        <label className={offerStyles.label}>Цена (₽)</label>
                        <div className={offerStyles.value}>
                            {formatPrice(info.price)} (₽)
                        </div>
                    </div>
                    <div className={offerStyles.infoField}>
                        <label className={offerStyles.label}>Объем (м³)</label>
                        <div className={offerStyles.value}>
                            {info.volume.toFixed(1)} м³
                        </div>
                    </div>
                    <div className={offerStyles.infoField}>
                        <label className={offerStyles.label}>Вес (т)</label>
                        <div className={offerStyles.value}>
                            {info.weight.toFixed(1)} тонн
                        </div>
                    </div>
                </div>
            </div>

            <div className={offerStyles.detailsCard}>
                <label className={offerStyles.label}>Фото кузова от водителя</label>
                {photosLoading && (
                    <div className="flex items-center gap-05 mt-05">
                        <IonSpinner name="crescent" style={{ color: 'white' }} />
                        <span className={offerStyles.notificationSubtitle}>Загрузка фото…</span>
                    </div>
                )}
                {!photosLoading && fotos.length === 0 && (
                    <p className={offerStyles.notificationSubtitle} style={{ marginTop: '0.5em' }}>
                        Фото кузова ещё не получены. Дождитесь, пока водитель отправит снимки.
                    </p>
                )}
                {!photosLoading && fotos.length > 0 && (
                    <div className="flex flex-wrap mt-02">
                        {fotos.map((item: any, index: number) => {
                            const src =
                                typeof item === 'string'
                                    ? item
                                    : item?.url || item?.image || item?.path || item?.filePath;

                            if (!src) return null;

                            return (
                                <div key={index} className="ml-05 mr-05">
                                    <img
                                        src={src}
                                        alt={`Фото кузова ${index + 1}`}
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                                        onClick={() => setPreviewUrl(src)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={offerStyles.actions}>
                <div className={offerStyles.buttonsRow}>
                    {onStartLoading && (
                        <IonButton
                            className={offerStyles.acceptButton}
                            expand="block"
                            onClick={() => onStartLoading(info)}
                            disabled={isLoading || !canStartLoading}
                        >
                            <span>Начать погрузку</span>
                        </IonButton>
                    )}
                    {onChat && (
                        <IonButton
                            fill="outline"
                            className={offerStyles.rejectButton}
                            expand="block"
                            onClick={() => onChat(info)}
                            disabled={isLoading}
                        >
                            <IonIcon icon={chatboxEllipsesOutline} slot="start" />
                            <span>Чат</span>
                        </IonButton>
                    )}
                </div>
            </div>

            <PhotoPreview imageUrl={previewUrl} closeModal={() => setPreviewUrl('')} />
        </div>
    );
}

