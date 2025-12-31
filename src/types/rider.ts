export type RiderStatus = "available" | "assigned" | "in_transit" | "offline";

export type Rider = {
  id: string | number;
  name: string;
  phone?: string;
  zone?: string;
  status: RiderStatus; // available | assigned | in_transit | offline
  lat: number;
  lng: number;
  headingDeg?: number; // optional bearing from GPS
  activeShipmentId?: string | number | null;
  updatedAt?: string; // ISO timestamp
};

