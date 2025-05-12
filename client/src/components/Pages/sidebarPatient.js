import React from "react";
import "./sidebarPatient.css";
import NavIcon from "../../assets/images/nav_icon.png";
import Logo from "../../assets/images/CT_logo.png";
import LogoutIcon from "../../assets/images/logout.png";
import { Link } from "react-router-dom"; // Import Link for navigation

const SidebarPatient = ({ isSidebarVisible, toggleSidebar }) => {
    return (
        <>
            {/* Sidebar Toggle Button */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <img src={NavIcon} alt="Toggle Sidebar" />
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarVisible ? "visible" : "hidden"}`}>
                <div className="sidebar-logo">
                    <img src={Logo} alt="CareTransact Logo" className="logo" />
                    <h4>CareTransact</h4>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/profilePatient">Home</Link></li>
                    <li><Link to="/appointment_BookingPatient">Appointment Booking</Link></li>
                    <li><Link to="/patient-record">Prescriptions</Link></li>
                    <li className="logout">
                        <Link to="/landingpage">
                            <img src={LogoutIcon} alt="Logout" className="logout-icon" /> <b>Logout</b>
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default SidebarPatient;
