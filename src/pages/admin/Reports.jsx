import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import { CSVLink } from "react-csv";
import { DollarSign, Users, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "../../api/axio";

export default function AdminReports() {
    const [activeTab, setActiveTab] = useState("finance");
    const [period, setPeriod] = useState("monthly");
    const [courseId, setCourseId] = useState("");
    const [providerId, setProviderId] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState({ courses: [], providers: [] });

    useEffect(() => {
        fetchReports();
    }, [period, courseId, providerId]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/reports/summary`, {
                params: { period, course_id: courseId, provider_id: providerId }
            });
            setData(res.data);
            if (res.data.options) setOptions(res.data.options);
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }
    };

    const periods = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'annual', label: 'Annual' }
    ];

    return (
        <AdminDashboardLayout title="Performance Reports">
            <div className="container-fluid mt-4">
                
                {/* --- FILTERS (Style Yako Ile Ile) --- */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex gap-3 align-items-center">
                        <div className="btn-group shadow-sm bg-white p-1 rounded">
                            {periods.map(p => (
                                <button 
                                    key={p.id}
                                    className={`btn btn-sm px-4 ${period === p.id ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                                    onClick={() => setPeriod(p.id)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <select className="form-select form-select-sm shadow-sm border-0" style={{width: '180px'}} value={providerId} onChange={(e) => setProviderId(e.target.value)}>
                            <option value="">All Providers</option>
                            {options.providers?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>

                        <select className="form-select form-select-sm shadow-sm border-0" style={{width: '180px'}} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                            <option value="">All Courses</option>
                            {options.courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    
                    {data && (
                        <CSVLink 
                            data={activeTab === "finance" ? (data?.revenue || []) : (data?.enrollments || [])} 
                            filename={`${activeTab}-report.csv`}
                            className="btn btn-dark d-flex align-items-center gap-2"
                        >
                            <Download size={18} /> Export Report
                        </CSVLink>
                    )}
                </div>

                {/* --- TABS (Style Yako Ile Ile) --- */}
                <ul className="nav nav-tabs border-0 mb-4">
                    <li className="nav-item">
                        <button className={`nav-link border-0 fw-bold ${activeTab === 'finance' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`} onClick={() => setActiveTab('finance')}>
                            Financials
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link border-0 fw-bold ${activeTab === 'enrollment' ? 'text-primary border-bottom border-primary border-3' : 'text-muted'}`} onClick={() => setActiveTab('enrollment')}>
                            Enrollments
                        </button>
                    </li>
                </ul>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'finance' ? (
                            <div className="animate__animated animate__fadeIn">
                                {/* Finance Cards */}
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm p-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary-subtle p-3 rounded-circle text-primary">
                                                    <DollarSign size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-muted small mb-0">{period.toUpperCase()} REVENUE</p>
                                                    <h4 className="fw-bold mb-0">TSh {data?.summary?.total_revenue?.toLocaleString() || 0}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Graph Section (Fixed Height for Recharts) */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-0 py-3">
                                        <h5 className="fw-bold mb-0">Revenue Trend ({period})</h5>
                                    </div>
                                    <div className="card-body" style={{ minHeight: "400px", width: "100%" }}>
                                        {data?.revenue && data.revenue.length > 0 ? (
                                            <div style={{ width: '100%', height: 400 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={data.revenue}>
                                                        <defs>
                                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1}/>
                                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `TSh ${val/1000}k`} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="total_amount" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{height: "350px"}}>
                                                No financial data found for this selection.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate__animated animate__fadeIn">
                                {/* Enrollment Summary Card */}
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm p-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-success-subtle p-3 rounded-circle text-success">
                                                    <Users size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-muted small mb-0">TOTAL ENROLLMENTS</p>
                                                    <h4 className="fw-bold mb-0">{data?.summary?.total_enrollments || 0} Students</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enrollment Table (Style Yako Ile Ile) */}
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-header bg-white border-0 py-4 px-4">
                                        <h5 className="fw-bold mb-0">Course Enrollment Breakdown</h5>
                                    </div>
                                    <div className="card-body px-4 pb-4">
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="border-0">Course Title</th>
                                                        <th className="border-0 text-center">Enrolled Students</th>
                                                        <th className="border-0 text-end">Market Share</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data?.enrollments?.length > 0 ? (
                                                        data.enrollments.map((item, index) => {
                                                            const total = data.summary.total_enrollments || 1;
                                                            const percentage = ((item.student_count / total) * 100).toFixed(1);
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="fw-semibold">{item.course_name}</td>
                                                                    <td className="text-center">
                                                                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                                                                            {item.student_count} Students
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-end">
                                                                        <div className="d-flex align-items-center justify-content-end gap-2">
                                                                            <div className="progress w-50" style={{height: '6px'}}>
                                                                                <div className="progress-bar bg-success" style={{width: `${percentage}%`}}></div>
                                                                            </div>
                                                                            <span className="small text-muted">{percentage}%</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="text-center py-4 text-muted">No enrollments recorded yet.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminDashboardLayout>
    );
}