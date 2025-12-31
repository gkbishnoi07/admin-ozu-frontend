export interface Shipment {
  id: string;
  trackingNumber: string;
  riderId?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  packageDetails?: string;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ShipmentStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';


