import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import api from "../../api/axio";
import ProviderDashboardLayout from './layouts/ProviderDashboardLayout';

export default function Penrollments() {

    const { courseId } = useParams();
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const columns = [
        {
            name: 'Student Name',
            selector: row => row.user?.name || "N/A",
            sortable: true,
        },
        {
            name: 'Course',
            selector: row => row.course?.title || "N/A",
            sortable: true,
        },
        {
            name: 'Cohort',
            selector: row => row.cohort?.name || "Not Assigned",
            sortable: true,
        },
        {
            name: 'Status',
            cell: row => (
                <span style={{
                    color:
                        row.status === "PAID" ||
                        row.status === "COMPLETED" ||
                        row.status === "SUCCESS"
                            ? "green"
                            : "#666"
                }}>
                    {row.status}
                </span>
            ),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <button
                    style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#studentModal"
                    onClick={() => setSelectedStudent(row)}
                >
                    👁 View
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
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
            item.course?.title?.toLowerCase().includes(value)
        );

        setFilteredData(filtered);
    };

    return (
        <ProviderDashboardLayout title="Provider Enrollments">

            <div style={{ padding: '20px' }}>

                {/* BACK BUTTON */}
                <div style={{ marginBottom: '15px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>
                </div>

                {/* SEARCH */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <input
                        type="text"
                        placeholder="Search student or course..."
                        onChange={handleSearch}
                        style={{
                            padding: '10px',
                            width: '250px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                {/* TABLE */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    progressPending={loading}
                    pagination
                    highlightOnHover
                    noDataComponent="No enrollments found"
                />
            </div>

            {/* ================= STUDENT DETAILS MODAL ================= */}
            <div
                className="modal fade"
                id="studentModal"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">Student Full Details</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            ></button>
                        </div>

                        <div className="modal-body">
                            {selectedStudent ? (
                                <div className="row g-3">

                                    <div className="col-6">
                                        <strong>Name:</strong>
                                        <div>{selectedStudent.user?.name || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Email:</strong>
                                        <div>{selectedStudent.email || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Phone:</strong>
                                        <div>{selectedStudent.phone_number || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Organization:</strong>
                                        <div>{selectedStudent.organization || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Position:</strong>
                                        <div>{selectedStudent.position || "N/A"}</div>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <hr />
                                        <h6>Address Information</h6>
                                    </div>

                                    <div className="col-6">
                                        <strong>Street:</strong>
                                        <div>{selectedStudent.street || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Region:</strong>
                                        <div>{selectedStudent.region || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>City:</strong>
                                        <div>{selectedStudent.city || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Postal Code:</strong>
                                        <div>{selectedStudent.postal_code || "N/A"}</div>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <hr />
                                        <h6>Course Information</h6>
                                    </div>

                                    <div className="col-6">
                                        <strong>Course:</strong>
                                        <div>{selectedStudent.course?.title || "N/A"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Cohort:</strong>
                                        <div>{selectedStudent.cohort?.name || "Not Assigned"}</div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Status:</strong>
                                        <div>
                                            <span className={`badge ${
                                                selectedStudent.status === "PAID" ||
                                                selectedStudent.status === "COMPLETED" ||
                                                selectedStudent.status === "SUCCESS"
                                                    ? "bg-success"
                                                    : "bg-warning text-dark"
                                            }`}>
                                                {selectedStudent.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <strong>Amount Paid:</strong>
                                        <div>
                                            Tsh {new Intl.NumberFormat().format(selectedStudent.amount || 0)}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center">Loading...</div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

        </ProviderDashboardLayout>
    );
}