import { statusToColor } from "./statusColors";

export default function MapLegend() {
  const items = [
    { label: "Free", color: statusToColor("available") },
    { label: "Assigned", color: statusToColor("assigned") },
    { label: "On the way", color: statusToColor("in_transit") },
  ];
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-2xl shadow p-3 flex gap-3 items-center z-[500]">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: i.color }} />
          <span className="text-xs text-gray-700">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

