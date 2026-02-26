import { useState, useEffect } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";

export default function ProviderCohorts() {
  const [cohorts, setCohorts] = useState([]);
  const [filteredCohorts, setFilteredCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [students, setStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCohorts(); }, []);

  const fetchCohorts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/provider/all-cohorts");
      // --- DEBUG SECTION ---
      console.log("1. Raw Cohorts from API:", res.data);
      if(res.data.cohorts && res.data.cohorts.length > 0) {
         console.log("2. Sample Cohort Keys:", Object.keys(res.data.cohorts[0]));
      }
      // ---------------------
      const data = res.data?.cohorts || [];
      setCohorts(data);
      setFilteredCohorts(data);
    } catch (err) { 
      console.error("API Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const viewStudents = async (cohort) => {
    console.log("3. Viewing Students for Cohort ID:", cohort.id);
    setSelectedCohort(cohort);
    setFetchingStudents(true);
    try {
      const res = await api.get(`/provider/cohort-students/${cohort.id}`);
      console.log("4. Students List for Cohort 5:", res.data.students);
      setStudents(res.data?.students || []);
    } catch (err) { 
      console.error("Student API Error:", err); 
    } finally { 
      setFetchingStudents(false); 
    }
  };

  useEffect(() => {
    const result = cohorts.filter((item) => {
      const searchTerm = search.toLowerCase();
      // Tunacheki majina yote yanayoweza kuwepo (title, course_title, au course.title)
      const cTitle = (item.course_title || item.title || item.course?.title || "").toLowerCase();
      const iName = (item.intake_name || item.name || "").toLowerCase();
      
      return iName.includes(searchTerm) || cTitle.includes(searchTerm) || item.start_date?.includes(searchTerm);
    });
    setFilteredCohorts(result);
  }, [search, cohorts]);

  const cohortColumns = [
    { 
      name: "Cohort/Intake", 
      selector: row => row.intake_name || row.name, 
      sortable: true,
      cell: row => <span className="fw-bold">{row.intake_name || row.name || "Unnamed"}</span>
    },
    { 
      name: "Course Title", 
      // Hapa ndio muhimu: Inatafuta course_title (SQL alias) AU course.title (Eloquent)
      selector: row => row.course_title || row.course?.title || row.title || "N/A", 
      sortable: true 
    },
    { name: "Start Date", selector: row => row.start_date, sortable: true },
    { 
      name: "Seats", 
      cell: row => <span>{row.seats_taken || 0} / {row.capacity}</span> 
    },
    {
      name: "Actions",
      cell: (row) => (
        <button className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#studentListModal" onClick={() => viewStudents(row)}>
          <i className="bi bi-people"></i> Students
        </button>
      ),
    },
  ];

  const studentColumns = [
    { 
      name: "Name", 
      selector: row => row.name, 
      sortable: true,
      cell: row => <div><strong>{row.name || "No Name"}</strong><br/><small>{row.email}</small></div>
    },
    { name: "Org", selector: row => row.organization || "Private" },
    { name: "Phone", selector: row => row.phone_number },
    { 
      name: "Amount", 
      selector: row => row.amount,
      cell: row => <span className="text-success fw-bold">Tsh {new Intl.NumberFormat().format(row.amount)}</span>
    }
  ];

  return (
    <ProviderDashboardLayout title="Cohort Management">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <input 
            type="text" className="form-control" placeholder="Search..." 
            value={search} onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <DataTable columns={cohortColumns} data={filteredCohorts} pagination progressPending={loading} />
      </div>

      <div className="modal fade" id="studentListModal" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cohort: {selectedCohort?.intake_name || selectedCohort?.name}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-0">
              <DataTable columns={studentColumns} data={students} pagination progressPending={fetchingStudents} />
            </div>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}