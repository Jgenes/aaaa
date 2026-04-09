import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { FaArrowLeft, FaSearch, FaEye, FaUserGraduate, FaMoneyBillWave, FaMapMarkerAlt } from "react-icons/fa";
import api from "../../api/axio";
import ProviderDashboardLayout from './layouts/ProviderDashboardLayout';

export default function Penrollments() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#f8fafc",
                color: "#0a2e67",
                fontWeight: "700",
                fontSize: "13px",
                textTransform: "uppercase",
                paddingLeft: '18px'
            },
        },
        cells: {
            style: {
                fontSize: "14px",
                paddingLeft: '18px',
                paddingTop: '12px',
                paddingBottom: '12px'
            },
        },
    };

    const columns = [
        {
            name: 'Student',
            selector: row => row.user?.name,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: "35px", height: "35px", fontSize: "12px" }}>
                        {row.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="fw-bold text-dark">{row.user?.name || "N/A"}</div>
                        <small className="text-muted">{row.email}</small>
                    </div>
                </div>
            ),
            grow: 1.5
        },
        {
            name: 'Cohort',
            selector: row => row.cohort?.name,
            sortable: true,
            cell: row => (
                <span className="badge bg-light text-secondary border">
                    {row.cohort?.name || "Not Assigned"}
                </span>
            )
        },
        {
            name: 'Payment Status',
            selector: row => row.status,
            sortable: true,
            cell: row => {
                const status = row.status?.toUpperCase();
                const isSuccess = ["PAID", "COMPLETED", "SUCCESS"].includes(status);
                return (
                    <span className={`fw-bold d-flex align-items-center gap-1`} style={{ color: isSuccess ? "#2ecc71" : "#f39c12", fontSize: "12px" }}>
                        <span style={{ fontSize: "10px" }}>●</span> {status || "PENDING"}
                    </span>
                );
            }
        },
        {
            name: 'Actions',
            right: true,
            cell: (row) => (
                <button
                    className="btn btn-sm btn-outline-primary border-0 d-flex align-items-center gap-1"
                    data-bs-toggle="modal"
                    data-bs-target="#studentModal"
                    onClick={() => setSelectedStudent(row)}
                >
                    <FaEye size={16} /> Details
                </button>
            ),
        },
    ];

    useEffect(() => {
        if (!courseId) return;
        const fetchEnrollments = async () => {
            try {
                const response = await api.get(`/provider/courses/${courseId}/enrollments`);
                const data = response.data.enrollments || [];
                setEnrollments(data);
                setFilteredData(data);
            } catch (error) {
                console.error("Error fetching enrollments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, [courseId]);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = enrollments.filter(item =>
            item.user?.name?.toLowerCase().includes(value) ||
            item.email?.toLowerCase().includes(value)
        );
        setFilteredData(filtered);
    };

    return (
        <ProviderDashboardLayout title="Course Enrollments">
            <style>{`
                .search-card { background: #fff; border-radius: 12px; padding: 15px 20px; border: 1px solid #edf2f7; margin-bottom: 20px; }
                .search-input-group { position: relative; max-width: 350px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #a0aec0; }
                .search-control { padding-left: 35px; border-radius: 8px; border: 1px solid #e2e8f0; height: 40px; font-size: 14px; }
                .table-wrapper { background: #fff; border-radius: 12px; border: 1px solid #edf2f7; overflow: hidden; }
                .modal-content { border-radius: 16px; border: none; }
                .modal-header { border-bottom: 1px solid #f1f5f9; background: #fafafa; border-radius: 16px 16px 0 0; }
                .detail-label { font-size: 11px; text-transform: uppercase; color: #a0aec0; font-weight: 700; margin-bottom: 2px; }
                .detail-value { font-size: 14px; color: #2d3748; font-weight: 600; }
                .section-divider { border-left: 3px solid #0a2e67; padding-left: 10px; margin: 15px 0; color: #0a2e67; font-weight: 700; font-size: 14px; }
            `}</style>

            <div className="container py-4">
                {/* Back Link */}
                <button className="btn btn-link text-decoration-none text-muted p-0 mb-4 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                    <FaArrowLeft size={12} /> Back to Trainings
                </button>

                {/* Top Action Bar */}
                <div className="search-card shadow-sm">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="search-input-group flex-grow-1">
                            <FaSearch className="search-icon" size={13} />
                            <input 
                                type="text" 
                                className="form-control search-control" 
                                placeholder="Search student name or email..." 
                                onChange={handleSearch} 
                            />
                        </div>
                        <div className="ms-3 text-muted small fw-bold">
                            Total Students: {filteredData.length}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="table-wrapper shadow-sm">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        progressPending={loading}
                        pagination
                        highlightOnHover
                        responsive
                        customStyles={customStyles}
                        noDataComponent={<div className="p-5 text-muted">No students enrolled yet.</div>}
                    />
                </div>
            </div>

            {/* Student Details Modal */}
            <div className="modal fade" id="studentModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content shadow-lg">
                        <div className="modal-header px-4 py-3">
                            <h5 className="modal-title fw-bold" style={{ color: "#0a2e67" }}>
                                <FaUserGraduate className="me-2" /> Student Profile
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4">
                            {selectedStudent ? (
                                <div>
                                    <div className="section-divider">Personal Information</div>
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <div className="detail-label">Full Name</div>
                                            <div className="detail-value">{selectedStudent.user?.name || "N/A"}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="detail-label">Email Address</div>
                                            <div className="detail-value">{selectedStudent.email || "N/A"}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="detail-label">Phone Number</div>
                                            <div className="detail-value">{selectedStudent.phone_number || "N/A"}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="detail-label">Organization</div>
                                            <div className="detail-value">{selectedStudent.organization || "N/A"}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="detail-label">Job Position</div>
                                            <div className="detail-value">{selectedStudent.position || "N/A"}</div>
                                        </div>
                                    </div>

                                    <div className="section-divider mt-4"><FaMapMarkerAlt size={14} className="me-1"/> Address & Location</div>
                                    <div className="row g-4">
                                        <div className="col-md-3 col-6">
                                            <div className="detail-label">City</div>
                                            <div className="detail-value">{selectedStudent.city || "N/A"}</div>
                                        </div>
                                        <div className="col-md-3 col-6">
                                            <div className="detail-label">Region</div>
                                            <div className="detail-value">{selectedStudent.region || "N/A"}</div>
                                        </div>
                                        <div className="col-md-6 col-12">
                                            <div className="detail-label">Street</div>
                                            <div className="detail-value">{selectedStudent.street || "N/A"}</div>
                                        </div>
                                    </div>

                                    <div className="section-divider mt-4"><FaMoneyBillWave size={14} className="me-1"/> Enrollment & Payment</div>
                                    <div className="row g-4 bg-light p-3 rounded-3">
                                        <div className="col-md-4">
                                            <div className="detail-label">Status</div>
                                            <span className={`badge ${["PAID", "SUCCESS"].includes(selectedStudent.status?.toUpperCase()) ? "bg-success" : "bg-warning text-dark"}`}>
                                                {selectedStudent.status}
                                            </span>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="detail-label">Amount Paid</div>
                                            <div className="detail-value text-primary">Tsh {new Intl.NumberFormat().format(selectedStudent.amount || 0)}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="detail-label">Assigned Cohort</div>
                                            <div className="detail-value">{selectedStudent.cohort?.name || "Pending"}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">Fetching details...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProviderDashboardLayout>
    );
}