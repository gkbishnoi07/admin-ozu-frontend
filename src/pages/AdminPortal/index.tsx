import RiderMap from "./RiderMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPortal() {
  return (
    <div className="w-full h-screen grid grid-cols-2 gap-4 p-4 bg-gray-50">
      <RiderMap />
      {/* Right panel placeholder — define later */}
      <Card className="col-span-1 h-full rounded-2xl shadow-sm flex flex-col">
        <CardHeader>
          <CardTitle>Right Panel (Configurable)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="mb-2">Plug in live orders, rider details, shipment timeline, or analytics here.</p>
            <p className="text-sm">Tell me what you want and I will wire it up.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

