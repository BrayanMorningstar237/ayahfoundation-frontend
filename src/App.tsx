import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Programs from "./pages/Programs";
import News from "./pages/News";
import Campaign from "./pages/Campaign";
import AdminApp from "./admin/AdminApp";
import AdminLogin from "./admin/pages/AdminLogin";
import DonateStripePage from "./pages/DonateStripe";
import Donation from "./pages/Donation";
import Footer from "./components/Footer";
import ScrollToTop from "./pages/ScrollToTop";
import DonationSuccess from "./pages/DonationSuccess";

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
    <>
      <ScrollToTop />

      <Routes>
        {/* Public pages (WITH footer) */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
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
<Route
  path="/news"
  element={
    <PublicLayout>
      <News />
    </PublicLayout>
  }
/>
<Route
  path="/campaigns"
  element={
    <PublicLayout>
      <Campaign />
    </PublicLayout>
  }
/>
<Route
  path="/campaigns/:id"
  element={
    <PublicLayout>
      <Campaign />
    </PublicLayout>
  }
/>
<Route
  path="/stories"
  element={
    <PublicLayout>
      <Home />
    </PublicLayout>
  }
/>

<Route
  path="/donation"
  element={
    <PublicLayout>
      <Donation />
    </PublicLayout>
  }
/>
<Route path="/donate" element={<PublicLayout><DonateStripePage /></PublicLayout>} />
<Route path="/donation-success" element={<DonationSuccess />} />

        <Route
          path="/news/:id"
          element={
            <PublicLayout>
              <News />
            </PublicLayout>
          }
        />

        {/* Admin pages (NO footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </>
  );
}

export default App;
