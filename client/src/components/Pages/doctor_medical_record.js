import React, { useState, useEffect } from "react";
import "./doctor_medical_record.css";
import { useAuth } from "../../context/AuthContext";
import bg from "../../assets/images/patinet_bg.avif";
import Sidebardoctor from "./sidebardoctor";

const DoctorPatientPrescriptions = ({ isSidebarVisible, toggleSidebar }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { email } = useAuth();

    // Dummy patient data
    const dummyPatients = [
        {
            _id: "p1",
            name: "John Smith",
            patientId: "PAT-001",
            age: 45,
            gender: "Male",
            prescriptionCount: 3
        },
        {
            _id: "p2",
            name: "Sarah Johnson",
            patientId: "PAT-002",
            age: 32,
            gender: "Female",
            prescriptionCount: 5
        },
        {
            _id: "p3",
            name: "Robert Williams",
            patientId: "PAT-003",
            age: 58,
            gender: "Male",
            prescriptionCount: 2
        },
        {
            _id: "p4",
            name: "Emily Davis",
            patientId: "PAT-004",
            age: 27,
            gender: "Female",
            prescriptionCount: 1
        },
        {
            _id: "p5",
            name: "Michael Brown",
            patientId: "PAT-005",
            age: 63,
            gender: "Male",
            prescriptionCount: 4
        }
    ];

    // Dummy prescription data
    const dummyPrescriptionsByPatient = {
        "p1": [
            {
                _id: "rx101",
                date: "2025-02-15T00:00:00.000Z",
                claimStatus: "Processed",
                diagnosis: "Sepsis due to E. coli infection",
                medications: [
                    { name: "Meropenem", dosage: "1g", frequency: "TID", duration: "7 days" },
                    { name: "Vancomycin", dosage: "1.5g", frequency: "BID", duration: "5 days" }
                ],
                labTests: ["Complete Blood Count", "Blood Culture", "Procalcitonin", "Comprehensive Metabolic Panel"],
                symptoms: ["Fever", "Hypotension", "Tachycardia", "Altered mental status"],
                advice: "Maintain adequate hydration. Monitor vital signs every 4 hours.",
                followUpDate: "2025-02-25T00:00:00.000Z"
            },
            {
                _id: "rx102",
                date: "2025-02-10T00:00:00.000Z",
                claimStatus: "Processed",
                diagnosis: "Early stage sepsis",
                medications: [
                    { name: "Ceftriaxone", dosage: "2g", frequency: "Daily", duration: "5 days" },
                    { name: "Azithromycin", dosage: "500mg", frequency: "QD", duration: "3 days" }
                ],
                labTests: ["Blood Culture", "Urinalysis", "Chest X-ray"],
                symptoms: ["Low-grade fever", "Chills", "Rapid breathing"],
                advice: "Rest and drink plenty of fluids. Report any worsening symptoms immediately.",
                followUpDate: "2025-02-17T00:00:00.000Z"
            },
            {
                _id: "rx103",
                date: "2025-01-20T00:00:00.000Z",
                claimStatus: "Processed",
                diagnosis: "Post-operative wound infection with early sepsis",
                medications: [
                    { name: "Piperacillin-Tazobactam", dosage: "4.5g", frequency: "Q6H", duration: "10 days" }
                ],
                labTests: ["Wound Culture", "Blood Culture", "CBC with Differential"],
                symptoms: ["Surgical site erythema", "Purulent discharge", "Fever"],
                advice: "Clean wound twice daily with prescribed solution. Elevate affected area when possible.",
                followUpDate: "2025-01-30T00:00:00.000Z"
            }
        ],
        "p2": [
            {
                _id: "rx201",
                date: "2025-03-01T00:00:00.000Z",
                claimStatus: "In Process",
                diagnosis: "Septic shock secondary to pneumonia",
                medications: [
                    { name: "Cefepime", dosage: "2g", frequency: "BID", duration: "10 days" },
                    { name: "Levofloxacin", dosage: "750mg", frequency: "QD", duration: "7 days" },
                    { name: "Hydrocortisone", dosage: "100mg", frequency: "Q8H", duration: "3 days" }
                ],
                labTests: ["Blood Culture", "Sputum Culture", "Arterial Blood Gas", "Lactate"],
                symptoms: ["High fever", "Severe hypotension", "Respiratory distress", "Confusion"],
                advice: "ICU monitoring required. Vasopressor support as needed.",
                followUpDate: "2025-03-15T00:00:00.000Z"
            },
            {
                _id: "rx202",
                date: "2025-02-20T00:00:00.000Z",
                claimStatus: "Processed",
                diagnosis: "Community-acquired pneumonia with sepsis",
                medications: [
                    { name: "Ceftriaxone", dosage: "1g", frequency: "QD", duration: "7 days" },
                    { name: "Azithromycin", dosage: "500mg", frequency: "QD", duration: "5 days" }
                ],
                labTests: ["Chest X-ray", "Blood Culture", "Sputum Culture"],
                symptoms: ["Productive cough", "Fever", "Chills", "Shortness of breath"],
                advice: "Use incentive spirometer 10 times every hour while awake. Follow up if symptoms worsen.",
                followUpDate: "2025-02-27T00:00:00.000Z"
            }
        ],
        "p3": [
            {
                _id: "rx301",
                date: "2025-03-05T00:00:00.000Z",
                claimStatus: "Submitted",
                diagnosis: "Urosepsis",
                medications: [
                    { name: "Ciprofloxacin", dosage: "500mg", frequency: "BID", duration: "10 days" },
                    { name: "Gentamicin", dosage: "5mg/kg", frequency: "QD", duration: "5 days" }
                ],
                labTests: ["Urinalysis", "Urine Culture", "Blood Culture", "Kidney Function Test"],
                symptoms: ["Dysuria", "Flank pain", "Fever", "Chills"],
                advice: "Increase fluid intake. Take all antibiotics as prescribed even if symptoms improve.",
                followUpDate: "2025-03-15T00:00:00.000Z"
            }
        ],
        "p4": [
            {
                _id: "rx401",
                date: "2025-02-28T00:00:00.000Z",
                claimStatus: "Not Submitted",
                diagnosis: "Postpartum endometritis with early sepsis",
                medications: [
                    { name: "Clindamycin", dosage: "900mg", frequency: "TID", duration: "7 days" },
                    { name: "Gentamicin", dosage: "5mg/kg", frequency: "QD", duration: "7 days" }
                ],
                labTests: ["Endometrial Culture", "Blood Culture", "CBC with Differential"],
                symptoms: ["Uterine tenderness", "Fever", "Malodorous lochia", "Pelvic pain"],
                advice: "Pelvic rest. Report heavy bleeding or increasing pain immediately.",
                followUpDate: "2025-03-07T00:00:00.000Z"
            }
        ],
        "p5": [
            {
                _id: "rx501",
                date: "2025-03-02T00:00:00.000Z",
                claimStatus: "In Process",
                diagnosis: "Diabetic foot infection with sepsis",
                medications: [
                    { name: "Ertapenem", dosage: "1g", frequency: "QD", duration: "14 days" },
                    { name: "Insulin sliding scale", dosage: "Variable", frequency: "QID", duration: "Ongoing" }
                ],
                labTests: ["Wound Culture", "Blood Culture", "Blood Glucose Monitoring", "HbA1c"],
                symptoms: ["Foot ulcer", "Erythema", "Swelling", "Fever"],
                advice: "Strict glycemic control. Keep wound clean and dry. Offload pressure from affected foot.",
                followUpDate: "2025-03-16T00:00:00.000Z"
            },
            {
                _id: "rx502",
                date: "2025-02-15T00:00:00.000Z",
                claimStatus: "Processed",
                diagnosis: "Cellulitis with early sepsis",
                medications: [
                    { name: "Cefazolin", dosage: "1g", frequency: "TID", duration: "7 days" },
                    { name: "Metronidazole", dosage: "500mg", frequency: "TID", duration: "7 days" }
                ],
                labTests: ["Blood Culture", "CBC", "CRP", "ESR"],
                symptoms: ["Erythema", "Warmth", "Swelling", "Low-grade fever"],
                advice: "Elevate affected limb. Apply warm compresses for 20 minutes 3-4 times daily.",
                followUpDate: "2025-02-22T00:00:00.000Z"
            }
        ]
    };

    useEffect(() => {
        // Simulate API loading
        setTimeout(() => {
            setPatients(dummyPatients);
            setIsLoading(false);
        }, 1000);
    }, []);

    const fetchPatientPrescriptions = async (patientId) => {
        // Simulate API loading
        setIsLoading(true);
        setTimeout(() => {
            setPrescriptions(dummyPrescriptionsByPatient[patientId] || []);
            setIsLoading(false);
        }, 350);
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        fetchPatientPrescriptions(patient._id);
        setIsPopupVisible(true);
    };

    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedPatient(null);
        setPrescriptions([]);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Not Submitted":
                return "status-not-submitted";
            case "Submitted":
                return "status-submitted";
            case "In Process":
                return "status-in-process";
            case "Processed":
                return "status-processed";
            default:
                return "status-not-submitted";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Not Submitted":
                return "❌";
            case "Submitted":
                return "📤";
            case "In Process":
                return "⏳";
            case "Processed":
                return "✅";
            default:
                return "❓";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="doctor-medical-record-container">
            {/* Sidebar */}
            <Sidebardoctor isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

            <div className={`doc-home-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}>

                <div className="scrollable-container">
                    <div className={`doctor-patients-card ${isSidebarVisible ? "with-sidebar" : ""}`}>
                        <div className="patients-header">
                            <h2>Patients Record</h2>
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search patients by Name/ID"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        {isLoading && !isPopupVisible ? (
                            <div className="loading-indicator">Loading patients...</div>
                        ) : (
                            <div className="patients-list">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <div
                                            key={patient._id}
                                            className="patient-card"
                                            onClick={() => handlePatientClick(patient)}
                                        >
                                            <div className="patient-info">
                                                <h3>{patient.name}</h3>
                                                <div className="patient-details">
                                                    <p><strong>ID:</strong> {patient.patientId}</p>
                                                    <p><strong>Age:</strong> {patient.age}</p>
                                                    <p><strong>Gender:</strong> {patient.gender}</p>
                                                </div>
                                                <div className="patient-status">
                                                    <span className="prescription-count">
                                                        {patient.prescriptionCount || 0} Prescriptions
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">No septic patients found.</div>
                                )}
                            </div>
                        )}

                        {/* Prescription Popup */}
                        {isPopupVisible && selectedPatient && (
                            <div className="prescription-popup-overlay">
                                <div className="prescription-popup">
                                    <div className="popup-header">
                                        <h2>Prescriptions for {selectedPatient.name}</h2>
                                        <button className="close-btn" onClick={closePopup}>×</button>
                                    </div>
                                    <div className="popup-content">
                                        <div className="patient-summary">
                                            <div className="summary-item">
                                                <span className="label">Patient ID:</span>
                                                <span className="value">{selectedPatient.patientId}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="label">Age:</span>
                                                <span className="value">{selectedPatient.age}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span className="label">Gender:</span>
                                                <span className="value">{selectedPatient.gender}</span>
                                            </div>
                                        </div>

                                        {isLoading ? (
                                            <div className="loading-indicator">Loading prescriptions...</div>
                                        ) : prescriptions.length > 0 ? (
                                            <div className="prescriptions-list">
                                                {prescriptions.map((prescription) => (
                                                    <div key={prescription._id} className="prescription-item">
                                                        <div className="prescription-header">
                                                            <div className="prescription-date">
                                                                {formatDate(prescription.date)}
                                                            </div>
                                                            <div className={`prescription-status ${getStatusClass(prescription.claimStatus)}`}>
                                                                <span className="status-icon">{getStatusIcon(prescription.claimStatus)}</span>
                                                                {prescription.claimStatus || "Not Submitted"}
                                                            </div>
                                                        </div>
                                                        <div className="prescription-body">
                                                            <div className="prescription-section">
                                                                <h4>Diagnosis</h4>
                                                                <p>{prescription.diagnosis}</p>
                                                            </div>
                                                            {prescription.medications && prescription.medications.length > 0 && (
                                                                <div className="prescription-section">
                                                                    <h4>Medications</h4>
                                                                    <ul className="medications-list">
                                                                        {prescription.medications.map((med, idx) => (
                                                                            <li key={idx}>
                                                                                <strong>{med.name}</strong> - {med.dosage}, {med.frequency}, {med.duration}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {prescription.labTests && prescription.labTests.length > 0 && (
                                                                <div className="prescription-section">
                                                                    <h4>Lab Tests</h4>
                                                                    <ul className="lab-tests-list">
                                                                        {prescription.labTests.map((test, idx) => (
                                                                            <li key={idx}>{test}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {prescription.symptoms && prescription.symptoms.length > 0 && (
                                                                <div className="prescription-section">
                                                                    <h4>Symptoms</h4>
                                                                    <ul className="symptoms-list">
                                                                        {prescription.symptoms.map((symptom, idx) => (
                                                                            <li key={idx}>{symptom}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {prescription.advice && (
                                                                <div className="prescription-section">
                                                                    <h4>Advice</h4>
                                                                    <p>{prescription.advice}</p>
                                                                </div>
                                                            )}
                                                            {prescription.followUpDate && (
                                                                <div className="prescription-section follow-up">
                                                                    <h4>Follow-up Date</h4>
                                                                    <p>{formatDate(prescription.followUpDate)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="prescription-actions">
                                                            <button className="action-btn view-btn">View Full Details</button>
                                                            <button className="action-btn print-btn">Print</button>
                                                            <button className="action-btn update-btn">Update Status</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-results">No prescriptions found for this patient.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPatientPrescriptions;