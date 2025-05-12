import React, { useState, useEffect } from "react";
import "./patient_record.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import bg from "../../assets/images/patinet_bg.avif";
import SidebarPatient from "./sidebarPatient";

const PatientMedicalRecords = ({ isSidebarVisible, toggleSidebar }) => {
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
    const fetchMedicalRecords = async () => {
        setIsLoading(true);
        setError(null);
        setDebugInfo(null);

        try {
            console.log("=== FRONTEND: Fetching Medical Records ===");
            console.log("Patient email:", email);

            if (!email) {
                throw new Error("Patient email is undefined or empty");
            }

            // Try the primary route first
            const primaryRequestUrl = `http://localhost:5000/api/auth/patient-records/${encodeURIComponent(email)}`;
            console.log("Making request to primary URL:", primaryRequestUrl);

            // Add a route test first to check if the endpoint exists
            try {
                await axios.get('http://localhost:5000/api/auth/patient-records/test', { timeout: 3000 });
                console.log("Route test successful - endpoint exists");
            } catch (routeTestError) {
                console.error("Route test failed:", routeTestError.message);
                setDebugInfo(`Route test failed: ${routeTestError.message}`);
                // Don't throw here, we'll try the alternative routes
            }

            // Try to make the actual request
            let response;
            try {
                response = await axios.get(primaryRequestUrl, {
                    timeout: 10000,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
            } catch (primaryError) {
                console.log("Primary route failed, trying alternative routes...");

                // Try alternative routes if the primary one fails
                const alternativeUrls = [
                    // Try without the /auth part
                    `http://localhost:5000/api/patient-records/${encodeURIComponent(email)}`,
                    // Try a different base path
                    `http://localhost:5000/api/patients/${encodeURIComponent(email)}/records`,
                    // Try a query parameter approach
                    `http://localhost:5000/api/patients/records?email=${encodeURIComponent(email)}`
                ];

                let alternativeWorked = false;

                for (const url of alternativeUrls) {
                    try {
                        console.log("Trying alternative URL:", url);
                        response = await axios.get(url, {
                            timeout: 8000,
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                        console.log("Alternative route successful:", url);
                        setDebugInfo(`Found working endpoint: ${url}`);
                        alternativeWorked = true;
                        break;
                    } catch (altError) {
                        console.log(`Alternative URL ${url} failed:`, altError.message);
                    }
                }

                if (!alternativeWorked) {
                    // If all alternatives failed, throw the original error
                    console.error("All route attempts failed");
                    throw primaryError;
                }
            }

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);
            console.log("Response data type:", typeof response.data);

            // Handle the response data
            if (typeof response.data === 'string') {
                // Try to parse if it looks like JSON
                if (response.data.trim().startsWith('{') || response.data.trim().startsWith('[')) {
                    try {
                        const parsedData = JSON.parse(response.data);
                        console.log("Successfully parsed string response as JSON");
                        response.data = parsedData;
                    } catch (e) {
                        console.error("Failed to parse response string as JSON:", e);
                        throw new Error("Received non-JSON response from server");
                    }
                } else {
                    // Likely HTML or other non-JSON response
                    if (response.data.includes("<!DOCTYPE html>")) {
                        throw new Error("Received HTML instead of JSON. Check server route configuration.");
                    } else {
                        throw new Error("Received non-JSON response from server");
                    }
                }
            }

            // Process the data as before
            let records = [];

            if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
                records = response.data.data;
            } else if (response.data && response.data.claims && Array.isArray(response.data.claims)) {
                records = response.data.claims;
            } else if (Array.isArray(response.data)) {
                records = response.data;
            } else {
                throw new Error("Unexpected response format from server");
            }

            // Normalize the records
            const normalizedRecords = records.map((record, index) => {
                return {
                    id: record.id || record._id || `temp-${index}`,
                    doctorName: record.doctorName || "Unknown",
                    consultancyDate: record.consultancyDate || new Date().toISOString(),
                    claimStatus: record.claimStatus || "Pending",
                    totalAmount: record.totalAmount || record.doctorFee || 0,
                    doctorFee: record.doctorFee || 0,
                    insuranceCompanyName: record.insuranceCompanyName || "None",
                    medicines: Array.isArray(record.medicines) ? record.medicines : [],
                    labTests: Array.isArray(record.labTests) ? record.labTests : [],
                    diagnosis: record.diagnosis || "",
                    notes: record.notes || ""
                };
            });

            setMedicalRecords(normalizedRecords);
            setDebugInfo(`Found ${normalizedRecords.length} record(s)`);

        } catch (error) {
            console.error("Error fetching patient medical records:", error);

            // Create a detailed error message with debugging info
            let errorMessage = "Failed to load medical records: ";

            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = "API endpoint not found. The route /api/auth/patient-records/:patientEmail doesn't exist on the server.";
                    setDebugInfo(`
            Route issue detected. Check your backend routes configuration.
            Expected route: /api/auth/patient-records/${encodeURIComponent(email)}
            Server responded with 404 Not Found
          `);
                } else {
                    errorMessage += `Server error ${error.response.status}: ${error.response.data?.message || error.message}`;
                    setDebugInfo(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
                }
            } else if (error.request) {
                errorMessage += "No response received from server. Backend may be down.";
                setDebugInfo("Request was sent but no response received");
            } else {
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
        record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patient-home-container"
            style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>

            <SidebarPatient isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

            <div className={`scrollable-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}>
                <div className={`patient-records-card ${isSidebarVisible ? "with-sidebar" : ""}`}>
                    <div className="records-header">
                        <h2>My Medical Records</h2>
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by doctor name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {debugInfo && (
                        <div className="debug-banner" style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '8px',
                            borderRadius: '4px'
                        }}>
                            <strong>No. of Records:  </strong> <small>{debugInfo}</small>
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
                                    <li>Verify that your email "{email}" exists in the database</li>
                                    <li>Check server console logs for database or API errors</li>
                                    <li>Verify API route matches: should be /api/patient-records/{email}</li>
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
                            <p>No records found for patient email: {email}</p>
                            <div style={{ marginTop: "15px" }}>
                                <p><strong>This could be due to:</strong></p>
                                <ul>
                                    <li>No medical records have been created for you yet</li>
                                    <li>The email in the database might be different from "{email}"</li>
                                    <li>There might be a connection issue with the database</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="records-list">
                            {filteredRecords.map((record, index) => (
                                <div
                                    key={record.id || index}
                                    className="record-card"
                                    onClick={() => handleRecordClick(record)}
                                >
                                    <div className="record-info">
                                        <h3>Dr. {record.doctorName || "Unknown"}</h3>
                                        <div className="record-details">
                                            <p><strong>Consultation:</strong> {new Date(record.consultancyDate).toLocaleDateString()}</p>
                                            <p><strong>Fee:</strong> ${record.doctorFee || record.totalAmount || 0}</p>
                                            <p><strong>Insurance:</strong> {record.insuranceCompanyName || "None"}</p>
                                        </div>
                                    </div>
                                    <div className="record-status">
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
                            <div className="doctor-summary">
                                <div className="summary-item">
                                    <span className="label">Doctor Name</span>
                                    <span className="value">Dr. {selectedRecord.doctorName || "Unknown"}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Consultation Date</span>
                                    <span className="value">{new Date(selectedRecord.consultancyDate).toLocaleDateString()}</span>
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
                                            <p><strong>Total Amount:</strong> ${selectedRecord.totalAmount || selectedRecord.doctorFee || "N/A"}</p>
                                            <p><strong>Doctor Fee:</strong> ${selectedRecord.doctorFee || "N/A"}</p>
                                            <p><strong>Insurance Company:</strong> {selectedRecord.insuranceCompanyName || "N/A"}</p>
                                        </div>

                                        <div className="prescription-section">
                                            <h4>Prescribed Medicines</h4>
                                            {selectedRecord.medicines && selectedRecord.medicines.length > 0 ? (
                                                <ul className="medications-list">
                                                    {selectedRecord.medicines.map((medicine, index) => (
                                                        <li key={index}>
                                                            {medicine.name} - ${medicine.fee} ({medicine.status || "Pending"})
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
                                                            {test.testName} - ${test.testFee} ({test.status || "Pending"})
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
    );
};

export default PatientMedicalRecords;