// ActivateAccount.jsx
import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const called = useRef(false); // MUHIMU: Inazuia kuitwa mara mbili

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (token && !called.current) {
      called.current = true; // Tunaiwasha hapa kuzuia request ya pili

      axios.post(`http://localhost:8000/api/auth/activate-account`, { token, email })
        .then(response => {
          console.log("Success:", response.data);
          // Badala ya alert, tunarudisha moja kwa moja login
          navigate("/login?activated=true");
        })
        .catch(error => {
          console.error("Activation error:", error.response?.data?.message || "Something went wrong");
          // Hapa unaweza kuonyesha ujumbe kama link imetumika
        });
    }
  }, [searchParams, navigate]);

  return (
    <>
    <NavBar />
    <div className=" mt-5 mb-5 d-flex justify-content-center align-items-center vh-90">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h4>Tunawasha akaunti yako, subiri kidogo...</h4>
      </div>
    </div>
    <Footer />
    </>
  );
}