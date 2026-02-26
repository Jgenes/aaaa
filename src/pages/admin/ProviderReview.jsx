import React, { useState, useEffect } from 'react';
import api from '../../api/axio';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProviderReview() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [reason, setReason] = useState('');
    const [actionType, setActionType] = useState(null); // APPROVING, SUSPENDING, REJECTING

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/providers');
            setProviders(res.data);
        } catch (error) {
            console.error("Error fetching providers:", error);
            toast.error("Failed to load providers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleAction = async (id, status) => {
        if (!id) return;

        // Validation kwa Suspend na Reject
        if (!reason && (status === 'SUSPENDED' || status === 'REJECTED')) {
            toast.warn(`Please provide a reason for ${status.toLowerCase()} this provider.`);
            return;
        }

        try {
            // Set loading state kulingana na button iliyobonyezwa
            if (status === 'APPROVED') setActionType('APPROVING');
            else if (status === 'SUSPENDED') setActionType('SUSPENDING');
            else if (status === 'REJECTED') setActionType('REJECTING');

            // Chagua endpoint sahihi
            let endpoint = `/providers/${id}/approve`;
            if (status === 'SUSPENDED') endpoint = `/providers/${id}/suspend`;
            if (status === 'REJECTED') endpoint = `/providers/${id}/reject`;

            const payload = (status === 'SUSPENDED' || status === 'REJECTED') 
                ? { reason } 
                : { reason: 'Approved' };

            const res = await api.post(endpoint, payload);

            toast.success(res.data.message || `Provider ${status} successfully!`);
            setReason('');

            // FIX OVERLAY/BACKDROP ISSUE
            const modalEl = document.getElementById('providerModal');
            const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
                // Ondoa giza la pembeni (backdrop) na rudi kwenye hali ya kawaida
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.style.overflow = 'auto';
                }, 300);
            }

            fetchProviders();
        } catch (error) {
            console.error("Action Error:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Operation failed.";
            toast.error(errorMsg);
        } finally {
            setActionType(null);
        }
    };

    const columns = [
        { name: 'Legal Name', selector: row => row.legal_name, sortable: true },
        { name: 'TIN', selector: row => row.tin || 'N/A', sortable: true },
        { name: 'Type', selector: row => row.provider_type, sortable: true },
        {
            name: 'Status',
            cell: row => (
                <span className={`badge ${
                    row.status === 'APPROVED' ? 'bg-success' : 
                    row.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                }`}>
                    {row.status}
                </span>
            )
        },
        {
            name: 'Action',
            cell: row => (
                <button
                style={{backgroundColor: '#0a2e67', color:'white', fontSize:'13px', transition: '0.2s'}}
                    className="btn btn-sm btn-outline-primary f"
                    data-bs-toggle="modal"
                    data-bs-target="#providerModal"
                    onClick={() => setSelectedProvider(row)}
                >
                    Review Profile
                </button>
            )
        }
    ];

    return (
        <AdminDashboardLayout title="Provider Review">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="card shadow-sm border-0 mt-3">
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={providers}
                        pagination
                        progressPending={loading}
                        highlightOnHover
                    />
                </div>
            </div>

            {/* ===== MODAL ===== */}
            <div className="modal fade" id="providerModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title">
                                <i className="bi bi-shield-check me-2"></i>
                                Provider Full Profile Review
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                disabled={actionType !== null}
                            ></button>
                        </div>

                        <div className="modal-body bg-light">
                            {selectedProvider && (
                                <div className="container-fluid">
                                    <div className="row g-4">
                                        {/* Business Info */}
                                        <div className="col-md-4">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-header bg-white fw-bold" style={{color: '#111827'}}>Business Identity</div>
                                                <div className="card-body">
                                                    <label className="text-muted small d-block">Legal Name</label>
                                                    <p className="fw-bold mb-3">{selectedProvider.legal_name}</p>
                                                    <label className="text-muted small d-block">Brand Name</label>
                                                    <p className="fw-bold mb-3">{selectedProvider.brand_name || 'N/A'}</p>
                                                    <label className="text-muted small d-block">TIN Number</label>
                                                    <p className="fw-bold mb-3 text-danger">{selectedProvider.tin || 'Not Provided'}</p>
                                                    <label className="text-muted small d-block">Reg Reference</label>
                                                    <p className="fw-bold mb-3">{selectedProvider.registration_ref || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="col-md-4">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-header bg-white fw-bold " style={{color: '#111827'}}>Location Details</div>
                                                <div className="card-body">
                                                    <label className="text-muted small d-block">Country & Region</label>
                                                    <p className="fw-bold mb-3">{selectedProvider.country}, {selectedProvider.region}</p>
                                                    <label className="text-muted small d-block">Physical Address</label>
                                                    <p className="fw-bold mb-3">{selectedProvider.physical_address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="col-md-4">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-header bg-white fw-bold " style={{color: '#111827'}}>Contact Person</div>
                                                <div className="card-body">
                                                    <label className="text-muted small d-block">Full Name</label>
                                                    <p className="fw-bold mb-3">{selectedProvider.contact_name}</p>
                                                    <label className="text-muted small d-block">Official Email</label>
                                                    <p className="fw-bold mb-3 text-primary">{selectedProvider.contact_email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason Input */}
                                        <div className="col-12 mt-4">
                                            <div className="p-3 bg-white rounded shadow-sm border-start border-primary border-4">
                                                <h6 className="fw-bold mb-2 text-dark">Administrative Decision Note</h6>
                                                <textarea
                                                    className="form-control border-0 bg-light"
                                                    rows="3"
                                                    value={reason}
                                                    onChange={e => setReason(e.target.value)}
                                                    placeholder="Write the reason here for rejection or suspension..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer border-0 bg-white">
                            <button
                                type="button"
                                className="btn btn-light fw-bold"
                                data-bs-dismiss="modal"
                                disabled={actionType !== null}
                            >Close</button>
                            
                            <div className="ms-auto">
                                {/* REJECT BUTTON */}
                                <button
                                style={{fontSize:'13px', transition: '0.2s'}}
                                    className="btn btn-warning px-2  me-2 text-dark"
                                    onClick={() => handleAction(selectedProvider.id, 'REJECTED')}
                                    disabled={actionType !== null}
                                >
                                    {actionType === 'REJECTING' ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Rejecting...</>
                                    ) : 'Reject Profile'}
                                </button>

                                {/* SUSPEND BUTTON */}
                                <button
                                                                style={{fontSize:'13px', transition: '0.2s'}}

                                    className="btn btn-danger px-4 fw-bold me-2"
                                    onClick={() => handleAction(selectedProvider.id, 'SUSPENDED')}
                                    disabled={actionType !== null}
                                >
                                    {actionType === 'SUSPENDING' ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Suspending...</>
                                    ) : 'Suspend'}
                                </button>

                                {/* APPROVE BUTTON */}
                                <button
                                                                style={{fontSize:'13px', transition: '0.2s'}}

                                    className="btn btn-success px-4 fw-bold"
                                    onClick={() => handleAction(selectedProvider.id, 'APPROVED')}
                                    disabled={actionType !== null}
                                >
                                    {actionType === 'APPROVING' ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Approving...</>
                                    ) : 'Approve Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminDashboardLayout>
    );
}