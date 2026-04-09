import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import LOGO from "../assets/logo1.png";

export default function NavBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // ✅ LOGIC: Angalia kama ni Provider na kama bado hajamaliza onboarding
  // Hapa nimechukulia kuwa una field inaitwa 'status' au 'onboarded'
  const isProviderOnboarding = user.role === "provider" && user.onboarded === false;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2">
      <div className="container-fluid px-lg-4">
        <Link to="/" className="navbar-brand me-2" style={{ backgroundColor:"white" }} >
          <img src={LOGO} alt="Logo" style={{ height: "50px", objectFit: "contain" }} />
        </Link>

        <button 
          className="navbar-toggler shadow-none border-0" 
          type="button" 
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <i className={`bi ${isNavOpen ? 'bi-x-lg' : 'bi-list'} fs-3`}></i>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`}>
          
          {/* SEARCH - Ficha kama yuko onboarding ili asivurugike */}
          {!isProviderOnboarding && (
            <form className="d-flex mt-3 mt-lg-0 flex-grow-1 mx-lg-4 order-2 order-lg-1">
              <div className="input-group w-100">
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="search"
                  className="form-control border-0 bg-light shadow-none"
                  placeholder="Search for Training..."
                  style={{ fontSize: "14px" }}
                />
              </div>
            </form>
          )}

          <ul className="navbar-nav ms-auto align-items-lg-center order-1 order-lg-2 gap-2">
            
            {/* LINKS ZA KAWAIDA - Zinaonekana kama siyo onboarding */}
            {!isProviderOnboarding && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-dark fw-bold" to="/" onClick={() => setIsNavOpen(false)} style={{ fontSize: "13px" }}>
                    Explore
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-dark" to="/trainings" onClick={() => setIsNavOpen(false)} style={{ fontSize: "13px" }}>
                    Trainings
                  </Link>
                </li>
              </>
            )}

            {token ? (
              <>
                {/* FICHA HIZI KAMA NI PROVIDER ANAYEFANYA ONBOARDING */}
                {!isProviderOnboarding && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-dark fw-semibold" to="/learning" onClick={() => setIsNavOpen(false)} style={{ fontSize: "13px" }}>
                        My Learning
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-dark fw-semibold" to="/transactions" onClick={() => setIsNavOpen(false)} style={{ fontSize: "13px" }}>
                        Transactions
                      </Link>
                    </li>
                  </>
                )}
                
                {/* PROFILE DROPDOWN - Hii inabaki ili aweze ku-Logout */}
                <li className="nav-item dropdown ms-lg-2" ref={dropdownRef}>
                  <button
                    className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center shadow-none mt-2 mt-lg-0"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ width: "38px", height: "38px", fontSize: "14px" }}
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </button>

                  <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isOpen ? "show d-block" : "d-none"}`}
                      style={{ position: "absolute", right: 0 }}>
                    <li className="px-3 py-2 border-bottom">
                       <p className="mb-0 small fw-bold text-truncate" style={{maxWidth: "150px"}}>{user.name}</p>
                       <span className="badge bg-primary-subtle text-primary x-small">
                        {isProviderOnboarding ? "Onboarding" : user.role}
                       </span>
                    </li>
                    <li>
                      <button className="dropdown-item small text-danger fw-bold" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 mt-3 mt-lg-0">
                <li className="nav-item">
                  <Link className="nav-link text-dark me-2" to="/contact" style={{ fontSize: "13px" }}>
                    Contact us
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="w-100" onClick={() => setIsNavOpen(false)}>
                    <button className="btn btn-outline-dark px-4 w-100 shadow-none" style={{ fontSize: "13px", borderRadius: "4px" }}>
                      Log in
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/tenant-register" className="w-100" onClick={() => setIsNavOpen(false)}>
                    <button className="btn btn-dark px-3 w-100 shadow-none" style={{ fontSize: "13px", borderRadius: "4px" }}>
                      Join as Provider
                    </button>
                  </Link>
                </li>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
