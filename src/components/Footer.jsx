import { Link } from "react-router-dom";
import LOGO from "../assets/trainhub-tz-logo.png";

const PLATFORM_LINKS = [
  { label: "Browse trainings", to: "/trainings" },
  { label: "My learning", to: "/learning" },
  { label: "Transactions", to: "/transactions" },
  { label: "Teach on TrainHub", to: "/tenant-register" },
  { label: "Log in", to: "/login" },
];

const COMPANY_LINKS = [
  { label: "About us", to: "/contact" },
  { label: "Contact us", to: "/contact" },
  { label: "Careers", to: "/contact" },
  { label: "Help and support", to: "/contact" },
  { label: "Blog", to: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Terms of service", to: "/contact" },
  { label: "Privacy policy", to: "/contact" },
  { label: "Cookie settings", to: "/contact" },
  { label: "Accessibility", to: "/contact" },
  { label: "Sitemap", to: "/contact" },
];

const SOCIALS = [
  { icon: "bi-facebook", label: "Facebook" },
  { icon: "bi-twitter-x", label: "X (Twitter)" },
  { icon: "bi-instagram", label: "Instagram" },
  { icon: "bi-linkedin", label: "LinkedIn" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="th-container-wide">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <img src={LOGO} alt="TrainHub TZ" width="413" height="127" />
            <p className="site-footer__tagline">
              Elevating skills, transforming Tanzania. Accredited, cohort-based
              professional training delivered by verified providers.
            </p>
            <ul className="site-footer__contact">
              <li>
                <i className="bi bi-geo-alt" aria-hidden="true"></i>
                <span>P.O. Box 123, Upanga, Dar es Salaam</span>
              </li>
              <li>
                <i className="bi bi-telephone" aria-hidden="true"></i>
                <a href="tel:+255745732935">+255 745 732 935</a>
              </li>
              <li>
                <i className="bi bi-envelope" aria-hidden="true"></i>
                <a href="mailto:info@traininghub.co.tz">info@traininghub.co.tz</a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="footer-platform">
            <h2 className="site-footer__heading" id="footer-platform">
              Platform
            </h2>
            <ul className="site-footer__links">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 className="site-footer__heading" id="footer-company">
              Company
            </h2>
            <ul className="site-footer__links">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 className="site-footer__heading" id="footer-legal">
              Legal
            </h2>
            <ul className="site-footer__links">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p className="mb-0">
            © {year} TrainHub TZ. All rights reserved. Built for Tanzanian
            learning institutions and enterprises.
          </p>
          <div className="site-footer__socials">
            {SOCIALS.map((social) => (
              <a
                key={social.icon}
                href="#"
                aria-label={social.label}
                onClick={(e) => e.preventDefault()}
              >
                <i className={`bi ${social.icon}`} aria-hidden="true"></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
