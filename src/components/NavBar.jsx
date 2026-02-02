import { useNavigate, Link } from "react-router-dom";
import LOGO from "../assets/logo1.png";
export default function NavBar() {
  const navigate = useNavigate();

  // Angalia kama user amelogin
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
    window.location.reload(); // Refresh ili Navbar ibadilike
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container-fluid px-4">
        {/* Brand (simple link, no button) */}
        <Link className=" fw-bold me-4 text-primary" to="/">
          <img src={LOGO} alt="TrainingHub Logo" style={{ height: "50px" }} />
        </Link>

        {/* Explore Link */}
        <Link
          style={{ fontSize: "13px", fontWeight: "bold" }}
          to="/explore"
          className="btn btn-link text-dark text-decoration-none me-3"
        >
          Explore
        </Link>

        {/* Search Bar */}
        <form className="d-none d-lg-flex flex-grow-1 me-4">
          <div className="input-group">
            <span className="input-group-text bg-light border-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="search"
              className="form-control border-0 bg-light"
              placeholder="Search for Training"
            />
          </div>
        </form>

        {/* Right Side Navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item" style={{ fontSize: "13px" }}>
              <Link className="nav-link text-dark" to="/trainings">
                Trainings
              </Link>
            </li>

            {token ? (
              <>
                {/* Logged-in user */}
                <li className="nav-item" style={{ fontSize: "13px" }}>
                  <Link
                    className="nav-link text-dark fw-semibold"
                    to="/learning"
                  >
                    My Learning
                  </Link>
                </li>
                {/* Transactions */}
                <li className="nav-item" style={{ fontSize: "13px" }}>
                  <Link
                    className="nav-link text-dark fw-semibold"
                    to="/transactions"
                  >
                    Transactions
                  </Link>
                </li>
                {/* Profile / Logout Dropdown */}
                <li className="nav-item dropdown ms-lg-3">
                  <button
                    className="btn btn-outline-dark dropdown-toggle rounded-circle p-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{ width: "40px", height: "40px" }}
                  >
                    {user.name?.charAt(0) || "U"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                    <li>
                      <h6 className="dropdown-header small text-muted">
                        {user.email}
                      </h6>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
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
              <>
                {/* Guest */}
                <li className="nav-item d-none d-lg-block">
                  <Link className="nav-link text-dark" to="/about">
                    About us
                  </Link>
                </li>

                <li className="nav-item ms-lg-3 me-2">
                  <Link to="/login">
                    <button
                      style={{ fontSize: "13px" }}
                      className="btn btn-outline-darks px-3"
                    >
                      Log in
                    </button>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link to="/tenant-register">
                    <button
                      style={{ fontSize: "13px" }}
                      className="btn btn-darks px-3"
                    >
                      For Training Provider
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
