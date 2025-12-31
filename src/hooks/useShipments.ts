import { useState, useEffect } from 'react';
import { Shipment } from '@/types/shipment';
import { getBaseUrl } from '@/lib/api';

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getBaseUrl()}/shipments`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setShipments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  return { shipments, loading, error };
};


