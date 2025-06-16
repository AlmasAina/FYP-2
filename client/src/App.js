import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from './components/Pages/login';
import Signup from './components/Pages/Signup';
import LP from './components/Pages/landingpage';
import Header from './components/header';
import Footer from './components/Footer';
import DrHome from "./components/Pages/dr_home";
import AppointmentManagementCard from "./components/Pages/Doctor_appointment";
import ProfilePatient from "./components/Pages/profilePatient";
import SidebarPatient from "./components/Pages/sidebarPatient";
import SidebarDoctor from "./components/Pages/sidebardoctor";
import AppointmentBookingPatient from "./components/Pages/appointment_BookingPatient";
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ForgotPassword from './components/Pages/forget_password';
import AdminDashboard from './components/Pages/admin';
import PharmacistDashboard from "./components/Pages/pharma";
import LabAttendentDashboard from "./components/Pages/lab";
import InsuranceDashboard from "./components/Pages/insurance";
import DoctorPrescription from "./components/Pages/doctor_prescription";
import DoctorMedicalRecords from "./components/Pages/doc_record";
import PatientPrescription from "./components/Pages/patient_record";
import HelpDesk from "./components/Pages/helpdesk";

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Determine which sidebar to show based on route
  const isDoctorPage = location.pathname === "/Doctor";
  const isPatientPage = location.pathname === "/profilePatient";
  const isAppointmentPage = location.pathname === "/Doctor_appointment";
  const isAppointmentPagePatient = location.pathname === "/appointment_BookingPatient";

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="app">
          {/* Conditionally render the appropriate sidebar */}
          {isDoctorPage && (
            <SidebarDoctor
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}
          {isPatientPage && (
            <SidebarPatient
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}
          {isAppointmentPage && (
            <SidebarDoctor
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}
          {isAppointmentPagePatient && (
            <SidebarPatient
              isSidebarVisible={isSidebarVisible}
              toggleSidebar={toggleSidebar}
            />
          )}

          <Routes>
            <Route index element={<LP />} />
            <Route path="/LP" element={<LP />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/landingpage" element={<LP />} />
            <Route path="/Header" element={<Header />} />
            <Route path="/Footer" element={<Footer />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/pharmacist-dashboard" element={<PharmacistDashboard />} />
            <Route path="/lab-attendee-dashboard" element={<LabAttendentDashboard />} />
            <Route path="/insurance-dashboard" element={<InsuranceDashboard />} />
            <Route path="/Doctor" element={<DrHome isSidebarVisible={isSidebarVisible} />} />
            <Route path="/prescriptions" element={<DoctorPrescription isSidebarVisible={isSidebarVisible} />} />
            <Route path="/medical-records" element={<DoctorMedicalRecords isSidebarVisible={isSidebarVisible} />} />
            <Route path="/profilePatient" element={<ProfilePatient isSidebarVisible={isSidebarVisible} />} />
            <Route path="/patient-record" element={<PatientPrescription isSidebarVisible={isSidebarVisible} />} />
            <Route path="/Doctor_appointment" element={<AppointmentManagementCard isSidebarVisible={isSidebarVisible} />} />
            <Route path="/appointment_BookingPatient" element={<AppointmentBookingPatient isSidebarVisible={isSidebarVisible} />} />
            {/* <Route path="/helpdesk" element={<HelpDesk isSidebarVisible={isSidebarVisible} />} /> */}
            <Route path="/helpdesk" element={<HelpDesk isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />} />


          </Routes>
        </div>
      </LocalizationProvider>
    </AuthProvider>
  );
};

export default App;
