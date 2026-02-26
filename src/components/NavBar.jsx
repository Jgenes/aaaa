import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import LOGO from "../assets/logo1.png";

export default function NavBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Dropdown ya Profile
  const [isNavOpen, setIsNavOpen] = useState(false); // Mobile Menu Toggle
  const dropdownRef = useRef(null);

  // User data
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
    window.location.reload();
  };

  // Close dropdown when clicking outside
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
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container-fluid px-4">
        {/* LOGO - Nimeondoa kila class inayoweza kuifanya ionekane kama button */}
        <Link to="/" style={{ textDecoration: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}>
          <img src={LOGO} alt="TrainingHub Logo" style={{ height: "70px", display: "block" }} />
        </Link>

        {/* HAMBURGER BUTTON - Kwa ajili ya Mobile pekee */}
        <button 
          className="navbar-toggler shadow-none border-0" 
          type="button" 
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* EXPLORE - Style yako asilia */}
        <Link
          style={{ fontSize: "13px", fontWeight: "bold" }}
          to="/"
          className="btn btn-link text-dark text-decoration-none me-3 d-none d-lg-inline-block"
        >
          Explore
        </Link>

        {/* SEARCH BAR - Style yako asilia */}
        <form className="d-none d-lg-flex flex-grow-1 me-4">
          <div className="input-group">
            <span className="input-group-text bg-light border-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="search"
              className="form-control border-0 bg-light shadow-none"
              placeholder="Search for Training"
            />
          </div>
        </form>

        {/* MENU ITEMS */}
        <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item" style={{ fontSize: "13px" }}>
              <Link className="nav-link text-dark" to="/trainings" onClick={() => setIsNavOpen(false)}>
                Trainings
              </Link>
            </li>

            {token ? (
              <>
                <li className="nav-item" style={{ fontSize: "13px" }}>
                  <Link className="nav-link text-dark fw-semibold" to="/learning" onClick={() => setIsNavOpen(false)}>
                    My Learning
                  </Link>
                </li>
                <li className="nav-item" style={{ fontSize: "13px" }}>
                  <Link className="nav-link text-dark fw-semibold" to="/transactions" onClick={() => setIsNavOpen(false)}>
                    Transactions
                  </Link>
                </li>

                {/* Profile Dropdown */}
                <li className="nav-item dropdown ms-lg-3" ref={dropdownRef}>
                  <button
                    className="btn btn-outline-dark dropdown-toggle rounded-circle p-2 shadow-none"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ width: "40px", height: "40px" }}
                  >
                    {user.name?.charAt(0) || "U"}
                  </button>

                  <ul 
                    className={`dropdown-menu dropdown-menu-end shadow border-0 ${isOpen ? "show" : ""}`}
                    style={{ 
                        display: isOpen ? "block" : "none", 
                        right: 0, 
                        left: "auto",
                        position: "absolute",
                        zIndex: 1000
                    }}
                  >
                    <li>
                      <h6 className="dropdown-header small text-muted">
                        {user.email}
                      </h6>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        style={{ fontSize: "13px" }}
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <div className="d-lg-flex align-items-center">
                <li className="nav-item">
                  <Link className="nav-link text-dark" to="/about" style={{ fontSize: "13px" }}>
                    About us
                  </Link>
                </li>
                <li className="nav-item ms-lg-3 me-2">
                  <Link to="/login">
                    <button style={{ fontSize: "13px" }} className="btn btn-outline-dark px-3 shadow-none">
                      Log in
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/tenant-register">
                    <button style={{ fontSize: "13px" }} className="btn btn-dark px-3 shadow-none">
                      For Training Provider
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