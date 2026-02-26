import { useEffect, useState } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { toast, ToastContainer } from "react-toastify";

export default function ProviderReports() {
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [selectedCourse, setSelectedCourse] = useState("all"); 
  const [myCourses, setMyCourses] = useState([]); 

  useEffect(() => {
    fetchReports();
  }, [period, selectedCourse]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const urlParams = `?period=${period}&course_id=${selectedCourse}`;
      
      const [enrolRes, revRes] = await Promise.all([
        api.get(`/provider/reports/enrollments${urlParams}`),
        api.get(`/provider/reports/revenue${urlParams}`)
      ]);
      
      setEnrollmentData(enrolRes.data);
      setRevenueData(revRes.data);
      
      if (myCourses.length === 0) {
        const coursesRes = await api.get("/provider/reports/courses-list"); // 🔹 fixed endpoint for provider courses
        setMyCourses(coursesRes.data || []);
      }
    } catch (err) {
      toast.error("Failed to load reports: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

const handleDownload = async (type, format) => {
  setLoading(true);
  try {
    const response = await api.get(`/provider/reports/${type}`, {
      params: {
        period,
        course_id: selectedCourse,
        format,
      },
      responseType: 'blob', // 🔑 important for files
    });

    const blob = new Blob([response.data], {
      type: format === 'pdf' ? 'application/pdf' : 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${type}_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    link.click();
  } catch (err) {
    toast.error("Failed to download: " + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  if (loading && !enrollmentData)
    return (
      <ProviderDashboardLayout title="Reports">
        <div className="text-center mt-5">Loading report...</div>
      </ProviderDashboardLayout>
    );

  return (
    <ProviderDashboardLayout title="Performance Analytics">
      <ToastContainer />

      {/* Filters */}
      <div className="row mb-4 g-2">
        <div className="col-md-6">
          <label className="small fw-bold text-muted">Select Training:</label>
          <select 
            className="form-select shadow-sm" 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Trainings</option>
            {myCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="small fw-bold text-muted">PERIOD:</label>
          <select 
            className="form-select shadow-sm" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row g-4 mb-4">
        <StatCard title="Total Enrollments" value={enrollmentData?.total_students} color="bg-primary" />
        <StatCard title="Total Revenue (TZS)" value={revenueData?.total_revenue?.toLocaleString()} color="bg-dark" />
        <StatCard title="Status" value={selectedCourse === 'all' ? 'All Courses' : 'Single Course'} color="bg-info" />
      </div>

      {/* Action Buttons */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="fw-bold small mb-2 text-muted">ENROLLMENT EXPORTS</h6>
            <div className="d-flex gap-2">
              <button onClick={() => handleDownload('enrollments', 'pdf')} className="btn btn-danger btn-sm px-3 shadow-sm">
                <i className="bi bi-file-pdf me-1"></i> PDF
              </button>
              <button onClick={() => handleDownload('enrollments', 'excel')} className="btn btn-success btn-sm px-3 shadow-sm">
                <i className="bi bi-file-excel me-1"></i> EXCEL
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="fw-bold small mb-2 text-muted">REVENUE EXPORTS</h6>
            <div className="d-flex gap-2">
              <button onClick={() => handleDownload('revenue', 'pdf')} className="btn btn-outline-danger btn-sm px-3">
                <i className="bi bi-file-pdf me-1"></i> PDF
              </button>
              <button onClick={() => handleDownload('revenue', 'excel')} className="btn btn-outline-success btn-sm px-3">
                <i className="bi bi-file-excel me-1"></i> EXCEL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pt-3">
          <h6 className="fw-bold mb-0">
            {selectedCourse === 'all' ? 'Course Breakdown' : 'Student Enrollment Details'}
          </h6>
          <small className="text-muted">Detailed view for the selected {period} period.</small>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-3" style={{width: '50px'}}>#</th>
                  <th className="py-3">{selectedCourse === 'all' ? 'Course Title' : 'Student Name'}</th>
                  <th className="py-3 text-end px-3">{selectedCourse === 'all' ? 'Success Enrollments' : 'Payment Date'}</th>
                </tr>
              </thead>
              <tbody>
                {selectedCourse === 'all' ? (
                  enrollmentData?.breakdown?.length > 0 ? (
                    enrollmentData.breakdown.map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 text-muted">{i + 1}</td>
                        <td className="fw-semibold text-dark">{c.title}</td>
                        <td className="text-end px-3">
                          <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                            {c.count} Students
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center py-4 text-muted">Hakuna data ya kozi kwa sasa.</td></tr>
                  )
                ) : (
                  revenueData?.transactions?.length > 0 ? (
                    revenueData.transactions.map((tx, i) => (
                      <tr key={i}>
                        <td className="px-3 text-muted">{i + 1}</td>
                        <td>
                          <div className="fw-semibold">{tx.user?.name}</div>
                          <small className="text-muted">{tx.user?.email}</small>
                        </td>
                        <td className="text-end px-3 font-monospace">
                          {new Date(tx.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center py-4 text-muted">Hakuna miamala iliyopatikana kwa kozi hii.</td></tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-light border-0 py-2">
            <div className="text-end">
                <small className="fw-bold text-muted">Data valid as of: {enrollmentData?.generated_at}</small>
            </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="col-md-4">
      <div className={`card border-0 shadow-sm ${color} text-white p-4 h-100 position-relative overflow-hidden`}>
        <div className="position-relative z-1">
            <small className="text-uppercase fw-bold opacity-75 d-block mb-1">{title}</small>
            <h2 className="fw-bold mb-0">{value ?? 0}</h2>
        </div>
        <div className="position-absolute" style={{right: '-20px', bottom: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
      </div>
    </div>
  );
}