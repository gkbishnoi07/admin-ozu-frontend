import type { RiderStatus } from "../../types/rider";

export function statusToColor(status: RiderStatus): string {
  switch (status) {
    case "available":
      return "#16a34a"; // green-600
    case "assigned":
      return "#ca8a04"; // yellow-600
    case "in_transit":
      return "#dc2626"; // red-600
    default:
      return "#6b7280"; // gray-500 for offline/unknown
  }
}

