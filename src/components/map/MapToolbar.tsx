import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

export default function MapToolbar({ loading, onRefresh }: { loading: boolean; onRefresh: () => void }) {
  return (
    <div className="absolute top-4 left-4 z-[500] flex gap-2">
      <Button variant="secondary" className="rounded-2xl shadow" onClick={onRefresh}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh
      </Button>
    </div>
  );
}

