import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L, { DivIcon } from "leaflet";
import type { Rider } from "../../types/rider";
import { statusToColor } from "./statusColors";
import { MapPin } from "lucide-react";

function makeDotIcon(color: string): DivIcon {
  const html = `
    <div style="position: relative; width: 18px; height: 18px;">
      <span style="position:absolute; inset:0; border-radius:9999px; background:${color}; display:block; box-shadow:0 0 0 3px rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.25);"></span>
      <span style="position:absolute; inset:-6px; border-radius:9999px; border:2px solid ${color}33;"></span>
    </div>`;
  return L.divIcon({ html, className: "status-dot", iconSize: [18, 18], iconAnchor: [9, 9] });
}

export default function RiderMarker({ rider }: { rider: Rider }) {
  const icon = useMemo(() => makeDotIcon(statusToColor(rider.status)), [rider.status]);
  return (
    <Marker position={[rider.lat, rider.lng]} icon={icon}>
      <Popup>
        <div className="space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {rider.name}
          </div>
          <div className="text-xs text-gray-600">Status: {rider.status.replace("_", " ")}</div>
          {rider.zone && <div className="text-xs text-gray-600">Zone: {rider.zone}</div>}
          {rider.phone && <div className="text-xs text-gray-600">☎ {rider.phone}</div>}
          {rider.activeShipmentId && (
            <div className="text-xs text-gray-600">Shipment: #{String(rider.activeShipmentId)}</div>
          )}
          {rider.updatedAt && (
            <div className="text-[10px] text-gray-500">Last ping: {new Date(rider.updatedAt).toLocaleTimeString()}</div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

