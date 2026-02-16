import React            from 'react';
import { IonButton, IonFab, IonFabButton, IonRefresher, IonRefresherContent, IonSpinner
}                       from '@ionic/react';
import { CargoCard }    from './CargoCard';
import { Package }      from "lucide-react";
import { CargoInfo }    from '../../../Store/cargoStore';
import { WizardHeader } from '../../Header/WizardHeader';

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
            {/* Header */}
            <WizardHeader 
                title       = { 'Ваши грузы (' + cargos.length.toString() + ')' }
                onRefresh   = { onRefresh }
            />

            {/* Кнопка создания нового груза */}

            <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonButton
                    color = "primary"
                    onClick     = { onCreateNew }
                >
                    <Package className="w-6 h-6 mr-1" />
                    <span> Новый груз </span>
                    
                </IonButton>
            </IonFab>

            {/* Список грузов */}
            <div className="ml-05 mr-05">
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
            </div>
        </>
    );
};