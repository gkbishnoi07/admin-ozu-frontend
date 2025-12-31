import { useState, useEffect, useRef } from 'react';
import { MapPin, Play, Square, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationSharingProps {
  riderId: string;
}

export function LocationSharing({ riderId }: LocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<number | null>(null);
  const lastKnownCoordsRef = useRef<GeolocationCoordinates | null>(null);

  // Send location to backend
  const updateLocationToBackend = async (coords: GeolocationCoordinates) => {
    try {
      const token = localStorage.getItem('rider_token');
      
      if (!token) {
        console.error('No rider token found');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/riders/${riderId}/location`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            lat: coords.latitude,
            lng: coords.longitude,
            accuracy: coords.accuracy,
            heading: coords.heading || null,
            speed: coords.speed || null,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to update location:', response.status);
        throw new Error('Failed to update location');
      } else {
        console.log('✅ Location sent:', coords.latitude, coords.longitude);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to send location to server');
    }
  };

  // Handle successful position update
  const handleSuccess = (position: GeolocationPosition) => {
    const { coords } = position;
    
    setLocation({
      lat: coords.latitude,
      lng: coords.longitude,
    });
    setAccuracy(coords.accuracy);
    setError(null);

    // Cache the latest coordinates
    lastKnownCoordsRef.current = coords;

    // Update backend immediately on position change
    updateLocationToBackend(coords);
  };

  // Handle geolocation errors
  const handleError = (err: GeolocationPositionError) => {
    console.error('Geolocation error:', err);
    
    let message = '';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable location access in your browser settings.';
        setIsSharing(false);
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out.';
        break;
      default:
        message = 'An unknown error occurred.';
    }
    
    setError(message);
    setIsSharing(false);
    stopSharing();
  };

  // Start sharing location
  const startSharing = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    console.log('🚀 Starting location sharing...');
    setIsSharing(true);
    setError(null);

    // High accuracy options for GPS
    const options: PositionOptions = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 10000,           // Wait 10 seconds max
      maximumAge: 0,            // Don't use cached position
    };

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    watchIdRef.current = watchId;

    // Also send updates every 10 seconds (even if position doesn't change much)
    updateIntervalRef.current = window.setInterval(() => {
      if (lastKnownCoordsRef.current) {
        updateLocationToBackend(lastKnownCoordsRef.current);
      }
    }, 10000); // 10 seconds
  };

  // Stop sharing location
  const stopSharing = () => {
    console.log('🛑 Stopping location sharing...');
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateIntervalRef.current) {
      window.clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    setIsSharing(false);
    lastKnownCoordsRef.current = null;
    setLocation(null);
    setAccuracy(null);
    setLastUpdate(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className={`h-5 w-5 ${isSharing ? 'text-green-500' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-800">Share My Location</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isSharing ? (
            <>
              <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Sharing</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Not Sharing</span>
            </>
          )}
        </div>
      </div>

      {/* Start/Stop Button */}
      <div className="mb-4">
        {!isSharing ? (
          <Button
            variant="primary"
            fullWidth
            onClick={startSharing}
            className="flex items-center justify-center gap-2"
          >
            <Play className="h-5 w-5" />
            Start Sharing Location
          </Button>
        ) : (
          <Button
            variant="danger"
            fullWidth
            onClick={stopSharing}
            className="flex items-center justify-center gap-2"
          >
            <Square className="h-5 w-5" />
            Stop Sharing Location
          </Button>
        )}
      </div>

      {/* Location Data */}
      {location && isSharing && (
        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Latitude:</span>
              <p className="font-mono font-semibold">{location.lat.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-gray-600">Longitude:</span>
              <p className="font-mono font-semibold">{location.lng.toFixed(6)}</p>
            </div>
            {accuracy && (
              <div className="col-span-2">
                <span className="text-gray-600">Accuracy:</span>
                <p className="font-semibold">±{accuracy.toFixed(1)} meters</p>
              </div>
            )}
          </div>
          {lastUpdate && (
            <div className="mt-2 text-xs text-gray-500">
              Last sent: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Info Message */}
      {isSharing && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            ✅ Your location is being shared with admin. Updates every 10 seconds.
          </p>
        </div>
      )}

      {!isSharing && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            Click "Start Sharing Location" to allow admin to see your real-time location on the map.
          </p>
        </div>
      )}
    </div>
  );
}

