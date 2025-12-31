import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRiders } from "../../hooks/useRiders";
import RiderMarker from "../../components/map/RiderMarker";
import MapLegend from "../../components/map/MapLegend";
import MapToolbar from "../../components/map/MapToolbar";

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (!coords.length) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds.pad(0.2), { animate: true });
  }, [coords, map]);
  return null;
}

export default function RiderMap() {
  const { riders, loading, lastUpdated, refresh } = useRiders(5000);
  const center = useMemo(() => ({ lat: 28.6139, lng: 77.2090 }), []); // Delhi center
  const coords = riders.map((r) => [r.lat, r.lng] as [number, number]);

  return (
    <Card className="col-span-1 h-full overflow-hidden rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Radio className="h-5 w-5" /> Live Fleet Map
        </CardTitle>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">Updated {new Date(lastUpdated).toLocaleTimeString()}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4rem)] p-0">
        <MapToolbar loading={loading} onRefresh={refresh} />
        <div className="h-full w-full">
          <MapContainer center={[center.lat, center.lng]} zoom={11} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds coords={coords} />
            {riders.map((r) => (
              <RiderMarker key={r.id} rider={r} />
            ))}
          </MapContainer>
          <MapLegend />
        </div>
      </CardContent>
    </Card>
  );
}

