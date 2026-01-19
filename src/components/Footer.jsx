export default function Footer() {
  return (
    <footer className="footer mt-5 pt-5 pb-3">
      <div className="container">
        {/* TOP LINKS */}
        <div className="row text-white">
          <div className="col-6 col-md-3 mb-3">
            <ul className="list-unstyled small">
              <li>
                <a href="#" className="footer-link">
                  TrainingHub
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Teach on TrainingHub
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Get the app
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  About us
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3 mb-3">
            <ul className="list-unstyled small">
              <li>
                <a href="#" className="footer-link">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Help and Support
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Affiliate
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Investors
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3 mb-3">
            <ul className="list-unstyled small">
              <li>
                <a href="#" className="footer-link">
                  Terms
                </a>
              </li>
              <li className="mt-3">
                <a href="#" className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Cookie Settings
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Sitemap
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* LANGUAGE + SOCIAL MEDIA */}
          <div className="col-6 col-md-3 d-flex flex-column gap-3">
            <ul className="list-unstyled small">
              <li>
                <a href="#" className="footer-link">
                  P.O.BOX 123 Dar-es-Salaam
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  +255 745 732 935
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  info@traininghub.com
                </a>
              </li>
            </ul>
            <div className="d-flex gap-3 footer1">
              <a href="#" className="footer-social">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="footer-social">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="footer-social">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="footer-social">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap text-white-50 small">
          <img
            src="https://via.placeholder.com/100x25/ffffff/000000?text=Logo"
            alt="Logo"
            style={{ maxHeight: "28px" }}
            className="mb-2"
          />
          <span>© {new Date().getFullYear()} TrainingHub</span>
        </div>
      </div>
    </footer>
  );
}
