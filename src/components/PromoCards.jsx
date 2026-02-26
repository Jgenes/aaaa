import React from "react";

export default function PromoCards() {
  return (
    <div className="promo-container">
      <div className="promo-grid">
        {/* LEFT CARD: TEAMS */}
        <div
          className="promo-card left"
          style={{
            background: "linear-gradient(90deg, #0a2e67 0%, #0048b3 100%)",
          }}
        >
          <div style={styles.textContent}>
            <div style={styles.brand}>
              <strong style={{ fontSize: "20px" }}>TrainingHub</strong>{" "}
              <span style={{ fontWeight: "200", fontSize: "18px" }}>for teams</span>
            </div>
            <h2 style={styles.heading}>
              Train your team in top skills and join 3,700+ teams worldwide
            </h2>
            <button style={styles.btnWhite}>Enroll now &rarr;</button>
          </div>

          <div style={styles.imageContainer}>
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
              alt="Team"
              style={styles.cardImage}
            />
            <div style={styles.badge}>
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>50% off</div>
              <div style={{ fontSize: "10px" }}>team training</div>
              <div style={{ fontSize: "8px", opacity: 0.8 }}>*Up to 125 licenses</div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: INDIVIDUAL */}
        <div className="promo-card right" style={{ background: "#FFF8EE", color: "#1f1f1f" }}>
          <div style={styles.textContent}>
            <h2
              style={{
                ...styles.heading,
                color: "#1f1f1f",
                fontSize: "32px",
                marginBottom: "8px",
              }}
            >
              Start, switch, or advance your career
            </h2>
            <p style={styles.subtext}>Grow with 10,000+ courses from top organizations</p>
            <button style={styles.btnBlue}>Join for Free &rarr;</button>
          </div>

          <div style={styles.rightImageWrapper}>
            <div style={styles.pinkShape}></div>
            <img
              src="https://www.freeiconspng.com/uploads/student-png-30.png"
              alt="Individual"
              style={styles.individualImage}
            />
          </div>
        </div>
      </div>

      {/* MEDIA QUERIES FOR RESPONSIVENESS */}
      <style jsx>{`
        .promo-container {
          padding: 40px 10px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          top: -40px;
          font-family: "Source Sans Pro", Arial, sans-serif;
        }

        .promo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .promo-card {
          display: flex;
          flex-direction: row;
          border-radius: 20px;
          overflow: hidden;
          min-height: 340px;
        }

        @media (max-width: 992px) {
          .promo-card {
            flex-direction: column;
          }
        }

        @media (max-width: 576px) {
          .promo-card {
            min-height: auto;
          }
          .promo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  textContent: {
    flex: 1.2,
    padding: "40px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brand: {
    color: "#fff",
    marginBottom: "15px",
  },
  heading: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: "1.1",
    marginBottom: "24px",
  },
  subtext: {
    fontSize: "13px",
    marginBottom: "24px",
    color: "#3e3e3e",
  },
  btnWhite: {
    background: "#fff",
    color: "#0a2e67",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "bold",
    width: "fit-content",
    cursor: "pointer",
  },
  btnBlue: {
    background: "#0a2e67",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "bold",
    width: "fit-content",
    cursor: "pointer",
  },
  imageContainer: {
    position: "relative",
    flex: 0.8,
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
  },
  cardImage: {
    height: "100%",
    width: "100%",
    objectFit: "cover",
    clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)",
  },
  rightImageWrapper: {
    position: "relative",
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  pinkShape: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "#FCDDEC",
    borderRadius: "50%",
    top: "-50px",
    right: "-50px",
    zIndex: 1,
  },
  individualImage: {
    height: "100%",
    width: "auto",
    position: "relative",
    zIndex: 3,
    objectFit: "contain",
    display: "block",
  },
  badge: {
    position: "absolute",
    bottom: "30px",
    left: "15%",
    background: "#0a2e67",
    color: "#fff",
    padding: "15px",
    borderRadius: "50%",
    width: "90px",
    height: "90px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    zIndex: 5,
  },
};