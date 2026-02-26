import React, { useState, useEffect } from 'react';
import api from '../../api/axio';
import ProviderDashboardLayout from "./layouts/AdminDashboardLayout";
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';

export default function AdminCourses() {

    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]); // State kwa ajili ya search
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [searchText, setSearchText] = useState(''); // State ya text unayoandika
    
    const [reason, setReason] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/courses');
            const data = res.data || [];
            setCourses(data);
            setFilteredCourses(data); // Mwanzoni filtered ni sawa na zote
        } catch (error) {
            toast.error("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // LOGIC YA SEARCH
    useEffect(() => {
        const filtered = courses.filter(course => 
            course.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            course.provider?.legal_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            course.category?.toLowerCase().includes(searchText.toLowerCase()) ||
            course.status?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredCourses(filtered);
    }, [searchText, courses]);

    const handleStatusUpdate = async (id, newStatus) => {
        if (!id) return;

        if (newStatus === 'DRAFT' && !isDrafting) {
            setIsDrafting(true);
            return;
        }

        try {
            setActionType(newStatus);
            await api.post(`/courses/${id}/status`, { 
                status: newStatus,
                reason: newStatus === 'DRAFT' ? reason : '' 
            });
            
            toast.success(`Course updated to ${newStatus}`);
            setReason('');
            setIsDrafting(false);
            fetchCourses();

            const modalElement = document.getElementById('courseModal');
            const modal = window.bootstrap?.Modal?.getInstance(modalElement);
            if (modal) modal.hide();

        } catch (error) {
            toast.error("Action failed.");
        } finally {
            setActionType(null);
        }
    };

    const columns = [
        {
            name: 'Title',
            selector: row => row.title,
            sortable: true
        },
        {
            name: 'Provider',
            selector: row => row.provider?.legal_name || row.provider?.name || 'N/A',
            sortable: true
        },
        {
            name: 'Category',
            selector: row => row.category || 'N/A',
            sortable: true
        },
        {
            name: 'Mode',
            selector: row => row.mode || 'N/A'
        },
        {
            name: 'Status',
            cell: row => {
                const currentStatus = row.status ? row.status.toUpperCase().trim() : '';
                let badgeClass = 'bg-warning text-dark';

                if (currentStatus === 'PUBLISHED' || currentStatus === 'APPROVED') {
                    badgeClass = 'bg-success';
                } else if (currentStatus === 'DRAFT') {
                    badgeClass = 'bg-secondary';
                }

                return (
                    <span className={`badge ${badgeClass}`}>
                        {row.status}
                    </span>
                );
            },
            sortable: true
        },
        {
            name: 'Action',
            cell: row => (
                <button
                style={{backgroundColor:'#0a2e67', fontSize:'13px', transition: '0.2s', color:'#fff', borderColor:'#0a2e67'}}
                    className="btn btn-sm btn-outline-primary fw-bold"
                    data-bs-toggle="modal"
                    data-bs-target="#courseModal"
                    onClick={() => {
                        setSelectedCourse(row);
                        setIsDrafting(false);
                        setReason('');
                    }}
                >
                    Review
                </button>
            )
        }
    ];

    return (
        <ProviderDashboardLayout title="Courses Management">

            <ToastContainer position="top-right" autoClose={3000} />

            {/* SEARCH SECTION */}
            <div className="row mt-3 mb-2">
                <div className="col-md-4 ms-auto">
                    <div className="input-group shadow-sm">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-start-0" 
                            placeholder="Search courses..." 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <DataTable
                        columns={columns}
                        data={filteredCourses} // Tunatumia filtered data hapa
                        pagination
                        progressPending={loading}
                        highlightOnHover
                        responsive
                    />
                </div>
            </div>

            {/* MODAL */}
            <div className="modal fade" id="courseModal" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow-lg">

                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title">
                                {selectedCourse?.title}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body bg-light">
                            {selectedCourse?.banner && (
                                <div className="mb-3">
                                    <img
                                        src={`http://localhost:8000/${selectedCourse.banner}`}
                                        alt="Course Banner"
                                        className="img-fluid rounded shadow-sm w-100"
                                        style={{ maxHeight: "300px", objectFit: "cover" }}
                                    />
                                </div>
                            )}

                            {selectedCourse && (
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="card shadow-sm border-0">
                                            <div className="card-body">
                                                <p><strong>Provider:</strong> {selectedCourse.provider?.legal_name || 'N/A'}</p>
                                                <p><strong>Status:</strong> {selectedCourse.status}</p>
                                                <p><strong>Category:</strong> {selectedCourse.category}</p>
                                                <p><strong>Mode:</strong> {selectedCourse.mode}</p>
                                                <hr/>
                                                <p><strong>Short Description:</strong><br/>{selectedCourse.short_description}</p>
                                                <p><strong>Learning Outcomes:</strong><br/>{selectedCourse.learning_outcomes}</p>
                                                <p><strong>Requirements:</strong><br/>{selectedCourse.requirements}</p>
                                                <p><strong>Skills:</strong><br/>{selectedCourse.skills}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card shadow-sm border-0">
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-3">Cohorts (Intakes)</h6>
                                                {selectedCourse.cohorts?.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-sm table-hover">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>Intake Name</th>
                                                                    <th>Start Date</th>
                                                                    <th>Price</th>
                                                                    <th>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedCourse.cohorts.map((cohort) => (
                                                                    <tr key={cohort.id}>
                                                                        <td>{cohort.intake_name}</td>
                                                                        <td>{cohort.start_date}</td>
                                                                        <td>{new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }).format(cohort.price)}</td>
                                                                        <td>
                                                                            <span className={`badge ${
                                                                                cohort.status === 'ACTIVE' ? 'bg-success' : 'bg-warning text-dark'
                                                                            }`}>
                                                                                {cohort.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted">No cohorts available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="card shadow-sm border-0">
                                            <div className="card-body">
                                                <h6 className="fw-bold">Long Description</h6>
                                                <p>{selectedCourse.long_description}</p>
                                                <hr/>
                                                <h6 className="fw-bold">Contents</h6>
                                                {selectedCourse.contents && Array.isArray(selectedCourse.contents) ? (
                                                    selectedCourse.contents.map((item, index) => (
                                                        <div key={index} className="mb-4 p-3 border rounded bg-white">
                                                            <h6 className="fw-bold text-primary">{index + 1}. {item.title}</h6>
                                                            <p>{item.description}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-muted">No contents available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isDrafting && (
                                <div className="mt-4 p-3 border border-danger rounded bg-white shadow-sm">
                                    <label className="form-label fw-bold text-danger">Reason for Rejection/Draft:</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="3" 
                                        placeholder="Enter reason here..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        autoFocus
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                                            style={{fontSize:'13px', transition: '0.2s'}}

                                className="btn btn-secondary"
                                onClick={() => {
                                    if(isDrafting) setIsDrafting(false);
                                }}
                                data-bs-dismiss={!isDrafting ? "modal" : ""}
                            >
                                {isDrafting ? 'Back' : 'Close'}
                            </button>

                            <button
                                                            style={{fontSize:'13px', transition: '0.2s'}}

                                className="btn btn-danger"
                                onClick={() => handleStatusUpdate(selectedCourse?.id, 'DRAFT')}
                                disabled={actionType !== null || (isDrafting && !reason.trim())}
                            >
                                {actionType === 'DRAFT' ? 'Processing...' : (isDrafting ? 'Confirm Draft' : 'Set Draft')}
                            </button>

                            {!isDrafting && (
                                <button
                                                                style={{fontSize:'13px', transition: '0.2s'}}

                                    className="btn btn-success"
                                    onClick={() => handleStatusUpdate(selectedCourse?.id, 'PUBLISHED')}
                                    disabled={actionType !== null}
                                >
                                    {actionType === 'PUBLISHED' ? 'Publishing...' : 'Approve & Publish'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>

        </ProviderDashboardLayout>
    );
}