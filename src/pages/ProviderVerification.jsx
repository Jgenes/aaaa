import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
export default function ProviderVerification() {
  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 mt-5 card3">
              <div className="card-body p-4">
                <center>
                  <h5 style={{ fontSize: "15px" }}>
                    Your Information is under review, please wait!
                  </h5>
                </center>
                <center>
                  <p>⏳</p>
                </center>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
