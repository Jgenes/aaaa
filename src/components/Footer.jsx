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

function FooterColumn({ id, heading, links }) {
  return (
    <nav className="site-footer__col" aria-labelledby={id}>
      <h2 className="site-footer__heading" id={id}>
        {heading}
      </h2>
      <ul className="site-footer__links">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="th-container-wide">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <img src={LOGO} alt="TrainHub TZ — Elevating Skills. Transforming Tanzania." width="413" height="127" />
            <p className="site-footer__tagline">
              Elevating skills, transforming Tanzania. Accredited, cohort-based
              professional training delivered by verified providers.
            </p>
            <Link to="/trainings" className="site-footer__cta">
              Browse the catalogue
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>

          <FooterColumn id="footer-platform" heading="Platform" links={PLATFORM_LINKS} />
          <FooterColumn id="footer-company" heading="Company" links={COMPANY_LINKS} />
          <FooterColumn id="footer-legal" heading="Legal" links={LEGAL_LINKS} />

          <div className="site-footer__col site-footer__contact-col">
            <h2 className="site-footer__heading" id="footer-contact">
              Contact
            </h2>
            <address className="site-footer__address">
              Upanga, Dar es Salaam
              <br />
              P.O. Box 123, Tanzania
            </address>
            <ul className="site-footer__contact">
              <li>
                <i className="bi bi-telephone" aria-hidden="true"></i>
                <a href="tel:+255745732935">+255 745 732 935</a>
              </li>
              <li>
                <i className="bi bi-envelope" aria-hidden="true"></i>
                <a href="mailto:info@traininghub.co.tz">info@traininghub.co.tz</a>
              </li>
              <li>
                <i className="bi bi-whatsapp" aria-hidden="true"></i>
                <a href="https://wa.me/255745732935">WhatsApp the team</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copy mb-0">
            © {year} TrainHub TZ. All rights reserved. Built for Tanzanian learning
            institutions and enterprises.
          </p>

          <ul className="site-footer__meta">
            <li>Dar es Salaam, Tanzania</li>
            <li>
              <button
                type="button"
                className="site-footer__top-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Back to top
              </button>
            </li>
          </ul>

          <ul className="site-footer__socials">
            {SOCIALS.map((social) => (
              <li key={social.icon}>
                <a
                  href="#"
                  aria-label={social.label}
                  onClick={(e) => e.preventDefault()}
                >
                  <i className={`bi ${social.icon}`} aria-hidden="true"></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
