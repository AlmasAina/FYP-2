import React, { useState, useEffect } from "react";
import "./doc_record.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import bg from "../../assets/images/patinet_bg.avif";
import SidebarDoctor from "../Pages/sidebardoctor";

const DoctorMedicalRecords = ({ isSidebarVisible, toggleSidebar }) => {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const { email } = useAuth();

    useEffect(() => {
        if (email) {
            fetchMedicalRecords();
        }
    }, [email]);

    // Function to fetch doctor's medical records
    const fetchMedicalRecords = async () => {
        setIsLoading(true);
        setError(null);
        setDebugInfo(null);

        try {
            console.log("Fetching records for doctor email:", email);

            if (!email) {
                throw new Error("Doctor email is undefined or empty");
            }

            const requestUrl = `http://localhost:5000/api/auth/doctor-records/${encodeURIComponent(email)}`;
            console.log("Making request to:", requestUrl);

            const response = await axios.get(requestUrl, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log("Full API response:", response);

            // Check for the actual response structure
            // Handle both the expected format and the actual format we're receiving
            if (response.data && response.status === 200) {
                let records = [];

                // Check for the structure we're actually getting (claims array)
                if (response.data.claims && Array.isArray(response.data.claims)) {
                    console.log("Found claims array in response:", response.data.claims.length);
                    records = response.data.claims;
                }
                // Check for the expected structure (success + data)
                else if (response.data.success && response.data.data) {
                    console.log("Found data array in response:", response.data.data.length);
                    records = response.data.data;
                }
                // Fallback - check if the response itself is an array
                else if (Array.isArray(response.data)) {
                    console.log("Response is an array:", response.data.length);
                    records = response.data;
                }
                // Last resort - if there's no recognizable structure
                else {
                    console.log("Unrecognized response structure:", response.data);
                    throw new Error("Unexpected response format from server");
                }

                setMedicalRecords(records);
                setDebugInfo(`Found ${records.length} record(s)`);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Error fetching doctor medical records:", error);

            // Create a detailed error message with debugging info
            let errorMessage = "Failed to load medical records: ";

            if (error.response) {
                // The server responded with a status code outside of 2xx range
                errorMessage += `Server error ${error.response.status}: ${error.response.data?.message || error.message}`;
                setDebugInfo(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage += "No response received from server. Backend may be down.";
                setDebugInfo("Request was sent but no response received");
            } else {
                // Something happened in setting up the request
                errorMessage += error.message || "Unknown error occurred";
                setDebugInfo(`Error type: ${error.name}, stack: ${error.stack}`);
            }

            setError(errorMessage);
            setMedicalRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedRecord(null);
    };

    // Filter records based on search term
    const filteredRecords = medicalRecords.filter(record =>
        record.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            <SidebarDoctor isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
            <div className={`doc-home-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}>
                <div className={`scrollable-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}>
                    <div className={`doctor-patients-card ${isSidebarVisible ? "with-sidebar" : ""}`}>
                        <div className="patients-header">
                            <h2>Medical Records</h2>
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by patient name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {debugInfo && (
                            <div className="debug-banner" style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                                <small>{debugInfo}</small>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="loading-indicator">
                                <p>Loading medical records...</p>
                            </div>
                        ) : error ? (
                            <div className="error-container" style={{
                                backgroundColor: "#fff8f8",
                                padding: "20px",
                                borderRadius: "8px",
                                border: "1px solid #f5c6cb",
                                color: "#721c24"
                            }}>
                                <p className="error">{error}</p>
                                <div className="troubleshooting" style={{ marginTop: "15px" }}>
                                    <p><strong>Troubleshooting Steps:</strong></p>
                                    <ol>
                                        <li>Check if the backend server is running at http://localhost:5000</li>
                                        <li>Verify that your doctor email "{email}" exists in the database</li>
                                        <li>Check server console logs for database or API errors</li>
                                        <li>Verify network connectivity between frontend and backend</li>
                                    </ol>
                                </div>
                                <button
                                    onClick={fetchMedicalRecords}
                                    style={{
                                        backgroundColor: "#002d5b",
                                        color: "white",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        marginTop: "15px"
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="no-results">
                                <p>No records found for doctor email: {email}</p>
                                <div style={{ marginTop: "15px" }}>
                                    <p><strong>This could be due to:</strong></p>
                                    <ul>
                                        <li>No medical records have been added yet for this doctor</li>
                                        <li>The doctor email in the database might be different from "{email}"</li>
                                        <li>There might be a connection issue with the database</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="patients-list">
                                {filteredRecords.map((record, index) => (
                                    <div
                                        key={record.id || record._id || index}
                                        className="patient-card"
                                        onClick={() => handleRecordClick(record)}
                                    >
                                        <div className="patient-info">
                                            <h3>{record.patientName}</h3>
                                            <div className="patient-details">
                                                <p><strong>Age:</strong> {record.patientAge}</p>
                                                <p><strong>Blood Group:</strong> {record.patientBloodGroup}</p>
                                                <p><strong>Gender:</strong> {record.patientGender || "N/A"}</p>
                                                <p><strong>Consultation:</strong> {new Date(record.consultancyDate).toLocaleDateString()}</p>
                                                <p><strong>Fee:</strong> ${record.doctorFee || record.totalAmount}</p>
                                            </div>
                                        </div>
                                        <div className="patient-status">
                                            <span className={`status-badge ${(record.claimStatus || '').toLowerCase()}`}>
                                                {record.claimStatus || 'Pending'}
                                            </span>
                                            <button className="view-btn action-btn" onClick={(e) => {
                                                e.stopPropagation();
                                                handleRecordClick(record);
                                            }}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {isPopupVisible && selectedRecord && (
                    <div className="prescription-popup-overlay" onClick={closePopup}>
                        <div className="prescription-popup" onClick={(e) => e.stopPropagation()}>
                            <div className="popup-header">
                                <h2>Medical Record Details</h2>
                                <button className="close-btn" onClick={closePopup}>&times;</button>
                            </div>
                            <div className="popup-content">
                                <div className="patient-summary">
                                    <div className="summary-item">
                                        <span className="label">Patient Name</span>
                                        <span className="value">{selectedRecord.patientName}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Age</span>
                                        <span className="value">{selectedRecord.patientAge}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Gender</span>
                                        <span className="value">{selectedRecord.patientGender || "N/A"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Blood Group</span>
                                        <span className="value">{selectedRecord.patientBloodGroup}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Contact</span>
                                        <span className="value">{selectedRecord.patientContactNumber || "N/A"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Claim Status</span>
                                        <span className="value">{selectedRecord.claimStatus || "Pending"}</span>
                                    </div>
                                </div>

                                <div className="prescriptions-list">
                                    <div className="prescription-item">
                                        <div className="prescription-header">
                                            <span className="prescription-date">
                                                Consultation: {new Date(selectedRecord.consultancyDate).toLocaleDateString()}
                                            </span>
                                            <span className={`prescription-status status-${(selectedRecord.claimStatus || 'not-submitted').toLowerCase()}`}>
                                                {selectedRecord.claimStatus || "Pending"}
                                            </span>
                                        </div>

                                        <div className="prescription-body">
                                            <div className="prescription-section">
                                                <h4>Financial Details</h4>
                                                <p><strong>Doctor Fee:</strong> ${selectedRecord.doctorFee || "N/A"}</p>
                                                <p><strong>Insurance Company:</strong> {selectedRecord.insuranceCompanyName || "N/A"}</p>
                                            </div>

                                            <div className="prescription-section">
                                                <h4>Prescribed Medicines</h4>
                                                {selectedRecord.medicines && selectedRecord.medicines.length > 0 ? (
                                                    <ul className="medications-list">
                                                        {selectedRecord.medicines.map((medicine, index) => (
                                                            <li key={index}>
                                                                {medicine.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No medicines prescribed</p>
                                                )}
                                            </div>

                                            <div className="prescription-section">
                                                <h4>Lab Tests</h4>
                                                {selectedRecord.labTests && selectedRecord.labTests.length > 0 ? (
                                                    <ul className="lab-tests-list">
                                                        {selectedRecord.labTests.map((test, index) => (
                                                            <li key={index}>
                                                                {test.testName}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No lab tests ordered</p>
                                                )}
                                            </div>

                                            {selectedRecord.diagnosis && (
                                                <div className="prescription-section">
                                                    <h4>Diagnosis</h4>
                                                    <p>{selectedRecord.diagnosis}</p>
                                                </div>
                                            )}

                                            {selectedRecord.notes && (
                                                <div className="prescription-section">
                                                    <h4>Additional Notes</h4>
                                                    <p>{selectedRecord.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorMedicalRecords;