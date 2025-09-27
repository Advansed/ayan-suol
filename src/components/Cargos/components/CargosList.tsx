import React            from 'react';
import { IonRefresher, IonRefresherContent, IonSpinner
}                       from '@ionic/react';
import { CargoCard }    from './CargoCard';
import { Package }      from "lucide-react";
import { CargoInfo }    from '../../../Store/cargoStore';

interface CargosListProps {
    cargos:         CargoInfo[];
    isLoading?:     boolean;
    onCreateNew:    ( ) => void;
    onCargoClick:   ( cargo: CargoInfo) => void;
    onRefresh?:     ( ) => Promise<void>;
}

export const CargosList: React.FC<CargosListProps> = ({
    cargos,
    isLoading = false,
    onCreateNew,
    onCargoClick,
    onRefresh
}) => {

    const handleRefresh = async (event: any) => {
        if (onRefresh) {
            await onRefresh();
        }
        event.detail.complete();
    };

    const renderEmptyState = () => (
        <div className="cr-card mt-1 text-center">
            <div className="fs-09 cl-gray mb-1">
                { 'Грузы не найдены' }
            </div>
            {
                <div className="fs-08 cl-gray">
                    Создайте первый груз для перевозки
                </div>
            }
        </div>
    );

    const renderLoadingState = () => (
        <div className="cr-card mt-1 text-center">
            <IonSpinner />
            <div className="fs-08 cl-gray mt-05">Загрузка грузов...</div>
        </div>
    );

    return (
        <>
            {/* Refresher */}
            {onRefresh && (
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
            )}

            {/* Header */}
            <div className="ml-05 mt-1 a-center fs-09">
                <b>Мои заказы</b>
                {cargos.length > 0 && (
                    <span className="ml-1 fs-08 cl-gray">({cargos.length})</span>
                )}
            </div>

            {/* Кнопка создания нового груза */}
            <div className="mb-4 ml-1 mr-1 mt-1">
                <div 
                    className   = "gradient-button"
                    onClick     = { onCreateNew }
                >
                    <Package className="w-6 h-6" />
                <span className="ml-3 font-semibold">Создать новый груз</span>
                </div>
            </div>

            {/* Список грузов */}
        
            { isLoading ? (
                renderLoadingState()
            ) : cargos.length === 0 ? (
                renderEmptyState()
            ) : (
                cargos.map((cargo, index) => (
                    <CargoCard
                        key     = { index }
                        cargo   = { cargo }
                        mode    = "list"
                        onClick = { () => {
                            onCargoClick(cargo) 
                        }}
                    />
                ))
            )}
        </>
    );
};