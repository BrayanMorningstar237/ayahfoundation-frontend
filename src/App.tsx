import { useEffect, useState } from "react";
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Checking API...");

  useEffect(() => {
    // Call backend health endpoint
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => setApiStatus(data.message))
      .catch((err) => {
        console.error("Error fetching API:", err);
        setApiStatus("API unreachable");
      });
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <Home />
        <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
          API Status: {apiStatus}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
