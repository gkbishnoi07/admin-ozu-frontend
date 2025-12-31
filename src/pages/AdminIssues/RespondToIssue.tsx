import { useState } from 'react';
import { ShipmentIssue } from '@/types/issue';
import { IssuesAPI } from '@/lib/api';
import {
  Repeat,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

interface RespondToIssueProps {
  issue: ShipmentIssue;
  onSuccess: () => void;
}

export default function RespondToIssue({ issue, onSuccess }: RespondToIssueProps) {
  const [action, setAction] =
    useState<'redeliver' | 'return_to_shop'>('redeliver');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Please enter instructions for the rider');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await IssuesAPI.respond(issue.id, {
        action,
        message: message.trim(),
      });

      alert('Response sent to rider successfully!');
      setMessage('');
      onSuccess();
    } catch (err) {
      console.error('Failed to send response:', err);
      setError(err instanceof Error ? err.message : 'Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        bg-white
        rounded-[20px]
        border border-[#E6E6E6]
        p-5
        space-y-4
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#1F1F24]">
          Respond to issue
        </h3>

        <p className="text-[13px] font-medium text-[#6B6B6F]">
          Shipment #{issue.shipmentId}
        </p>
      </div>

      {/* ACTION SELECT */}
      <div className="relative">
        <select
          value={action}
          onChange={(e) =>
            setAction(e.target.value as 'redeliver' | 'return_to_shop')
          }
          className="
            w-full
            h-[52px]
            appearance-none
            rounded-[14px]
            border-2 border-[#8C8C91]
            px-4 pr-10
            text-[15px]
            font-medium
            focus:outline-none
          "
        >
          <option value="redeliver">Re-deliver to customer</option>
          <option value="return_to_shop">Return to shop</option>
        </select>

        {/* LEFT ICON */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F24]">
          {action === 'redeliver' ? (
            <Repeat size={18} />
          ) : (
            <RotateCcw size={18} />
          )}
        </div>

        {/* RIGHT ICON */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1F1F24]">
          <ChevronDown size={18} />
        </div>
      </div>

      {/* MESSAGE */}
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Instructions for the Rider"
          rows={4}
          className="
            w-full
            rounded-[14px]
            border border-[#C9CBD1]
            px-4 py-3
            text-[14px]
            resize-none
            focus:outline-none
          "
          required
        />

        <p className="mt-1 text-[12px] text-[#8C8C91]">
          Example: Visit customer after 2pm
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="
            rounded-lg
            bg-red-50
            border border-red-200
            px-3 py-2
            text-[12px]
            text-red-600
          "
        >
          {error}
        </div>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          h-[52px]
          rounded-[16px]
          bg-[#FFCA28]
          text-[16px]
          font-semibold
          text-black
          disabled:opacity-60
        "
      >
        {loading ? 'Sending…' : 'Send Instructions'}
      </button>

      {/* CANCEL */}
      <button
        type="button"
        onClick={onSuccess}
        className="
          w-full
          text-center
          text-[14px]
          font-medium
          text-[#8C8C91]
          pt-1
        "
      >
        Cancel
      </button>
    </form>
  );
}
