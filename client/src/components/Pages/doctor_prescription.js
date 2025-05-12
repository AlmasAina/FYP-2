import React, { useState, useEffect } from "react";
import "./doctor_prescription.css";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import bg from "../../assets/images/patinet_bg.avif";
import Sidebardoctor from "./sidebardoctor";
import * as XLSX from "xlsx"; // Import xlsx library
import medicinesFile from './medicines.xlsx';
import labTestFile from './lab_tests.xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DoctorPrescription = ({ isSidebarVisible, toggleSidebar }) => {
    const [isSidebarVisibleState, setIsSidebarVisible] = useState(isSidebarVisible);
    const [prescriptionData, setPrescriptionData] = useState({
        patientEmail: "",
        patientAge: "",
        patientGender: "Male",
        diagnosis: "",
        symptoms: [],
        medications: [],
        labTests: [],
        advice: "",
        followUpDate: ""
    });

    const [doctorInfo, setDoctorInfo] = useState({
        name: "N/A",
        specialization: "N/A",
        education: "N/A"
    });

    const [medicines, setMedicines] = useState([]); // State to store medicine names
    const [labTests, setLabTests] = useState([]); // State to store lab test names

    const { email } = useAuth();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (!email) return;
            try {
                const response = await axios.get("http://localhost:5000/api/auth/doctor-details", { params: { email } });
                setDoctorInfo({
                    name: response.data.name,
                    specialization: response.data.specialization,
                    education: response.data.education
                });
            } catch (error) {
                console.error("Error fetching doctor details:", error);
            }
        };

        fetchDoctorDetails();
    }, [email]);

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const response = await fetch(medicinesFile);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0]; // Get the first sheet
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) {
                    throw new Error("No worksheet found in the Excel file.");
                }
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Extract medicine names from the first column
                const medicineNames = jsonData.slice(1).map(row => row[0]); // Skip header row
                setMedicines(medicineNames);
            } catch (error) {
                console.error("Error fetching medicines:", error);
            }
        };

        fetchMedicines();
    }, []);

    useEffect(() => {
        const fetchLabTests = async () => {
            try {
                const response = await fetch(labTestFile);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0]; // Get the first sheet
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) {
                    throw new Error("No worksheet found in the Excel file.");
                }
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Extract lab test names from the first column
                const labTestNames = jsonData.slice(1).map(row => row[0]); // Skip header row
                setLabTests(labTestNames);
            } catch (error) {
                console.error("Error fetching lab tests:", error);
            }
        };

        fetchLabTests();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validation for Follow-up Date
        if (name === "followUpDate") {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Remove time for accurate comparison

            if (selectedDate <= today) {
                toast.error("Follow-up date must be a future date.", {
                    position: "top-right",
                    autoClose: 3000, // Closes after 3 seconds
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
                return; // Stop updating state if invalid
            }
        }

        setPrescriptionData({
            ...prescriptionData,
            [name]: value,
        });
    };


    const handleSymptomChange = (index, value) => {
        const newSymptoms = [...prescriptionData.symptoms];
        newSymptoms[index] = value;
        setPrescriptionData({
            ...prescriptionData,
            symptoms: newSymptoms,
        });
    };

    const addSymptom = () => {
        setPrescriptionData({
            ...prescriptionData,
            symptoms: [...prescriptionData.symptoms, ""],
        });
    };

    const removeSymptom = (index) => {
        const newSymptoms = prescriptionData.symptoms.filter((_, i) => i !== index);
        setPrescriptionData({
            ...prescriptionData,
            symptoms: newSymptoms,
        });
    };

    const handleMedicationChange = (index, field, value) => {
        const newMedications = [...prescriptionData.medications];
        if (!newMedications[index]) {
            newMedications[index] = { name: "", dosage: "", frequency: "", duration: "" };
        }
        newMedications[index][field] = value;
        setPrescriptionData({
            ...prescriptionData,
            medications: newMedications,
        });
    };

    const addMedication = () => {
        setPrescriptionData({
            ...prescriptionData,
            medications: [...prescriptionData.medications, { name: "", dosage: "", frequency: "", duration: "" }],
        });
    };

    const removeMedication = (index) => {
        const newMedications = prescriptionData.medications.filter((_, i) => i !== index);
        setPrescriptionData({
            ...prescriptionData,
            medications: newMedications,
        });
    };

    const handleLabTestChange = (index, value) => {
        const newLabTests = [...prescriptionData.labTests];
        newLabTests[index] = value;
        setPrescriptionData({
            ...prescriptionData,
            labTests: newLabTests,
        });
    };

    const addLabTest = () => {
        setPrescriptionData({
            ...prescriptionData,
            labTests: [...prescriptionData.labTests, ""],
        });
    };

    const removeLabTest = (index) => {
        const newLabTests = prescriptionData.labTests.filter((_, i) => i !== index);
        setPrescriptionData({
            ...prescriptionData,
            labTests: newLabTests,
        });
    };

    const savePrescription = async () => {
        // Check if all required fields are filled
        if (!prescriptionData.patientEmail) {
            toast.error("Please enter the patient's email.");
            return;
        }
        if (!prescriptionData.patientAge) {
            toast.error("Please enter the patient's age.");
            return;
        }
        if (!prescriptionData.patientGender) {
            toast.error("Please select the patient's gender.");
            return;
        }
        if (!prescriptionData.diagnosis) {
            toast.error("Please enter the diagnosis.");
            return;
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(prescriptionData.patientEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            // Check if patient exists in the database
            const patientResponse = await axios.get(`http://localhost:5000/api/auth/patient-details?email=${prescriptionData.patientEmail}`);
            const patientData = patientResponse.data;

            // Validate age and gender match with patient data
            if (patientData.age !== parseInt(prescriptionData.patientAge) || patientData.gender !== prescriptionData.patientGender) {
                toast.error("Patient details do not match with our records. Please check the email, age, and gender.");
                return;
            }

            // Transform labTests into the required format (remove status)
            const formattedLabTests = prescriptionData.labTests.map(test => ({
                testName: test // Only include testName
            }));

            // Prepare the prescription data to be sent to the backend
            const prescriptionPayload = {
                patientEmail: prescriptionData.patientEmail,
                patientAge: parseInt(prescriptionData.patientAge),
                patientGender: prescriptionData.patientGender,
                doctorEmail: email,
                diagnosis: prescriptionData.diagnosis,
                symptoms: prescriptionData.symptoms,
                medications: prescriptionData.medications,
                labTests: formattedLabTests, // Use the formatted labTests without status
                advice: prescriptionData.advice,
                followUpDate: prescriptionData.followUpDate ? new Date(prescriptionData.followUpDate) : null,
                dateIssued: new Date().toISOString()
            };

            // Validate follow-up date
            if (prescriptionPayload.followUpDate && isToday(prescriptionPayload.followUpDate)) {
                toast.error("Follow-up date cannot be today. Please select a future date.");
                return;
            }

            const prescriptionResponse = await axios.get("http://localhost:5000/api/auth/prescriptions_before/check", {
                params: {
                    doctorEmail: email,
                    patientEmail: prescriptionData.patientEmail,
                    date: new Date().toISOString()
                }
            });

            if (prescriptionResponse.data.exists) {
                toast.error("Prescription already exists for this patient and doctor.");
                return;
            }

            // Save prescription to database
            await axios.post("http://localhost:5000/api/auth/prescriptions/create", prescriptionPayload);

            toast.success("Prescription saved successfully!");

            // Do not clear the form after saving
            // clearForm(); // Comment out or remove this line
        } catch (error) {
            console.error("Error saving prescription:", error);
            toast.error("Failed to save prescription. Ensure the email is correct and registered.");
        }
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const sendToLabAttendant = async () => {
        // Validate required fields for the prescription
        if (!prescriptionData.patientEmail) {
            toast.error("Please enter the patient's email.");
            return;
        }
        if (!prescriptionData.patientAge) {
            toast.error("Please enter the patient's age.");
            return;
        }
        if (!prescriptionData.patientGender) {
            toast.error("Please select the patient's gender.");
            return;
        }
        if (!prescriptionData.diagnosis) {
            toast.error("Please enter the diagnosis.");
            return;
        }
        if (prescriptionData.labTests.length === 0) {
            toast.error("Please add at least one lab test before sending to Lab Attendant.");
            return;
        }

        try {
            // 1️⃣ **Check if the prescription exists in the database**
            const prescriptionResponse = await axios.get("http://localhost:5000/api/auth/prescriptions/check", {
                params: {
                    doctorEmail: email,
                    patientEmail: prescriptionData.patientEmail,
                    date: new Date().toISOString()
                }
            });

            if (!prescriptionResponse.data.exists) {
                toast.error("Please save the prescription first before sending to the lab.");
                return;
            }

            const prescriptionId = prescriptionResponse.data.prescriptionId; // Get the prescription ID

            // 2️⃣ **Check if lab tests already exist for this prescription**
            const labTestsResponse = await axios.get("http://localhost:5000/api/auth/lab-tests/check", {
                params: { prescriptionId }
            });

            if (labTestsResponse.data.exists) {
                toast.error("Lab tests already exist for this prescription. No need to send again.");
                return;
            }

            // 3️⃣ **Send lab tests & update claim with test fees**
            await axios.post("http://localhost:5000/api/auth/lab-tests/create-and-update-claim", {
                prescriptionId,
                labTests: prescriptionData.labTests
            });

            toast.success("Lab request sent successfully and claim updated!");
        } catch (error) {
            console.error("Error sending lab request:", error);
            toast.error("Failed to send lab request. Please try again.");
        }
    };

    const sendToPharmacist = async () => {
        // Validate required fields for the prescription
        if (!prescriptionData.patientEmail) {
            toast.error("Please enter the patient's email.");
            return;
        }
        if (!prescriptionData.patientAge) {
            toast.error("Please enter the patient's age.");
            return;
        }
        if (!prescriptionData.patientGender) {
            toast.error("Please select the patient's gender.");
            return;
        }
        if (!prescriptionData.diagnosis) {
            toast.error("Please enter the diagnosis.");
            return;
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(prescriptionData.patientEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        // Validate medications
        if (prescriptionData.medications.length === 0) {
            toast.error("Please add at least one medication before sending to the Pharmacist.");
            return;
        }

        try {
            // Step 1️⃣: Check if the prescription exists
            const prescriptionResponse = await axios.get("http://localhost:5000/api/auth/prescriptions/check", {
                params: {
                    doctorEmail: email,
                    patientEmail: prescriptionData.patientEmail,
                    date: new Date().toISOString()
                }
            });

            if (!prescriptionResponse.data.exists) {
                toast.error("Please save the prescription first before sending to the Pharmacist.");
                return;
            }

            const prescriptionId = prescriptionResponse.data.prescriptionId; // Get the prescription ID

            // Step 2️⃣: Check if medicines already exist for this prescription in the claim
            const medicinesResponse = await axios.get("http://localhost:5000/api/auth/medicines/check", {
                params: { prescriptionId }
            });

            if (medicinesResponse.data.exists) {
                toast.error("Medicines already exist for this prescription. No need to send again.");
                return;
            }

            // Step 3️⃣: Send medicines & update claim with fees
            const response = await axios.post("http://localhost:5000/api/auth/pharmacy-requests/create-and-update-claim", {
                prescriptionId,
                medicines: prescriptionData.medications
            });

            if (response.status === 200) {
                toast.success("Prescription sent to pharmacist successfully!");
            } else {
                toast.error("Failed to send prescription. Please try again.");
            }
        } catch (error) {
            console.error("Error sending prescription to pharmacist:", error);
            toast.error("Failed to send prescription. Please try again.");
        }
    };


    const clearForm = () => {
        setPrescriptionData({
            patientEmail: "",
            patientAge: "",
            patientGender: "Male",
            diagnosis: "",
            symptoms: [],
            medications: [],
            labTests: [],
            advice: "",
            followUpDate: ""
        });
    };

    const formatDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="doctor-prescription-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <Sidebardoctor isSidebarVisible={isSidebarVisibleState} toggleSidebar={() => setIsSidebarVisible(!isSidebarVisibleState)} />

            <div className={`doc-home-container ${isSidebarVisibleState ? "sidebar-visible" : "sidebar-hidden"}`} style={{
                backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="scrollable-container">
                    <div className={`doctor-prescription-card ${isSidebarVisibleState ? "with-sidebar" : ""}`}>
                        <div className="prescription-header">
                            <div className="prescription-title">
                                <h2>Medical Prescription</h2>
                                <p className="prescription-date">Date: {formatDate()}</p>
                            </div>
                            <div className="doctor-info">
                                <h3>{doctorInfo.name}</h3>
                                <p>{doctorInfo.specialization}</p>
                                <p>{doctorInfo.education}</p>
                            </div>
                        </div>

                        <div className="prescription-form">
                            <div className="form-section">
                                <h4>Patient Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Patient Email</label>
                                        <input
                                            type="text" // Change from "email" to "text" to avoid automatic validation
                                            name="patientEmail"
                                            value={prescriptionData.patientEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter patient email"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input type="number" name="patientAge" value={prescriptionData.patientAge}
                                            onChange={handleInputChange} placeholder="Age" min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select name="patientGender" value={prescriptionData.patientGender}
                                            onChange={handleInputChange}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Diagnosis</h4>
                                <div className="form-group">
                                    <textarea name="diagnosis" value={prescriptionData.diagnosis} onChange={handleInputChange}
                                        placeholder="Enter diagnosis details" rows="3"></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Symptoms</h4>
                                {prescriptionData.symptoms.map((symptom, index) => (
                                    <div key={index} className="list-item-container">
                                        <input type="text" value={symptom} onChange={(e) => handleSymptomChange(index, e.target.value)}
                                            placeholder="Enter symptom"
                                        />
                                        <div className="item-controls">
                                            <button type="button" className="control-btn remove-btn" onClick={() => removeSymptom(index)}>-</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-btn" onClick={addSymptom}>+ Add Symptom</button>
                            </div>

                            <div className="form-section">
                                <h4>Medications</h4>
                                {prescriptionData.medications.map((medication, index) => (
                                    <div key={index} className="medication-item">
                                        <div className="medication-header">
                                            <h5>Medication #{index + 1}</h5>
                                            <button type="button" className="control-btn remove-btn" onClick={() => removeMedication(index)}>-</button>
                                        </div>
                                        <div className="medication-details">
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input
                                                    type="text"
                                                    list="medicines-list" // Add datalist for autocomplete
                                                    value={medication.name || ""}
                                                    onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                                                    placeholder="Medication name"
                                                />
                                                <datalist id="medicines-list">
                                                    {medicines.map((medicine, idx) => (
                                                        <option key={idx} value={medicine} />
                                                    ))}
                                                </datalist>
                                            </div>
                                            <div className="form-group">
                                                <label>Dosage</label>
                                                <select
                                                    value={medication.dosage || ""}
                                                    onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                                                >
                                                    <option value="">Select dosage</option>
                                                    <option value="500mg">500mg</option>
                                                    <option value="250mg">250mg</option>
                                                    <option value="100mg">100mg</option>
                                                    <option value="50mg">50mg</option>
                                                    <option value="10mg">10mg</option>
                                                    <option value="5mg">5mg</option>
                                                    <option value="2mg">2mg</option>
                                                    <option value="1g">1g</option>
                                                    <option value="200mcg">200mcg</option>
                                                    <option value="100mcg">100mcg</option>
                                                    <option value="50mcg">50mcg</option>
                                                    <option value="10mcg">10mcg</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Frequency</label>
                                                <select
                                                    value={medication.frequency || ""}
                                                    onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                                                >
                                                    <option value="">Select frequency</option>
                                                    <option value="Once daily">Once daily</option>
                                                    <option value="Twice daily">Twice daily</option>
                                                    <option value="Three times daily">Three times daily</option>
                                                    <option value="Four times daily">Four times daily</option>
                                                    <option value="Every 6 hours">Every 6 hours</option>
                                                    <option value="Every 8 hours">Every 8 hours</option>
                                                    <option value="Every 12 hours">Every 12 hours</option>
                                                    <option value="As needed">As needed</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Duration</label>
                                                <select
                                                    value={medication.duration || ""}
                                                    onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                                                >
                                                    <option value="">Select duration</option>
                                                    <option value="3 days">3 days</option>
                                                    <option value="5 days">5 days</option>
                                                    <option value="7 days">7 days</option>
                                                    <option value="10 days">10 days</option>
                                                    <option value="14 days">14 days</option>
                                                    <option value="1 month">1 month</option>
                                                    <option value="3 months">3 months</option>
                                                    <option value="6 months">6 months</option>
                                                    <option value="1 year">1 year</option>
                                                    <option value="As prescribed">As prescribed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-btn" onClick={addMedication}>+ Add Medication</button>
                            </div>

                            <div className="form-section">
                                <h4>Lab Tests</h4>
                                {prescriptionData.labTests.map((test, index) => (
                                    <div key={index} className="list-item-container">
                                        <input
                                            type="text"
                                            list="lab-tests-list" // Add datalist for autocomplete
                                            value={test}
                                            onChange={(e) => handleLabTestChange(index, e.target.value)}
                                            placeholder="Enter lab test"
                                        />
                                        <datalist id="lab-tests-list">
                                            {labTests.map((labTest, idx) => (
                                                <option key={idx} value={labTest} />
                                            ))}
                                        </datalist>
                                        <div className="item-controls">
                                            <button type="button" className="control-btn remove-btn" onClick={() => removeLabTest(index)}>-</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="add-btn" onClick={addLabTest}>+ Add Lab Test</button>
                            </div>

                            <div className="form-section">
                                <h4>Additional Advice</h4>
                                <div className="form-group">
                                    <textarea name="advice" value={prescriptionData.advice} onChange={handleInputChange}
                                        placeholder="Enter additional advice or instructions" rows="3"></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Follow-up</h4>
                                <div className="form-group">
                                    <label>Follow-up Date</label>
                                    <input type="date" name="followUpDate" value={prescriptionData.followUpDate}
                                        onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="clear-btn" onClick={clearForm}>Clear Form</button>
                                <button type="button" className="lab-btn" onClick={sendToLabAttendant}>Send to Lab</button>
                                <button type="button" className="pharm-btn" onClick={sendToPharmacist}>Send to Pharmacist</button>
                                <button type="button" className="save-btn" onClick={savePrescription}>Save Prescription</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescription;