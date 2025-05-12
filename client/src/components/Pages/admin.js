import React, { useState, useEffect } from 'react';
import './admin.css';
import { FaUserMd, FaUser, FaPrescriptionBottleAlt, FaFlask, FaBell, FaFileInvoiceDollar, FaTrash, FaEdit, FaPlus, FaSearch, FaCheckCircle, FaTimes, FaEyeSlash, FaEye, FaBuilding, FaBoxOpen } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
    // State for different user types
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [pharmacists, setPharmacists] = useState([]);
    const [labAttendees, setLabAttendees] = useState([]);
    // State for UI control
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedUserType, setSelectedUserType] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUsersPopup, setShowUsersPopup] = useState(false);
    const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [selectedEntity, setSelectedEntity] = useState(null); // Stores the clicked entity type
    const [adminPassword, setAdminPassword] = useState('');
    const [userData, setUserData] = useState([]);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [regnumber, setregnumber] = useState("");
    const [contact, setcontact] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showAddUserPopup, setShowAddUserPopup] = useState(false);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null); // Stores user details
    const [showUserInfoPopup, setShowUserInfoPopup] = useState(false); // Controls user details popup
    const [appointments, setAppointments] = useState([]);
    const [totalClaims, setTotalClaims] = useState(0);
    const [pendingClaims, setPendingClaims] = useState(0);
    const [processingClaims, setProcessingClaims] = useState(0);
    const [processedClaims, setProcessedClaims] = useState(0);
    const [claims, setClaims] = useState([]);
    const [showClaimDetails, setShowClaimDetails] = useState(null);




    const handleRowClick = async (id) => {
        if (!selectedEntity) {
            console.error("No entity selected.");
            return;
        }

        try {
            // Simulating API call to fetch user details
            const response = await axios.get(`http://localhost:5000/api/auth/user-details/${selectedEntity}/${id}`);

            setSelectedUserDetails(response.data); // Store user details
            console.log(response.data);
            setShowUserInfoPopup(true); // Show the user details popup
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };



    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(pk|com|org|edu|gov|mil)$/;
    const handleAddUserClick = () => {
        setShowAddUserPopup(true);
    };

    const handleAddUser = async () => {
        // ✅ General email validation
        if (!emailRegex.test(email)) {
            alert("Invalid email format. Please enter a valid email.");
            return;
        }

        // ✅ General password validation
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (!/\d/.test(password)) {
            alert("Password must contain at least one number.");
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            alert("Password must contain at least one special character.");
            return;
        }

        // ✅ Ensure required fields for insurance company
        if (selectedEntity === "insuranceCompany") {
            if (!name || !name.trim()) {
                alert("Insurance Company Name is required.");
                return;
            }

            if (!contact.trim()) {
                alert("Contact Number is required.");
                return;
            }

            if (!regnumber.trim()) {
                alert("Registration Number is required.");
                return;
            }

            // ✅ Contact number validation (PTCL: 10 digits, Mobile: 11 digits)
            if (!/^\d{10,11}$/.test(contact)) {
                alert("Invalid contact number. It must be either 10 digits (PTCL) or 11 digits (mobile).");
                return;
            }

            // ✅ Registration number validation (Alphanumeric with dashes allowed)
            if (!/^[A-Za-z0-9\-]+$/.test(regnumber)) {
                alert("Invalid registration number format. Use only letters, numbers, and dashes.");
                return;
            }
        }

        console.log("Adding user:", { email, password, entity: selectedEntity, name, contact, regnumber });

        try {
            // ✅ Send request to backend API
            const response = await fetch("http://localhost:5000/api/auth/add-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    entity: selectedEntity,
                    name,
                    contact,
                    regnumber
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("User added successfully!");
                window.location.reload();
            } else {
                toast.error(`Failed to add user: ${data.error}`);
            }
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error("An error occurred while adding the user.");
        }

        // ✅ Reset fields
        setShowAddUserPopup(false);
        setEmail("");
        setPassword("");
        setName("");
        setcontact("");
        setregnumber("");
    };


    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'patient',
        specialization: '',
        address: ''
    });
    const [doctorCount, setDoctorCount] = useState(0);
    const [patientCount, setPatientCount] = useState(0);
    const [labAttendeeCount, setLabAttendeeCount] = useState(0);
    const [pharmacistCount, setPharmacistCount] = useState(0);
    const [insuranceCompanyCount, setInsuranceCompanyCount] = useState(0);

    const [appointmentCount, setAppointmentCount] = useState(0);
    const [availableCount, setAvailableCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);

    //fetching users count
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/user-counts');
                setDoctorCount(response.data.doctorCount);
                setPatientCount(response.data.patientCount);
                setLabAttendeeCount(response.data.labAttendeeCount);
                setPharmacistCount(response.data.pharmacistCount);
                setInsuranceCompanyCount(response.data.insuranceCompanyCount);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCounts();
    }, []);
    //fetching appointment count
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth//getAppointmentCount');
                setAppointmentCount(response.data.appointmentCount);
                setAvailableCount(response.data.availableCount);
                setPendingCount(response.data.pendingCount);
                setConfirmedCount(response.data.confirmedCount);
            } catch (err) {
                console.error('Error fetching appointment counts:', err);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/auth/appointments/confirmed"); // Adjust API path if needed
                const data = await response.json();
                setAppointments(data);
            } catch (error) {
                console.error("Error fetching confirmed appointments:", error);
            }
        };

        fetchAppointments();
    }, []);
    useEffect(() => {
        fetch("http://localhost:5000/api/auth/claims/stats")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Claim stats received:", data); // Debugging log
                setTotalClaims(data.total || 0);
                setPendingClaims(data.pending || 0);
                setProcessingClaims(data.processing || 0);
                setProcessedClaims(data.processed || 0);
            })
            .catch((error) => console.error("Error fetching claims stats:", error));
    }, []);

    const handleAcceptClaim = async (claimId) => {
        try {
            // Send update request to backend
            await axios.put(`http://localhost:5000/api/auth/claims/update-status/${claimId}`, { claimStatus: "sent" });

            // Update UI immediately
            setClaims((prevClaims) =>
                prevClaims.map((claim) =>
                    claim._id === claimId ? { ...claim, claimStatus: "sent" } : claim
                )
            );

            // Also update popup details if it's open
            setShowClaimDetails((prevDetails) =>
                prevDetails ? { ...prevDetails, claimStatus: "sent" } : prevDetails
            );

        } catch (error) {
            console.error("Error updating claim status:", error);
            toast.error("Failed to update claim status");
        }
    };

    const fetchClaims = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/auth/claims");
            setClaims(response.data);
        } catch (error) {
            console.error("Error fetching claims:", error);
        }
    };
    useEffect(() => {
        fetchClaims();
    }, []);
    // Filter users based on search query
    const filteredUsers = users.filter(user => {
        if (selectedUserType !== 'all' && user.type !== selectedUserType) return false;
        if (searchQuery) {
            return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });
    // Handle removing user
    const handleRemoveUser = (userId) => {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        // Update appropriate user type list
        setDoctors(doctors.filter(doctor => doctor.id !== userId));
        setPatients(patients.filter(patient => patient.id !== userId));
        setPharmacists(pharmacists.filter(pharmacist => pharmacist.id !== userId));
        setLabAttendees(labAttendees.filter(attendee => attendee.id !== userId));
    };
    const openUserDetailsPopup = (userType) => {
        setSelectedUserType(userType);
        setShowUserDetailsPopup(true);
    };
    const getDummyUserData = (userType) => {
        if (userType === "doctors") {
            return [
                { id: "D001", name: "Dr. Ahmed", qualification: "MBBS, FCPS" },
                { id: "D002", name: "Dr. Fatima", qualification: "MD, PhD" },
                { id: "D003", name: "Dr. Ali", qualification: "MBBS, MS" }
            ];
        } else if (userType === "labAttendees") {
            return [
                { id: "L001", name: "Usman Tariq" },
                { id: "L002", name: "Sarah Khan" },
                { id: "L003", name: "Bilal Ahmed" }
            ];
        } else if (userType === "pharmacists") {
            return [
                { id: "P001", name: "Ayesha Malik" },
                { id: "P002", name: "Zain Ali" },
                { id: "P003", name: "Hina Khan" }
            ];
        }
        return [];
    };
    // Handle viewing user profile
    const handleViewProfile = (user) => {
        setSelectedUser(user);
        setActiveTab('profile');
    };
    // Handle processing claim
    const handleProcessClaim = (claim) => {
        setSelectedClaim(claim);
        setShowClaimModal(true);
    };
    // Handle completing claim processing
    const handleCompleteClaim = () => {
        // In a real app, you would update the claim status in the backend
        setShowClaimModal(false);
        // Refresh data after processing
        setPendingClaims(pendingClaims - 1);
    };
    // Determine icon based on user type
    const getUserIcon = (type) => {
        switch (type) {
            case 'doctor': return <FaUserMd />;
            case 'patient': return <FaUser />;
            case 'pharmacist': return <FaPrescriptionBottleAlt />;
            case 'labAttendee': return <FaFlask />;
            default: return <FaUser />;
        }
    };
    const handleDeleteUser = async (id, role) => {
        try {
            // Convert frontend entity name to backend role
            const roleMapping = {
                doctors: "doctor",
                patients: "patient",
                labAttendees: "lab_attendee",
                pharmacists: "pharmacist",
                insuranceCompany: "insuranceCompany"
            };

            const mappedRole = roleMapping[role]; // Get correct role for API
            if (!mappedRole) {
                console.error("Invalid role:", role);
                toast.error("Invalid user type");
                return;
            }

            const response = await axios.delete(`http://localhost:5000/api/auth/remove-user/${id}/${mappedRole}`);
            console.log(response.data);
            toast.success(`${mappedRole} deleted successfully`);

            // Update UI: Remove the deleted user from the table
            setUserData(prevData => prevData.filter(user => user.id !== id));
            window.location.reload();

        } catch (error) {
            console.error("Error deleting user:", error.response?.data || error.message);
            toast.error("Failed to delete user");
        }
    };





    const openPasswordPopup = (entityType) => {
        setSelectedEntity(entityType); // ✅ Store the selected entity
        setEnteredPassword(""); // ✅ Clear the input field when opening
        setPasswordError(""); // ✅ Reset any error message
        setShowPasswordPopup(true); // ✅ Show the password popup
    };
    useEffect(() => {
        if (!selectedEntity) return;

        const fetchUsers = async () => {
            try {
                let response = await axios.get(`http://localhost:5000/api/auth/get-users?type=${selectedEntity}`);
                setUserData(response.data); // Update state with fetched data
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [selectedEntity]); // Runs when selectedEntity changes

    useEffect(() => {
        const fetchAdminPassword = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/admin-password');
                setAdminPassword(response.data.password); // Store password in state
            } catch (err) {
                console.error("Error fetching admin password:", err);
            }
        };

        fetchAdminPassword();
    }, []);

    const handleLogin = (enteredPassword) => {
        if (enteredPassword === adminPassword) {
            console.log("Admin login successful");
        } else {
            console.log("Incorrect password");
        }
    };

    const verifyPassword = () => {
        const correctPassword = "admin123"; // ✅ Fixed password for now

        if (enteredPassword === correctPassword) {
            setShowPasswordPopup(false); // ✅ Close the password popup
            setShowUserDetailsPopup(true); // ✅ Open the details popup
        } else {
            setPasswordError("Incorrect password. Please try again."); // ✅ Show error message
        }
    };

    // Render dashboard content
    const renderDashboard = () => (
        <div className="dashboard-content">
            <div className="metrics-grid">
                <div
                    className="metric-card"
                    onClick={() => setShowUsersPopup(true)}
                    style={{ cursor: "pointer" }}
                >
                    <h3>Total Users</h3>
                    <div className="metric-value">{doctorCount + patientCount + pharmacistCount + labAttendeeCount + insuranceCompanyCount}</div>
                    <div className="metric-breakdown">
                        <span><FaUserMd /> Doctors: {doctorCount}</span>
                        <span><FaUser /> Patients: {patientCount}</span>
                        <span><FaPrescriptionBottleAlt /> Pharmacists: {pharmacistCount}</span>
                        <span><FaFlask /> Lab Attendees: {labAttendeeCount}</span>
                        <span><FaBuilding /> Insurance Companies: {insuranceCompanyCount}</span>
                    </div>
                </div>

                <div className="metric-card">
                    <h3>Appointments</h3>
                    <div className="metric-value">{appointmentCount}</div>
                    <div className="metric-breakdown">
                        <span><FaBell /> Pending: {pendingCount}</span>
                        <span><FaCheckCircle />Confirmed: {confirmedCount}</span>
                        <span><FaBoxOpen />Availbale: {availableCount}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <h3>Claims</h3>
                    <div className="metric-value">{totalClaims}</div>
                    <div className="metric-breakdown">
                        <span><FaFileInvoiceDollar /> Pending: {pendingClaims}</span>
                        <span>Processing: {processingClaims}</span>
                        <span>Processed: {processedClaims}</span>
                    </div>
                </div>
            </div>
            {/*future appointments table*/}
            <div className="recent-section">
                <h3>Future Appointments</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patientName}</td>
                                    <td>{appointment.doctorName}</td>
                                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                                    <td>{appointment.startTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="recent-section">
                <h3>Claims</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Provider</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map((claim) => (
                                <tr
                                    key={claim._id}
                                    onClick={() => setShowClaimDetails(claim)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{claim.patientName}</td>
                                    <td>{claim.doctorName}</td>
                                    <td>{new Date(claim.consultancyDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${claim.claimStatus}`}>
                                            {claim.claimStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showUsersPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <FaTimes className="close-icon" onClick={() => setShowUsersPopup(false)} />
                                <h2>User Breakdown</h2>
                                <table className="users-table">
                                    <tbody>
                                        <tr onClick={() => openPasswordPopup("doctors")} style={{ cursor: "pointer" }}>
                                            <td>Doctors</td>
                                            <td>{doctorCount}</td>
                                        </tr>
                                        <tr onClick={() => openPasswordPopup("patients")} style={{ cursor: "pointer" }}>
                                            <td>Patients</td>
                                            <td>{patientCount}</td>
                                        </tr>
                                        <tr onClick={() => openPasswordPopup("labAttendees")} style={{ cursor: "pointer" }}>
                                            <td>Lab Attendees</td>
                                            <td>{labAttendeeCount}</td>
                                        </tr>
                                        <tr onClick={() => openPasswordPopup("pharmacists")} style={{ cursor: "pointer" }}>
                                            <td>Pharmacists</td>
                                            <td>{pharmacistCount}</td>
                                        </tr>
                                        <tr onClick={() => openPasswordPopup("insuranceCompany")} style={{ cursor: "pointer" }}>
                                            <td>Insurance Company</td>
                                            <td>{insuranceCompanyCount}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {showUserDetailsPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <FaTimes className="close-icon" onClick={() => setShowUserDetailsPopup(false)} />
                                <h2>
                                    {selectedEntity === "doctors" ? "Doctors List" :
                                        selectedEntity === "patients" ? "Patients List" :
                                            selectedEntity === "labAttendees" ? "Lab Attendees List" :
                                                selectedEntity === "pharmacists" ? "Pharmacists List" :
                                                    selectedEntity === "insuranceCompany" ? "insuranceCompany List" :
                                                        "User List"}
                                </h2>
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            {/* <th>ID</th> */}
                                            <th>Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userData.map(user => (
                                            <tr key={user.id} onClick={() => handleRowClick(user.id)}>
                                                {/* <td>{user.id}</td> */}
                                                <td>{user.name}</td>
                                                <td>
                                                    <FaTrash
                                                        className="delete-icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteUser(user.id, selectedEntity); // Pass the entity type
                                                        }}
                                                    />

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Add User Button */}
                                {selectedEntity !== "patients" &&
                                    ((selectedEntity !== "labAttendees" || labAttendeeCount === 0) &&
                                        (selectedEntity !== "pharmacists" || pharmacistCount === 0)) && (
                                        <button onClick={() => setShowAddUserPopup(true)} className="add-user-button">
                                            Add {selectedEntity}
                                        </button>
                                    )}
                            </div>
                        </div>
                    )}

                    {showUserInfoPopup && selectedUserDetails && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <FaTimes className="close-icon" onClick={() => setShowUserInfoPopup(false)} />
                                <h2>User Details</h2>
                                <table className="user-details-table">
                                    <tbody>
                                        <tr>
                                            <td><strong>Name:</strong></td>
                                            <td>{selectedUserDetails.name}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Email:</strong></td>
                                            <td>{selectedUserDetails.email}</td>
                                        </tr>
                                        {selectedEntity === "doctors" && (
                                            <>
                                                <tr>
                                                    <td><strong>Gender:</strong></td>
                                                    <td>{selectedUserDetails.gender}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Specialization:</strong></td>
                                                    <td>{selectedUserDetails.specialization}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Experience:</strong></td>
                                                    <td>{selectedUserDetails.yearOfExperience} years</td>
                                                </tr>
                                            </>
                                        )}
                                        {selectedEntity === "patients" && (
                                            <>
                                                <tr>
                                                    <td><strong>Gender:</strong></td>
                                                    <td>{selectedUserDetails.gender}</td>
                                                </tr>

                                            </>
                                        )}
                                        {selectedEntity === "insuranceCompany" && (
                                            <>
                                                <tr>
                                                    <td><strong>RegistrationNumber:</strong></td>
                                                    <td>{selectedUserDetails.registrationNumber}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>contactNumber:</strong></td>
                                                    <td>{selectedUserDetails.contactNumber}</td>
                                                </tr>

                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {showAddUserPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <FaTimes className="close-icon" onClick={() => setShowAddUserPopup(false)} />
                                <h2>Add {selectedEntity}</h2>

                                {/* Email Field */}
                                <input
                                    type="text"
                                    placeholder="Enter Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                />

                                {/* Name Field (Only for labAttendees & pharmacists) */}
                                {(selectedEntity === "labAttendees" || selectedEntity === "pharmacists" || selectedEntity === "insuranceCompany") && (
                                    <input
                                        type="text"
                                        placeholder="Enter Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-field"
                                    />
                                )}
                                {/*Fields (Only for insurance Company) */}
                                {(selectedEntity === "insuranceCompany") && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Enter Registration Number"
                                            value={regnumber}
                                            onChange={(e) => setregnumber(e.target.value)}
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Enter contact Number"
                                            value={contact}
                                            onChange={(e) => setcontact(e.target.value)}
                                            className="input-field"
                                        />
                                    </>
                                )}


                                {/* Password Field */}
                                <div className="password-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field"
                                    />
                                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>

                                <button
                                    onClick={handleAddUser}
                                    className={`add-user-button ${(!email || !password ||
                                        ((selectedEntity === "labAttendees" || selectedEntity === "pharmacists") && !name)) ? "disabled" : ""}`}
                                    disabled={
                                        !email || !password ||
                                        ((selectedEntity === "labAttendees" || selectedEntity === "pharmacists") && !name)
                                    }
                                >
                                    Add User
                                </button>


                            </div>
                        </div>
                    )}




                    {showPasswordPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <FaTimes className="close-icon" onClick={() => setShowPasswordPopup(false)} />
                                <h2>Admin Verification</h2>
                                <p>Please enter the admin password to continue:</p>
                                <input
                                    type="password"
                                    value={enteredPassword}
                                    onChange={(e) => setEnteredPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="password-input"
                                />
                                {passwordError && <p className="error-message">{passwordError}</p>}
                                <button className="confirm-button" onClick={verifyPassword}>Confirm</button>
                            </div>
                        </div>
                    )}



                    {showClaimDetails && (
                        <div className="popup-overlay">
                            <div className="popup claim-details-popup">
                                <FaTimes className="close" onClick={() => setShowClaimDetails(null)} />
                                <h2>Claim Details</h2>
                                <p><strong>Name:</strong> {showClaimDetails.patientName}</p>
                                <p><strong>Date:</strong> {new Date(showClaimDetails.consultancyDate).toLocaleDateString()}</p>
                                <p><strong>Provider:</strong> {showClaimDetails.doctorName}</p>

                                {/* Medicines Section */}
                                <strong>Medicines</strong>
                                <div className="details-table">
                                    {showClaimDetails.medicines?.length > 0 ? (
                                        showClaimDetails.medicines.map((med, index) => (
                                            <div key={index} className="table-row">
                                                <span>{med.name}</span>
                                                <span>{med.fee} PKR</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No medicines provided</p>
                                    )}
                                </div>

                                {/* Tests Section */}
                                <strong>Medical Tests</strong>
                                <div className="details-table">
                                    {showClaimDetails.labTests?.length > 0 ? (
                                        showClaimDetails.labTests.map((test, index) => (
                                            <div key={index} className="table-row">
                                                <span>{test.testName}</span>
                                                <span>{test.testFee} PKR</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No tests conducted</p>
                                    )}
                                </div>

                                {/* Total Cost */}
                                <h3><strong>Total Amount:</strong> {showClaimDetails.totalAmount} PKR</h3>

                                {showClaimDetails.claimStatus !== "Approved" && (
                                    <button
                                        className="accept-btn"
                                        onClick={() => handleAcceptClaim(showClaimDetails._id)}
                                        disabled={showClaimDetails.claimStatus === "sent"}
                                    >
                                        {showClaimDetails.claimStatus === "sent" ? "Sent" : "Accept"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
    // Render users management content
    const renderUsers = () => (
        <div className="users-content">
            <div className="users-header">
                <div className="filter-container">
                    <div className="search-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="user-type-filter">
                        <button
                            className={`filter-button ${selectedUserType === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedUserType('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-button ${selectedUserType === 'doctor' ? 'active' : ''}`}
                            onClick={() => setSelectedUserType('doctor')}
                        >
                            <FaUserMd /> Doctors
                        </button>
                        <button
                            className={`filter-button ${selectedUserType === 'patient' ? 'active' : ''}`}
                            onClick={() => setSelectedUserType('patient')}
                        >
                            <FaUser /> Patients
                        </button>
                        <button
                            className={`filter-button ${selectedUserType === 'pharmacist' ? 'active' : ''}`}
                            onClick={() => setSelectedUserType('pharmacist')}
                        >
                            <FaPrescriptionBottleAlt /> Pharmacists
                        </button>
                        <button
                            className={`filter-button ${selectedUserType === 'labAttendee' ? 'active' : ''}`}
                            onClick={() => setSelectedUserType('labAttendee')}
                        >
                            <FaFlask /> Lab Attendees
                        </button>
                    </div>
                </div>
                <button className="add-user-button" onClick={() => setShowUserModal(true)}>
                    <FaPlus /> Add User
                </button>
            </div>
            <div className="users-grid">
                {filteredUsers.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-card-header">
                            <div className="user-icon">
                                {getUserIcon(user.type)}
                            </div>
                            <div className="user-actions">
                                <button className="icon-button" onClick={() => handleViewProfile(user)}>
                                    <FaEdit />
                                </button>
                                <button className="icon-button delete" onClick={() => handleRemoveUser(user.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="user-card-body">
                            <h3>{user.name}</h3>
                            <div className="user-type">{user.type.charAt(0).toUpperCase() + user.type.slice(1)}</div>
                            {user.specialization && <div className="user-specialization">{user.specialization}</div>}
                            <div className="user-details">
                                <div className="user-detail"><strong>Email:</strong> {user.email}</div>
                                <div className="user-detail"><strong>Phone:</strong> {user.phone}</div>
                                {user.address && <div className="user-detail"><strong>Address:</strong> {user.address}</div>}
                            </div>
                            {(user.type === 'doctor' || user.type === 'patient') && (
                                <div className="user-stats">
                                    <div className="stat">
                                        <span className="stat-label">Appointments:</span>
                                        <span className="stat-value">{user.appointmentsCount}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Pending:</span>
                                        <span className="stat-value">{user.pendingAppointments}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="user-card-footer">
                            <button className="view-profile-button" onClick={() => handleViewProfile(user)}>
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Add/Edit User Modal */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New User</h2>
                            <button className="close-button" onClick={() => setShowUserModal(false)}>Ã—</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="Email Address"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div className="form-group">
                                <label>User Type</label>
                                <select
                                    value={newUser.type}
                                    onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="pharmacist">Pharmacist</option>
                                    <option value="labAttendee">Lab Attendee</option>
                                </select>
                            </div>
                            {newUser.type === 'doctor' && (
                                <div className="form-group">
                                    <label>Specialization</label>
                                    <input
                                        type="text"
                                        value={newUser.specialization}
                                        onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                                        placeholder="Medical Specialization"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    value={newUser.address}
                                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                                    placeholder="Address"
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowUserModal(false)}>Cancel</button>
                            <button className="save-button" onClick={handleAddUser}>Save User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    // Render claims management content
    const renderClaims = () => (
        <div className="claims-content">
            <h2>Claims Management</h2>
            <div className="filter-tabs">
                <button className={`filter-tab active`}>All Claims</button>
                <button className={`filter-tab`}>Pending</button>
                <button className={`filter-tab`}>Processed</button>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Provider</th>
                            <th>Date</th>
                            <th>Services</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map(claim => (
                            <tr
                                key={claim.id}
                                className={claim.status === 'pending' ? 'pending-row' : ''}
                                onClick={() => {
                                    // Set dummy claim details for the popup
                                    setShowClaimDetails({
                                        id: claim.id,
                                        name: claim.patientName,
                                        doctor: claim.providerName,
                                        date: claim.date,
                                        medicines: [
                                            { name: "Panadol", price: 200 },
                                            { name: "Antibiotic", price: 500 }
                                        ],
                                        tests: [
                                            { name: "Blood Test", price: 1500 }
                                        ]
                                    });
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <td>{claim.id}</td>
                                <td>{claim.patientName}</td>
                                <td>{claim.providerName}</td>
                                <td>{claim.date}</td>
                                <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                                <td>
                                    {claim.status === 'pending' && (
                                        <button
                                            className="action-button process-button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents row click event from triggering
                                                handleProcessClaim(claim);
                                            }}
                                        >
                                            Process
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
                {showClaimDetails && (
                    <div className="popup-overlay">
                        <div className="popup claim-details-popup">
                            <FaTimes className="close" onClick={() => setShowClaimDetails(null)} />

                            <h2>Claim Details</h2>
                            <p><strong>ID:</strong> {showClaimDetails.id}</p>
                            <p><strong>Name:</strong> {showClaimDetails.name}</p>
                            <p><strong>Date:</strong> {showClaimDetails.date}</p>
                            <p><strong>Doctor:</strong> {showClaimDetails.doctor}</p>

                            {/* Medicines Section */}
                            <h3>Medicines</h3>
                            <div className="details-table">
                                {showClaimDetails.medicines.map((med, index) => (
                                    <div key={index} className="table-row">
                                        <span>{med.name}</span>
                                        <span>{med.price} PKR</span>
                                    </div>
                                ))}
                            </div>
                            <p><strong>Total Medicine Cost:</strong> {showClaimDetails.medicines.reduce((sum, med) => sum + med.price, 0)} PKR</p>

                            {/* Tests Section */}
                            <h3>Medical Tests</h3>
                            <div className="details-table">
                                {showClaimDetails.tests.map((test, index) => (
                                    <div key={index} className="table-row">
                                        <span>{test.name}</span>
                                        <span>{test.price} PKR</span>
                                    </div>
                                ))}
                            </div>
                            <p><strong>Total Test Cost:</strong> {showClaimDetails.tests.reduce((sum, test) => sum + test.price, 0)} PKR</p>

                            {/* Total Cost */}
                            <h3><strong>Total Combined Price:</strong> {showClaimDetails.medicines.reduce((sum, med) => sum + med.price, 0) + showClaimDetails.tests.reduce((sum, test) => sum + test.price, 0)} PKR</h3>

                            <button className="accept-btn">
                                <FaCheckCircle /> Accept
                            </button>
                        </div>
                    </div>
                )}

            </div>
            {/* Process Claim Modal */}
            {showClaimModal && selectedClaim && (
                <div className="modal-overlay">
                    <div className="modal-content wide-modal">
                        <div className="modal-header">
                            <h2>Process Claim #{selectedClaim.id}</h2>
                            <button className="close-button" onClick={() => setShowClaimModal(false)}>Ã—</button>
                        </div>
                        <div className="modal-body">
                            <div className="claim-details">
                                <h3>Claim Information</h3>
                                <div className="details-grid">
                                    <div className="detail-group">
                                        <label>Patient Name</label>
                                        <div>{selectedClaim.patientName}</div>
                                    </div>
                                    <div className="detail-group">
                                        <label>Provider</label>
                                        <div>{selectedClaim.providerName}</div>
                                    </div>
                                    <div className="detail-group">
                                        <label>Provider Type</label>
                                        <div>{selectedClaim.providerType}</div>
                                    </div>
                                    <div className="detail-group">
                                        <label>Date</label>
                                        <div>{selectedClaim.date}</div>
                                    </div>
                                    <div className="detail-group">
                                        <label>Amount</label>
                                        <div>${selectedClaim.amount}</div>
                                    </div>
                                    <div className="detail-group">
                                        <label>Status</label>
                                        <div><span className={`status-badge ${selectedClaim.status}`}>{selectedClaim.status}</span></div>
                                    </div>
                                </div>
                                <h3>Services</h3>
                                <ul className="services-list">
                                    {selectedClaim.services.map((service, index) => (
                                        <li key={index}>{service}</li>
                                    ))}
                                </ul>
                                {selectedClaim.appointmentId && (
                                    <div>
                                        <h3>Related Appointment</h3>
                                        <div className="table-container">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Patient</th>
                                                        <th>Doctor</th>
                                                        <th>Date</th>
                                                        <th>Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {appointments
                                                        .filter(app => app.id === selectedClaim.appointmentId)
                                                        .map(appointment => (
                                                            <tr key={appointment.id}>
                                                                <td>{appointment.id}</td>
                                                                <td>{appointment.patientName}</td>
                                                                <td>{appointment.doctorName}</td>
                                                                <td>{appointment.date}</td>
                                                                <td>{appointment.time}</td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                <h3>Claim Processing</h3>
                                <div className="form-group">
                                    <label>Processing Note</label>
                                    <textarea placeholder="Add processing notes here..."></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Approved Amount</label>
                                    <input type="number" defaultValue={selectedClaim.amount} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-button" onClick={() => setShowClaimModal(false)}>Cancel</button>
                            <button className="reject-button">Reject Claim</button>
                            <button className="approve-button" onClick={handleCompleteClaim}>Approve Claim</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    // Render user profile content
    const renderProfile = () => {
        if (!selectedUser) return <div>No user selected</div>;
        // Get user-specific appointments
        const userAppointments = appointments.filter(app => {
            if (selectedUser.type === 'doctor') {
                return app.doctorName === selectedUser.name;
            } else if (selectedUser.type === 'patient') {
                return app.patientName === selectedUser.name;
            }
            return false;
        });
        // Get user-specific claims
        const userClaims = claims.filter(claim => {
            if (selectedUser.type === 'doctor' || selectedUser.type === 'pharmacist' || selectedUser.type === 'labAttendee') {
                return claim.providerName === selectedUser.name;
            } else if (selectedUser.type === 'patient') {
                return claim.patientName === selectedUser.name;
            }
            return false;
        });
        return (
            <div className="profile-content">
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="profile-header">
                    <button className="back-button" onClick={() => setActiveTab('users')}>
                        â† Back to Users
                    </button>
                    <div className="profile-title">
                        <h2>{selectedUser.name}</h2>
                        <div className="user-type-badge">{selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)}</div>
                    </div>
                </div>
                <div className="profile-details-section">
                    <h3>User Information</h3>
                    <div className="details-grid">
                        <div className="detail-group">
                            <label>Email</label>
                            <div>{selectedUser.email}</div>
                        </div>
                        <div className="detail-group">
                            <label>Phone</label>
                            <div>{selectedUser.phone}</div>
                        </div>
                        <div className="detail-group">
                            <label>Address</label>
                            <div>{selectedUser.address}</div>
                        </div>
                        {selectedUser.specialization && (
                            <div className="detail-group">
                                <label>Specialization</label>
                                <div>{selectedUser.specialization}</div>
                            </div>
                        )}
                    </div>
                </div>
                {(selectedUser.type === 'doctor' || selectedUser.type === 'patient') && (
                    <div className="profile-section">
                        <h3>Appointments</h3>
                        {userAppointments.length > 0 ? (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            {selectedUser.type === 'doctor' && <th>Patient</th>}
                                            {selectedUser.type === 'patient' && <th>Doctor</th>}
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userAppointments.map(appointment => (
                                            <tr key={appointment.id} className={appointment.status === 'pending' ? 'pending-row' : ''}>
                                                <td>{appointment.id}</td>
                                                {selectedUser.type === 'doctor' && <td>{appointment.patientName}</td>}
                                                {selectedUser.type === 'patient' && <td>{appointment.doctorName}</td>}
                                                <td>{appointment.date}</td>
                                                <td>{appointment.time}</td>
                                                <td>{appointment.time}</td>
                                                <td><span className={`status-badge ${appointment.status}`}>{appointment.status}</span></td>
                                                <td>${appointment.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="no-data-message">No appointments found.</div>
                        )}
                    </div>
                )}
                <div className="profile-section">
                    <h3>Claims</h3>
                    {userClaims.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        {selectedUser.type === 'patient' ? <th>Provider</th> : <th>Patient</th>}
                                        <th>Date</th>
                                        <th>Services</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userClaims.map(claim => (
                                        <tr key={claim.id} className={claim.status === 'pending' ? 'pending-row' : ''}>
                                            <td>{claim.id}</td>
                                            {selectedUser.type === 'patient' ? (
                                                <td>{claim.providerName}</td>
                                            ) : (
                                                <td>{claim.patientName}</td>
                                            )}
                                            <td>{claim.date}</td>
                                            <td>{claim.services.join(', ')}</td>
                                            <td>${claim.amount}</td>
                                            <td><span className={`status-badge ${claim.status}`}>{claim.status}</span></td>
                                            <td>
                                                {claim.status === 'pending' && (
                                                    <button
                                                        className="action-button process-button"
                                                        onClick={() => handleProcessClaim(claim)}
                                                    >
                                                        Process
                                                    </button>
                                                )}
                                                {claim.status === 'processed' && (
                                                    <button className="action-button view-button">
                                                        View Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data-message">No claims found.</div>
                    )}
                </div>
            </div>
        );
    };
    // Render main content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'users':
                return renderUsers();
            case 'claims':
                return renderClaims();
            case 'profile':
                return renderProfile();
            default:
                return renderDashboard();
        }
    };
    return (
        <div className="admin-dashboard">
            <div className="main-content">
                <div className="header">
                    <div className="header-title">
                        {activeTab === 'dashboard' && 'Dashboard Overview'}
                        {activeTab === 'users' && 'Users Management'}
                        {activeTab === 'claims' && 'Claims Management'}
                        {activeTab === 'profile' && 'User Profile'}
                    </div>
                    <div className="header-actions">
                        <div className="admin-info">
                            <span className="admin-name">Admin User</span>
                            <div className="admin-avatar">A</div>
                        </div>
                    </div>
                </div>
                <div className="content-wrapper">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;