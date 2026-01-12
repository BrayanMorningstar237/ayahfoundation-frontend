
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {

  

  return (
    <>
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <Home />
        
      </main>
      <Footer />
    </>
  );
}

export default App;
