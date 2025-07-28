import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "./context-api/authSlice";
import Login from "./form/Login"; import RegisterSelect from "./form/RegisterSelect"; import Registration from "./form/Registration"; import Verification from "./form/Verification"; import PolicyPage from "./form/PolicyPage"; import Healthcard from "./components/Healthcard"; import BookApp from "./components/BookApp"; import Home from "./pages/Home"; import AVLogo from "./assets/fav.png";
import DashboardLayout from "./pages/layouts/DashboardLayout"; import PdashboardRoutes from "./pages/layouts/menu/PatientDashboard/PdashboardRoutes"; import AdminRoutes from "./pages/layouts/menu/SuperAdminDashboard/AdminRoute"; import AdminDashboard from "./pages/layouts/menu/SuperAdminDashboard/Dashboard"; import DrRoutes from "./pages/layouts/menu/DoctorDashboard/DrRoutes"; import Overview from "./pages/layouts/menu/DoctorDashboard/Overview"; import LabRoutes from "./pages/layouts/menu/LabDashboard/Ldroutes"; import LabDashboard from "./pages/layouts/menu/LabDashboard/LabDashboard"; import HospitalRoutes from "./pages/layouts/menu/HospitalDashboard/Hdroutes"; import HospitalDashboard from "./pages/layouts/menu/HospitalDashboard/Dashboard";
import StaffManagement from "./components/AdminModule"; import PharmacyManagement from "./components/PharmacyModule"; import LabManagement from "./components/LabModule"; import QueueManagement from "./components/QueueManagaement"; import QueueToken from "./components/Queue-Token"; import Frontdesk from "./components/FrontendDesk"; import TokenDisplay from "./components/Token-Display";
import { ToastContainer } from "react-toastify"; import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [tokens, setTokens] = useState([]), [loading, setLoading] = useState(true); const dispatch = useDispatch(); const { user } = useSelector(s => s.auth);

  const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
  const handleTokenGenerated = t => setTokens(p => [...p, t]);
  const handleTokenUpdate = u => setTokens(u);
  const getNextTokenNumber = () => tokens.length + 1;

  const PrivateRoute = ({ allowedType }) => {
    const u = getUser(); if (!u) return <Navigate to="/login" />; if (allowedType && u.userType !== allowedType) return <Navigate to="/redirect" />; return <Outlet />;
  };
  const RequireAuth = ({ children }) => (!getUser() ? <Navigate to="/login" replace /> : children);
  const RoleRedirect = () => {
    const u = getUser(); if (!u) return <Navigate to="/login" />;
    const map = { doctor:"/doctordashboard", lab:"/labdashboard", hospital:"/hospitaldashboard", freelancer:"/freelancerdashboard", superadmin:"/superadmindashboard", patient:"/patientdashboard" };
    return <Navigate to={map[u.userType] || "/"} />;
  };

  useEffect(() => {
    const f = document.getElementById("favicon"); f ? f.href = AVLogo : (() => { const n = document.createElement("link"); n.rel = "icon"; n.id = "favicon"; n.type = "image/png"; n.href = AVLogo; document.head.appendChild(n); })();
    const u = localStorage.getItem("user"), t = localStorage.getItem("token"); if (u && t) dispatch(setUser(JSON.parse(u))); setLoading(false);
  }, [dispatch]);

  if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;

  const sharedRoutes = <>
    <Route path="dr-admin" element={<StaffManagement />} />
    <Route path="pharmacymodule" element={<PharmacyManagement />} />
    <Route path="labmodule" element={<LabManagement />} />
    <Route path="frontdesk" element={<Frontdesk />} />
    <Route path="queuemanagement" element={<QueueManagement tokens={tokens} onTokensUpdate={handleTokenUpdate} />} />
    <Route path="queuetoken" element={<QueueToken onTokenGenerated={handleTokenGenerated} currentTokenNumber={getNextTokenNumber()} />} />
    <Route path="tokendisplay" element={<TokenDisplay tokens={tokens} />} />
  </>;

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} /> <Route path="/register" element={<RegisterSelect />} /> <Route path="/registration" element={<Registration />} /> <Route path="/terms-and-conditions" element={<PolicyPage />} /> <Route path="/verification" element={<Verification />} /> <Route path="/login" element={<Login />} /> <Route path="/healthcard" element={<Healthcard />} /> <Route path="/bookconsultation" element={<BookApp />} />
        {/* Redirect */}
        <Route path="/redirect" element={<RoleRedirect />} />
        {/* Patient */}
        <Route path="/patientdashboard/*" element={<RequireAuth><DashboardLayout /></RequireAuth>}><Route path="*" element={<PdashboardRoutes />} /></Route>
        {/* Doctor */}
        <Route element={<PrivateRoute allowedType="doctor" />}><Route path="/doctordashboard" element={<DashboardLayout />}><Route index element={<Overview />} />{sharedRoutes}<Route path="*" element={<DrRoutes />} /></Route></Route>
        {/* Hospital */}
        <Route element={<PrivateRoute allowedType="hospital" />}><Route path="/hospitaldashboard" element={<DashboardLayout />}><Route index element={<HospitalDashboard />} />{sharedRoutes}<Route path="*" element={<HospitalRoutes />} /></Route></Route>
        {/* Lab */}
        <Route element={<PrivateRoute allowedType="lab" />}><Route path="/labdashboard" element={<DashboardLayout />}><Route index element={<LabDashboard />} /><Route path="*" element={<LabRoutes />} /></Route></Route>
        {/* Superadmin */}
        <Route element={<PrivateRoute allowedType="superadmin" />}><Route path="/superadmindashboard" element={<DashboardLayout />}><Route index element={<AdminDashboard />} /><Route path="*" element={<AdminRoutes />} /></Route></Route>
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;
