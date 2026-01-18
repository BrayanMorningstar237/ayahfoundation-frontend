import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Programs from "./pages/Programs";
import AdminApp from "./admin/AdminApp";
import AdminLogin from "./admin/pages/AdminLogin";
import Footer from "./components/Footer";
import News from "./pages/News";
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Public pages with footer */}
      <Route
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
        path="/"
      />

      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />

      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />

      <Route
  path="/programs/:id"
  element={
    <PublicLayout>
      <Programs />
    </PublicLayout>
  }
/>

<Route path="/news/:id" element={<PublicLayout><News /></PublicLayout>} />


      {/* Admin (NO footer) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

export default App;
