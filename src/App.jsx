import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VerificationMatricule from './pages/auth/VerificationMatricule';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StaffActivation from './pages/auth/StaffActivation';
import StaffLogin from './pages/auth/StaffLogin';
import PageViewerNav from './components/PageViewerNav';
import CreateTicket from './components/tickets/CreateTicket';
import Home from './pages/Home';
import UtilisateurDashboard from './pages/dashboards/UtilisateurDashboard';
import ResponsableDashboard from './pages/dashboards/ResponsableDashboard';
import TechnicienDashboard from './pages/dashboards/TechnicienDashboard';
import PointFocalDashboard from './pages/dashboards/PointFocalDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

export default function App() {
  return (
    <>
      <PageViewerNav />
      <Routes>
        <Route path="/" element={<VerificationMatricule />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        
        {/* Nouveaux liens d'activation et de connexion staff */}
        <Route path="/activation/:token" element={<StaffActivation />} />
        <Route path="/connexion-staff" element={<StaffLogin />} />

        <Route path="/creer-ticket" element={<CreateTicket />} />
        <Route path="/home" element={<Home />} />

        {/* Routes ouvertes temporairement pour prévisualisation */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/responsable/dashboard" element={<ResponsableDashboard />} />
        <Route path="/technicien/dashboard" element={<TechnicienDashboard />} />
        <Route path="/point-focal/dashboard" element={<PointFocalDashboard />} />
        <Route path="/utilisateur/dashboard" element={<UtilisateurDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}