import { useState } from 'react';
import { ShipmentIssue } from '@/types/issue';
import { Card, CardContent } from '@/components/ui/card';
import RespondToIssue from './RespondToIssue';

interface IssueCardProps {
  issue: ShipmentIssue;
  onUpdate: () => void;
}

export default function IssueCard({ issue, onUpdate }: IssueCardProps) {
  const [showRespondForm, setShowRespondForm] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="rounded-[20px] border border-[#E6E6E6] bg-white">
      <CardContent className="p-4 space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[15px] font-semibold flex items-center gap-2 text-[#1F1F24]">
              <span className="w-3 h-3 bg-[#E53935] rounded-full" />
              {issue.issueType}
            </p>
            <p className="text-[13px] text-[#6B6B6F] mt-[2px]">
              Shipment #{issue.shipmentId}
            </p>
          </div>

          <p className="text-[13px] text-[#6B6B6F]">
            {formatDate(issue.reportedAt)}
          </p>
        </div>

        {/* INFO BLOCKS */}
        <div className="space-y-2">
          <InfoRow
            label="Rider"
            value={`${issue.riderName} ${issue.riderMobile}`}
          />

          <InfoRow
            label="Customer"
            value={`${issue.customerName} ${issue.customerMobile ?? ''}`}
          />

          <InfoRow
            label="Address"
            value={issue.customerAddress}
          />
        </div>

        {/* STATUS */}
        {issue.status === 'reported' && (
          <div className="
            bg-[#FFF1E6]
            rounded-xl
            px-3 py-2
            text-[13px]
            font-medium
            text-[#8A4B00]
          ">
            Waiting for admin response
          </div>
        )}

        {issue.status === 'admin_responded' && (
          <div className="
            bg-blue-50
            border border-blue-200
            rounded-xl
            px-3 py-2
            text-[13px]
            text-blue-700
          ">
            Waiting for rider action
          </div>
        )}

        {issue.status === 'resolved' && (
          <div className="
            bg-green-50
            border border-green-200
            rounded-xl
            px-3 py-2
            text-[13px]
            text-green-700
          ">
            Issue resolved
          </div>
        )}

        {/* ADMIN RESPONSE */}
        {issue.adminResponse && issue.adminMessage && (
          <div className="bg-[#F5F5F5] rounded-xl p-3 text-[13px] text-[#2F2F33]">
            <p className="font-semibold mb-1">
              Admin Response: {issue.adminResponse === 'redeliver'
                ? 'Re-deliver'
                : 'Return to Shop'}
            </p>

            <p className="italic text-[#6B6B6F]">
              “{issue.adminMessage}”
            </p>

            {issue.adminRespondedAt && (
              <p className="text-[11px] text-[#8C8C91] mt-1">
                {formatDate(issue.adminRespondedAt)}
              </p>
            )}
          </div>
        )}

        {/* RIDER REATTEMPT */}
        {issue.riderReattemptStatus && (
          <div
            className={`rounded-xl px-3 py-2 text-[13px] font-medium ${
              issue.riderReattemptStatus === 'completed'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {issue.riderReattemptStatus === 'completed'
              ? 'Rider re-attempt completed'
              : 'Rider re-attempt failed'}
          </div>
        )}

        {/* CTA */}
        {issue.status === 'reported' && !showRespondForm && (
          <button
            onClick={() => setShowRespondForm(true)}
            className="
              w-full
              h-[48px]
              rounded-xl
              bg-[#FFCA28]
              text-[15px]
              font-semibold
              text-black
            "
          >
            Respond this Issue
          </button>
        )}

        {/* RESPOND FORM */}
        {showRespondForm && issue.status === 'reported' && (
          <RespondToIssue
            issue={issue}
            onSuccess={() => {
              setShowRespondForm(false);
              onUpdate();
            }}
          />
        )}

      </CardContent>
    </Card>
  );
}

/* ================= INFO ROW ================= */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="
      flex gap-3
      bg-[#F3F3F3]
      rounded-xl
      px-3 py-2
    ">
      <span className="text-[13px] text-[#6B6B6F] w-[80px]">
        {label}
      </span>

      <span className="text-[13px] text-[#1F1F24] leading-snug">
        {value}
      </span>
    </div>
  );
}
