import React, { useState, useEffect } from "react";
import "./appointment_BookingPatient.css";
import axios from "axios";
import defaultimg from "../../assets/images/image.jpg"
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import bg from "../../assets/images/patinet_bg.avif"
import "react-toastify/dist/ReactToastify.css"; // Import CSS for the toasts
import {
    Calendar,
    Clock,
    User,
} from "lucide-react";
let globalAppointments = [];


const AppointmentBookingPatient = ({ isSidebarVisible }) => {
    const { email } = useAuth();
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [activeView, setActiveView] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorEmails, setSelectedDoctorEmails] = useState([]);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const storedActiveView = localStorage.getItem("activeView");
        if (storedActiveView) {
            setActiveView(storedActiveView);
            localStorage.removeItem("activeView"); // Clear it after using
        }
    }, []);

    // Replace the duplicate fetchFutureAppointments functions with this single one
    useEffect(() => {
        const fetchFutureAppointments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/get-future-pending-and-confirm", {
                    params: { email },
                });

                // Make sure we're only getting appointments that belong to the current patient
                const patientAppointments = response.data.filter(
                    appointment => appointment.patientEmail === email &&
                        ["Pending", "Confirmed"].includes(appointment.status)
                );

                setAppointments(patientAppointments);
            } catch (error) {
                console.error("Error fetching future appointments:", error.response?.data || error.message);
                toast.error("Failed to fetch future appointments.");
            }
        };

        if (activeView === "futureAppointments" && email) {
            fetchFutureAppointments();
        }
    }, [activeView, email]);


    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/get-available-slots");
                const availableAppointments = response.data;

                const emails = availableAppointments.map((appointment) => appointment.doctorEmail);
                setSelectedDoctorEmails([...new Set(emails)]); // Ensure unique emails
                setAppointments(availableAppointments);
            } catch (error) {
                console.error("Error fetching appointments:", error.response?.data || error.message);
                toast.error("Failed to fetch appointments.");
            }
        };


        fetchAppointments();
    }, []);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const promises = selectedDoctorEmails.map((email) =>
                    axios.get(`http://localhost:5000/api/auth/doctor-details`, {
                        params: { email },
                    })
                );

                const responses = await Promise.all(promises);
                const doctorData = responses.map((res) => res.data);
                setDoctors(doctorData);
            } catch (error) {
                console.error("Error fetching doctors:", error);
                toast.error("Failed to load doctor data.");
            }
        };

        if (selectedDoctorEmails.length > 0) {
            fetchDoctors();
        }
    }, [selectedDoctorEmails]);

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/cancel-appointment", {
                appointmentId,
            });

            // Show success message if cancellation is successful
            toast.success(response.data.message);

            // Remove the canceled appointment from the state
            setAppointments((prevAppointments) =>
                prevAppointments.filter((appt) => appt._id !== appointmentId)
            );
        } catch (error) {
            console.error("Error cancelling appointment:", error.response?.data || error.message);
            toast.error("Error cancelling appointment:" || error.response?.data || error.message);

            // Show error message if within 24-hour window or other issues
            toast.error(error.response?.data?.error || "Failed to cancel appointment.");
        }
    };


    const handleBookAppointment = async () => {
        setShowPopup(false); // Close the popup
        setShowModal(false); // Close the modal if needed
        if (selectedSlot === null) {
            toast.error("Please select a slot to book an appointment.");
            return;
        }

        const slot = appointments[selectedSlot];

        try {
            // Step 1: Fetch patient details by email
            const patientResponse = await axios.get("http://localhost:5000/api/auth/patient-details", {
                params: { email }, // Use patient email from AuthContext
            });

            const patientName = patientResponse.data.name;
            if (!patientName) {
                toast.error("Patient name not found. Please ensure your profile is complete.");
                return;
            }

            // Step 2: Book the appointment
            const response = await axios.post("http://localhost:5000/api/auth/book-appointment", {
                doctorEmail: slot.doctorEmail,
                date: slot.date,
                startTime: slot.startTime,
                patientEmail: email,
                patientName, // Use the fetched patient name
            });

            toast.success(response.data.message);

            // Update the appointments to reflect the booked slot
            setAppointments((prevAppointments) =>
                prevAppointments.map((appt, index) =>
                    index === selectedSlot ? { ...appt, status: "Pending" } : appt
                )
            );

            setShowPopup(false); // Close the popup
        } catch (error) {
            console.error("Error booking appointment:", error.response?.data || error.message);
            toast.error("Failed to book the appointment.");
        }
    };
    const handleRescheduleAppointment = async (appointmentId) => {
        try {
            const response = await axios.post("http://localhost:5000/api/auth/reschedule-appointment", {
                currentAppointmentId: appointmentId,
            });

            // Show success message
            toast.success(response.data.message);

            // Update the state of appointments
            setAppointments((prevAppointments) =>
                prevAppointments.map((appt) =>
                    appt._id === appointmentId
                        ? { ...appt, status: "Available", patientName: null, patientEmail: null }
                        : appt
                )
            );

            // Save active view and reload the page
            localStorage.setItem("activeView", "bookAppointment");
            window.location.reload();
        } catch (error) {
            // Handle errors and show appropriate messages
            console.error("Error rescheduling appointment:", error.response?.data || error.message);
            toast.error(error.response?.data?.error || "Failed to reschedule appointment.");
        }
    };





    const handleDoctorClick = async (doctor) => {
        try {
            // Step 1: Fetch doctor's email using the find-doctor-email endpoint
            const emailResponse = await axios.get("http://localhost:5000/api/auth/find-doctor-email", {
                params: {
                    name: doctor.name,
                    specialization: doctor.specialization,
                    gender: doctor.gender,
                    yearOfExperience: doctor.yearOfExperience,
                },
            });

            const email = emailResponse.data.email; // Resolve email
            if (!email) {
                toast.error(`Email not found for ${doctor.name}`);
                return;
            }

            // Step 2: Fetch available slots using resolved email
            const response = await axios.get("http://localhost:5000/api/auth/get-data-ofslots", {
                params: { doctorEmail: email }, // Use resolved email
            });

            const availableSlots = response.data;

            if (availableSlots && availableSlots.length > 0) {
                toast.success(`Available slots found for ${doctor.name}`);
                globalAppointments = availableSlots; // Update the global variable
                setAppointments(globalAppointments); // Update the state for UI
                setShowPopup(true); // Show the popup

                const slotDetails = availableSlots
                    .map(slot => `Date: ${new Date(slot.date).toLocaleDateString()}, Time: ${slot.startTime} - ${slot.endTime}`)
                    .join('\n');
            } else {
                toast.info(`No available slots for ${doctor.name}`);
                globalAppointments = []; // Clear the global variable if no slots
                setAppointments([]); // Clear the state for UI
            }
        } catch (error) {
            console.error("Error handling doctor click:", error.response?.data || error.message);
            toast.error("Failed to fetch details for the selected doctor.");
        }
    };




    const renderContent = () => {
        switch (activeView) {
            case "futureAppointments":
                return (
                    <div className="card-container">
                        <div className="card future-appointments-card">
                            <div className="card-header">
                                <h2>Future Appointments</h2>
                            </div>
                            <div className="card-body">
                                <div className="appointments-container">
                                    {appointments.length > 0 ? (
                                        appointments.map((appointment) => (
                                            <div
                                                key={appointment._id}
                                                className="appointment-card"
                                                onClick={() => {
                                                    setSelectedAppointment(appointment); // Set the selected appointment
                                                    setShowModal(true); // Show the modal
                                                }}
                                            >
                                                <h3>{appointment.doctorName}</h3>
                                                <p>{new Date(appointment.date).toLocaleDateString()} - {appointment.startTime}</p>
                                                <p>Status: <strong>{appointment.status}</strong></p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No future appointments found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );


            case "bookAppointment":
                const filteredDoctors = doctors.filter((doctor) => {
                    const matchesName = searchQuery
                        ? doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
                        : true;
                    const matchesGender = selectedGender
                        ? doctor.gender === selectedGender
                        : true;
                    const matchesSpecialization = selectedSpecialization
                        ? doctor.specialization.toLowerCase() === selectedSpecialization.toLowerCase()
                        : true;

                    return matchesName && matchesGender && matchesSpecialization;
                });

                return (
                    <div className="card-container">
                        <div className="card book-appointment-card">
                            <div className="card-header">
                                <h2>Book New Appointment</h2>
                            </div>
                            <div className="card-body">
                                {/* Search and Filter Section */}
                                <div className="filter-container">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="filter-input"
                                    />
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Specializations</option>
                                        {Array.from(
                                            new Set(doctors.map((doc) => doc.specialization))
                                        ).map((specialization) => (
                                            <option key={specialization} value={specialization}>
                                                {specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctors Grid */}
                                <div className="doctors-grid">
                                    {filteredDoctors.map((doctor) => (
                                        <div
                                            key={doctor._id}
                                            className="doctor-card"
                                            onClick={() => handleDoctorClick(doctor)} // Attach the click handler
                                        >
                                            <div className="doctor-header">
                                                <img
                                                    src={doctor.profilePicture || defaultimg}
                                                    alt={doctor.name || "Doctor Image"}
                                                    className="doctor-image"
                                                />
                                                <div className="doctor-info">
                                                    <h3>{doctor.name}</h3>
                                                    <p>{doctor.specialization}</p>
                                                </div>
                                            </div>
                                            <div className="doctor-details">
                                                <div className="detail-item">
                                                    <span>Experience:</span>
                                                    <strong>{doctor.yearOfExperience} years</strong>
                                                </div>
                                                <div className="detail-item">
                                                    <span>Consultation Fee:</span>
                                                    <strong>₹{doctor.consultationFee}</strong>
                                                </div>
                                                {doctor.services && doctor.services.length > 0 && (
                                                    <div className="detail-item">
                                                        <span>Services:</span>
                                                        <strong>{doctor.services.join(", ")}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {selectedDoctor && appointments.length > 0 && (
                                    <div className="appointment-slots">
                                        <h3>Available Slots for {selectedDoctor.name}</h3>
                                        <ul>
                                            {appointments.map((slot, index) => (
                                                <li key={`${slot.date}-${slot.startTime}-${index}`}>
                                                    <strong>Date:</strong> {new Date(slot.date).toLocaleDateString()} <br />
                                                    <strong>Time:</strong> {slot.startTime} - {slot.endTime}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="card-container">
                        <div className="card welcome-card">
                            <div className="card-header">
                                <h1>Appointment Management</h1>
                            </div>
                            <div className="card-body">
                                <p>View Future Appointments or Book a New Appointment</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className={`doc-home-container ${isSidebarVisible ? "" : "sidebar-hidden"}`}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="main-content">
                <ToastContainer
                    position="top-right" // Position at the top-right
                    autoClose={8000} // Toast stays for 8 seconds
                    closeOnClick={false} // Clicking on the toast does not close it
                    hideProgressBar={false} // Show the progress bar
                    newestOnTop={true} // Display the newest toast on top
                    draggable={true} // Allow dragging to close the toast
                    closeButton // Show a close button
                    pauseOnHover={true} // Pause timeout on hover
                />
                <div className="action-buttons">
                    <button
                        className={`action-btn ${activeView === "futureAppointments" ? "active" : ""}`}
                        onClick={() => setActiveView("futureAppointments")}
                    >
                        Future Appointments
                    </button>
                    <button
                        className={`action-btn ${activeView === "bookAppointment" ? "active" : ""}`}
                        onClick={() => setActiveView("bookAppointment")}
                    >
                        Book Appointment
                    </button>
                </div>

                {activeView === "bookAppointment" ? (
                    <div className="card-container">
                        <div className="card book-appointment-card">
                            <div className="card-header">
                                <h2>Book New Appointment</h2>
                            </div>
                            <div className="card-body">
                                {/* Search and Filter Section */}
                                <div className="filter-container">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="filter-input"
                                    />
                                    <select
                                        value={selectedGender}
                                        onChange={(e) => setSelectedGender(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Genders</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <select
                                        value={selectedSpecialization}
                                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Specializations</option>
                                        {Array.from(
                                            new Set(doctors.map((doc) => doc.specialization))
                                        ).map((specialization) => (
                                            <option key={specialization} value={specialization}>
                                                {specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Doctors Grid */}
                                <div className="doctors-grid" >
                                    {doctors
                                        .filter((doctor) => {
                                            const matchesName = searchQuery
                                                ? doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
                                                : true;
                                            const matchesGender = selectedGender
                                                ? doctor.gender === selectedGender
                                                : true;
                                            const matchesSpecialization = selectedSpecialization
                                                ? doctor.specialization.toLowerCase() === selectedSpecialization.toLowerCase()
                                                : true;

                                            return matchesName && matchesGender && matchesSpecialization;
                                        })
                                        .map((doctor) => (
                                            <div
                                                key={doctor._id}
                                                className="doctor-card"
                                                onClick={() => handleDoctorClick(doctor)}
                                            >
                                                <div className="doctor-header">
                                                    <img
                                                        src={doctor.profilePicture || defaultimg}
                                                        alt={doctor.name || "Doctor Image"}
                                                        className="doctor-image"
                                                    />
                                                    <div className="doctor-info">
                                                        <h3>{doctor.name}</h3>
                                                        <p>{doctor.specialization}</p>
                                                    </div>
                                                </div>
                                                <div className="doctor-details">
                                                    <div className="detail-item">
                                                        <span>Experience:</span>
                                                        <strong>{doctor.yearOfExperience} years</strong>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span>Consultation Fee:</span>
                                                        <strong>₹{doctor.consultationFee}</strong>
                                                    </div>
                                                    {doctor.services && doctor.services.length > 0 && (
                                                        <div className="detail-item">
                                                            <span>Services:</span>
                                                            <strong>{doctor.services.join(', ')}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="content">{renderContent()}</div>
                )}
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-card">
                            <button className="close-button" onClick={() => setShowPopup(false)}>×</button>
                            <h2>Available Slots</h2>
                            <ul className="appointment-list">
                                {appointments.map((slot, index) => (
                                    <li
                                        key={index}
                                        className={`appointment-item ${selectedSlot === index ? "selected" : ""}`}
                                        onClick={() => setSelectedSlot(index)}
                                    >
                                        Date: {new Date(slot.date).toLocaleDateString()}, Time: {slot.startTime} - {slot.endTime}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="book-appointment-btn"
                                disabled={selectedSlot === null}
                                onClick={() => {
                                    handleBookAppointment(); // Book the appointment
                                    setShowPopup(false); // Close the popup after booking
                                    toast.success("Your appointment has been booked successfully!")// Show success message
                                    setTimeout(() => {
                                        window.location.reload(); // Refresh the page after booking
                                    }, 500); // Add a short delay to ensure the booking process completes
                                }}
                            >
                                Book Appointment
                            </button>



                        </div>
                    </div>
                )}



                {/* Enhanced Appointment Details Modal */}
                {showModal && selectedAppointment && (
                    <div className="appointment-modal-overlay"
                        onClick={(e) => {
                            console.log("Overlay clicked"); // Debugging log
                            setShowModal(false); // Close the modal
                            setSelectedAppointment(null);
                        }}
                    >
                        <div
                            className="appointment-modal"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent click from propagating to the overlay
                                console.log("Modal content clicked"); // Debugging log
                            }}
                        >
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h2>Appointment Details</h2>
                                    <span className={`status ${selectedAppointment.status.toLowerCase()}`}>
                                        {selectedAppointment.status}
                                    </span>
                                </div>
                                <div className="modal-body">
                                    <div className="modal-detail">
                                        <User className="modal-icon" />
                                        <div>
                                            <h3>{selectedAppointment.doctorName}</h3>
                                            <p>{selectedAppointment.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Calendar className="modal-icon" />
                                        <div>
                                            <h3>Date</h3>
                                            <p>{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="modal-detail">
                                        <Clock className="modal-icon" />
                                        <div>
                                            <h3>Time</h3>
                                            <p>{selectedAppointment.startTime}</p>
                                        </div>
                                    </div>
                                    <div className="modal-additional-info">
                                        <div className="additional-info-item">
                                            <span>Consultation Fee:</span>
                                            <strong>₹{selectedAppointment.consultationFee}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button
                                        className="modal-action-btn"
                                        onClick={() => {
                                            handleRescheduleAppointment(selectedAppointment._id);
                                        }}
                                    >
                                        Reschedule
                                    </button>


                                    <button
                                        className="modal-action-btn danger"
                                        onClick={() => {
                                            handleCancelAppointment(selectedAppointment._id);
                                            setTimeout(() => {
                                                window.location.reload(); // Refresh the page after the operation
                                            }, 500);
                                        }}
                                    >
                                        Cancel Appointment
                                    </button>


                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default AppointmentBookingPatient;