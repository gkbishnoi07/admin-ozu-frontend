import { useState, useEffect } from 'react';
import { RidersAPI } from '@/lib/api';
import type { PendingRider, ApprovedRider } from '@/types/riderApproval';
import './index.css';

export default function RiderApprovalPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [pendingRiders, setPendingRiders] = useState<PendingRider[]>([]);
  const [approvedRiders, setApprovedRiders] = useState<ApprovedRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState<PendingRider | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Fetch riders data
  const fetchRiders = async () => {
    try {
      // Fetch pending riders
      const pendingData = await RidersAPI.getPending();
      setPendingRiders(pendingData.riders || []);

      // Fetch approved riders
      const approvedData = await RidersAPI.getApproved();
      setApprovedRiders(approvedData.riders || []);

    } catch (error) {
      console.error('Error fetching riders:', error);
      alert('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRiders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Approve rider
  const handleApprove = async (riderId: string | number, riderName: string) => {
    const confirmApprove = window.confirm(
      `Approve rider: ${riderName}?\n\nThey will start receiving delivery requests.`
    );
    
    if (!confirmApprove) return;

    try {
      await RidersAPI.approve(riderId);
      alert('✅ Rider approved successfully!');
      fetchRiders(); // Refresh list
    } catch (error) {
      console.error('Error approving rider:', error);
      alert('❌ Failed to approve rider');
    }
  };

  // Approve with name edit
  const handleApproveWithEdit = (rider: PendingRider) => {
    setSelectedRider(rider);
    setEditedName(rider.name);
    setShowEditModal(true);
  };

  const submitApprovalWithName = async () => {
    if (!editedName.trim()) {
      alert('Please enter a rider name');
      return;
    }

    if (!selectedRider) return;

    try {
      await RidersAPI.approve(selectedRider.id, editedName);
      alert('✅ Rider approved successfully!');
      setShowEditModal(false);
      fetchRiders();
    } catch (error) {
      console.error('Error approving rider:', error);
      alert('❌ Failed to approve rider');
    }
  };

  // Reject rider
  const handleReject = async (riderId: string | number, riderName: string) => {
    const confirmReject = window.confirm(
      `Reject rider: ${riderName}?\n\nThis will delete their account permanently.`
    );
    
    if (!confirmReject) return;

    try {
      await RidersAPI.reject(riderId);
      alert('❌ Rider rejected and removed');
      fetchRiders(); // Refresh list
    } catch (error) {
      console.error('Error rejecting rider:', error);
      alert('❌ Failed to reject rider');
    }
  };

  if (loading) {
    return (
      <div className="riders-approval-page">
        <div className="loading">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4">Loading riders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="riders-approval-page">
      <div className="page-header">
        <h1>🏍️ Riders Management</h1>
        <p>Approve or reject delivery riders</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending Approval
          {pendingRiders.length > 0 && (
            <span className="badge">{pendingRiders.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          ✅ Approved Riders
          <span className="badge approved">{approvedRiders.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pending' && (
          <PendingRidersTab
            riders={pendingRiders}
            onApprove={handleApprove}
            onApproveWithEdit={handleApproveWithEdit}
            onReject={handleReject}
          />
        )}

        {activeTab === 'approved' && (
          <ApprovedRidersTab riders={approvedRiders} />
        )}
      </div>

      {/* Edit Name Modal */}
      {showEditModal && selectedRider && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Rider Name</h2>
            <div className="form-group">
              <label>Current: {selectedRider.name}</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter rider name"
                className="name-input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={submitApprovalWithName} className="approve-btn">
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------
// Pending Riders Tab Component
// -------------------------
interface PendingRidersTabProps {
  riders: PendingRider[];
  onApprove: (riderId: string | number, riderName: string) => void;
  onApproveWithEdit: (rider: PendingRider) => void;
  onReject: (riderId: string | number, riderName: string) => void;
}

function PendingRidersTab({ riders, onApprove, onApproveWithEdit, onReject }: PendingRidersTabProps) {
  if (riders.length === 0) {
    return (
      <div className="empty-state">
        <p>✅ No pending riders</p>
        <small>New riders who send "hi" on WhatsApp will appear here</small>
      </div>
    );
  }

  return (
    <div className="riders-grid">
      {riders.map(rider => (
        <div key={rider.id} className="rider-card pending">
          <div className="rider-header">
            <div className="rider-avatar">
              {rider.name.charAt(0).toUpperCase()}
            </div>
            <div className="rider-info">
              <h3>{rider.name}</h3>
              <p className="contact">{rider.contact}</p>
              <p className="wa-id">WhatsApp: {rider.wa_id}</p>
            </div>
          </div>

          <div className="rider-details">
            <div className="detail-row">
              <span className="label">Zone:</span>
              <span className="value">{rider.zone || 'Not set'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Registered:</span>
              <span className="value">
                {new Date(rider.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rider-actions">
            <button
              onClick={() => onApprove(rider.id, rider.name)}
              className="btn-approve"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => onApproveWithEdit(rider)}
              className="btn-edit"
            >
              ✏️ Edit & Approve
            </button>
            <button
              onClick={() => onReject(rider.id, rider.name)}
              className="btn-reject"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------
// Approved Riders Tab Component
// -------------------------
interface ApprovedRidersTabProps {
  riders: ApprovedRider[];
}

function ApprovedRidersTab({ riders }: ApprovedRidersTabProps) {
  if (riders.length === 0) {
    return (
      <div className="empty-state">
        <p>No approved riders yet</p>
      </div>
    );
  }

  return (
    <div className="riders-grid">
      {riders.map(rider => (
        <div key={rider.id} className="rider-card approved">
          <div className="rider-header">
            <div className="rider-avatar approved">
              {rider.name.charAt(0).toUpperCase()}
            </div>
            <div className="rider-info">
              <h3>{rider.name}</h3>
              <p className="contact">{rider.contact}</p>
            </div>
            <div className="status-badge">
              {rider.isAvailable ? (
                <span className="available">🟢 Available</span>
              ) : (
                <span className="unavailable">🔴 Busy</span>
              )}
            </div>
          </div>

          <div className="rider-details">
            <div className="detail-row">
              <span className="label">Zone:</span>
              <span className="value">{rider.zone || 'Not set'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Location:</span>
              <span className="value">
                {rider.hasLocation ? '📍 Tracked' : '📍 Not tracked'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Joined:</span>
              <span className="value">
                {new Date(rider.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

