// =========================================================================
// RIDERS APPROVAL PAGE - Complete Implementation
// =========================================================================

import React, { useState, useEffect } from 'react';
import './RidersApproval.css'; // CSS file below

// -------------------------
// Main Riders Approval Component
// -------------------------
export default function RidersApprovalPage() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  const [pendingRiders, setPendingRiders] = useState([]);
  const [approvedRiders, setApprovedRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Fetch riders data
  const fetchRiders = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Your JWT token
      const baseURL = 'https://ozu-source-code.onrender.com/api';

      // Fetch pending riders
      const pendingResponse = await fetch(`${baseURL}/riders/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pendingData = await pendingResponse.json();
      setPendingRiders(pendingData.riders || []);

      // Fetch approved riders
      const approvedResponse = await fetch(`${baseURL}/riders/approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const approvedData = await approvedResponse.json();
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
  const handleApprove = async (riderId, riderName) => {
    const confirmApprove = window.confirm(
      `Approve rider: ${riderName}?\n\nThey will start receiving delivery requests.`
    );
    
    if (!confirmApprove) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://ozu-source-code.onrender.com/api/riders/${riderId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        alert('✅ Rider approved successfully!');
        fetchRiders(); // Refresh list
      } else {
        alert('❌ Failed to approve rider');
      }
    } catch (error) {
      console.error('Error approving rider:', error);
      alert('❌ Error approving rider');
    }
  };

  // Approve with name edit
  const handleApproveWithEdit = (rider) => {
    setSelectedRider(rider);
    setEditedName(rider.name);
    setShowEditModal(true);
  };

  const submitApprovalWithName = async () => {
    if (!editedName.trim()) {
      alert('Please enter a rider name');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://ozu-source-code.onrender.com/api/riders/${selectedRider.id}/approve?rider_name=${encodeURIComponent(editedName)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        alert('✅ Rider approved successfully!');
        setShowEditModal(false);
        fetchRiders();
      } else {
        alert('❌ Failed to approve rider');
      }
    } catch (error) {
      console.error('Error approving rider:', error);
      alert('❌ Error approving rider');
    }
  };

  // Reject rider
  const handleReject = async (riderId, riderName) => {
    const confirmReject = window.confirm(
      `Reject rider: ${riderName}?\n\nThis will delete their account permanently.`
    );
    
    if (!confirmReject) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `https://ozu-source-code.onrender.com/api/riders/${riderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        alert('❌ Rider rejected and removed');
        fetchRiders(); // Refresh list
      } else {
        alert('❌ Failed to reject rider');
      }
    } catch (error) {
      console.error('Error rejecting rider:', error);
      alert('❌ Error rejecting rider');
    }
  };

  if (loading) {
    return (
      <div className="riders-approval-page">
        <div className="loading">Loading riders...</div>
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
      {showEditModal && (
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
function PendingRidersTab({ riders, onApprove, onApproveWithEdit, onReject }) {
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
function ApprovedRidersTab({ riders }) {
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

