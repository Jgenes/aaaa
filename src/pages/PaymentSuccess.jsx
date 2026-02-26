// PaymentSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    // Hii inahakikisha ukurasa unajitoa kwenye iframe kama ulikwama
    if (window.top !== window.self) {
      window.top.location.href = window.location.href;
    }
  }, []);

  return (
    <>
      <NavBar />
      <div className="text-center py-5">
        <h1>
          Malipo {status === "COMPLETED" ? "Yamefanikiwa!" : "Yanasubiri..."}
        </h1>
        <p>Get Started with Your Learning Journey</p>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/my-learning")}
        >
          Learn
        </button>
      </div>
      <Footer />
    </>
  );
}
