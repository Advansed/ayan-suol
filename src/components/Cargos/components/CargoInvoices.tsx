/**
 * Компонент секций инвойсов для груза
 */

import React from 'react';
import { DriverCard } from '../../DriverCards';
import { CargoInfo, CargoInvoice } from '../../../Store/cargoStore';

interface CargoInvoiceSectionsProps {
    cargo: CargoInfo;
    onBack: ()=>void;
}

export const CargoInvoiceSections: React.FC<CargoInvoiceSectionsProps> = ({ cargo }) => {
    
    // Адаптер данных инвойса к формату водителя
    const mapInvoiceToDriver = (invoice: any): any => ({
        guid: invoice.id,
        cargo: invoice.cargo,
        recipient: invoice.driverId,
        client: invoice.driverName,
        weight: invoice.weight,
        status: invoice.status,
        transport: invoice.transport,
        capacity: `${invoice.weight} т`,
        rating: invoice.rating || 4.5,
        ratingCount: 12,
        rate: invoice.rating || 4.5,
        price: invoice.price,
        accepted: invoice.status === 'Принято'
    });

    // Рендер секции инвойсов
    const renderInvoiceSection = (title: string, invoices: CargoInvoice[], type: 'offered' | 'assigned' | 'delivered' | 'completed') => {
        if (!invoices || invoices.length === 0) {
            return null;
        }

        return (
            <>
                <div className="ml-1 mt-1">
                    <div className="fs-09 mb-1">
                        <b>{title}</b>
                        <span className="ml-1 fs-08 cl-gray">({invoices.length})</span>
                    </div>
                </div>
                
                {invoices.map((invoice, index) => (
                    <DriverCard
                        key={index}
                        info={mapInvoiceToDriver(invoice)}
                        mode={type}
                    />
                ))}
            </>
        );
    };

    // Группировка инвойсов по статусам
    const groupedInvoices = {
        offered: cargo.invoices?.filter(inv => inv.status === "Заказано") || [],
        accepted: cargo.invoices?.filter(inv => inv.status === "Принято") || [],
        delivered: cargo.invoices?.filter(inv => inv.status === "Доставлено") || [],
        completed: cargo.invoices?.filter(inv => inv.status === "Завершен") || []
    };

    return (
        <>
            {/* Предложения от водителей */}
            {renderInvoiceSection(
                "Предложения от водителей",
                groupedInvoices.offered,
                "offered"
            )}

            {/* Назначенные водители */}
            {renderInvoiceSection(
                "Назначенные водители",
                groupedInvoices.accepted,
                "assigned"
            )}

            {/* Доставленные */}
            {renderInvoiceSection(
                "Доставленные",
                groupedInvoices.delivered,
                "delivered"
            )}

            {/* Завершенные */}
            {renderInvoiceSection(
                "Завершенные",
                groupedInvoices.completed,
                "completed"
            )}
        </>
    );
};