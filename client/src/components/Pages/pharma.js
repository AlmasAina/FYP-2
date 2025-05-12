import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { useMemo } from 'react';

import {
    Download,
    CheckCircle,
    XCircle,
    Search,
    Bell,
    User,
    Calendar,
    FileText,
    List,
    MoreVertical
} from 'lucide-react';

import './pharma.css';

const PharmacistDashboard = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/pharmacist/medicines');

            // Check if the response data is valid
            if (!response.data) {
                throw new Error('No data received from the server');
            }

            const data = response.data;
            console.log("I received something from medicine");

            // Ensure data is an array before mapping
            if (!Array.isArray(data)) {
                throw new Error('Expected an array of prescriptions, but received something else');
            }

            const formattedPrescriptions = data.map(pres => {
                // Check if all medicines are "Provided"
                const allMedicinesProvided = pres.medicines?.every(med => med.status === "Provided");

                return {
                    id: pres.prescriptionId,
                    patientName: pres.patient.name,
                    patientId: pres.patient.email,
                    doctorName: pres.doctor.name,
                    date: new Date().toISOString().split('T')[0],
                    status: allMedicinesProvided ? 'Approved' : 'Pending', // ✅ Update status if all medicines are provided
                    urgency: 'Medium',
                    medicines: pres.medicines ? pres.medicines.map(med => ({
                        id: med.id,
                        name: med.name,
                        dosage: med.dosage,
                        duration: med.duration,
                        status: med.status
                    })) : [] // ✅ Ensures medicines is always an array
                };
            });

            setPrescriptions(formattedPrescriptions);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            setError('Failed to fetch prescriptions. Please try again later.');
        }
    };

    const filteredPrescriptions = useMemo(() => {
        return prescriptions.filter(prescription => {
            const matchesSearch =
                prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = !statusFilter || prescription.status === statusFilter.value;
            const matchesDate = !dateFilter ||
                new Date(prescription.date).toDateString() === dateFilter.toDateString();
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [prescriptions, searchTerm, statusFilter, dateFilter]);

    const statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' }
    ];

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#3B82F6' : provided.borderColor,
            boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : provided.boxShadow,
            '&:hover': {
                borderColor: '#3B82F6'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3B82F6' : provided.backgroundColor,
            color: state.isSelected ? 'white' : provided.color,
            '&:hover': {
                backgroundColor: state.isSelected ? '#3B82F6' : '#E5E7EB'
            }
        })
    };

    const processMedication = async (prescriptionId, medicationId) => {
        try {
            // Immediately update the UI before making API call
            setPrescriptions(prevPrescriptions =>
                prevPrescriptions.map(prescription => {
                    if (prescription.id === prescriptionId) {
                        const updatedMedications = prescription.medicines.map(med =>
                            med.id === medicationId ? { ...med, status: "Processing" } : med
                        );
                        return { ...prescription, medicines: updatedMedications };
                    }
                    return prescription;
                })
            );

            // Make API call to update medicine status in the database
            const response = await axios.put("http://localhost:5000/api/auth/update-medicine-status", {
                prescriptionId,
                medicineId: medicationId
            });

            if (response.status === 200) {
                // After successful API response, set status to "Provided"
                setPrescriptions(prevPrescriptions =>
                    prevPrescriptions.map(prescription => {
                        if (prescription.id === prescriptionId) {
                            const updatedMedications = prescription.medicines.map(med =>
                                med.id === medicationId ? { ...med, status: "Provided" } : med
                            );
                            const allProcessed = updatedMedications.every(med => med.status === "Provided");
                            return {
                                ...prescription,
                                medicines: updatedMedications,
                                status: allProcessed ? "Approved" : prescription.status
                            };
                        }
                        return prescription;
                    })
                );
            }
        } catch (error) {
            console.error("❌ Error processing medicine:", error);
            alert("Failed to process the medicine.");

            // Revert status back to "Pending" if API fails
            setPrescriptions(prevPrescriptions =>
                prevPrescriptions.map(prescription => {
                    if (prescription.id === prescriptionId) {
                        const updatedMedications = prescription.medicines.map(med =>
                            med.id === medicationId ? { ...med, status: "Pending" } : med
                        );
                        return { ...prescription, medicines: updatedMedications };
                    }
                    return prescription;
                })
            );
        }
    };


    const PrescriptionDetailModal = ({ prescription, onClose }) => (
        <div className="prescription-modal">
            {/* ✅ Scrollable modal content */}
            <div className="prescription-modal-content">
                <div className="scrollable-modal-content">
                    <h2>Prescription Details</h2>
                    <div className="prescription-details">
                        <div className="detail-section">
                            <User size={20} /> <span>Patient: {prescription.patientName}</span>
                        </div>
                        <div className="detail-section">
                            <Calendar size={20} /> <span>Date: {prescription.date}</span>
                        </div>
                        <div className="detail-section">
                            <FileText size={20} /> <span>Doctor: {prescription.doctorName}</span>
                        </div>
                        <div className="medications-list">
                            <h3>Medications</h3>
                            {prescription.medicines && prescription.medicines.length > 0 ? (
                                prescription.medicines.map(med => (
                                    <div key={med.id} className="medication-item">
                                        <span>{med.name}</span>
                                        <span>{med.dosage}</span>
                                        <span>{med.duration}</span>

                                        {med.status === "Pending" && (
                                            <button
                                                className="process-med-btn"
                                                onClick={() => processMedication(prescription.id, med.id)}
                                            >
                                                Process
                                            </button>
                                        )}

                                        {med.status === "Provided" && (
                                            <span className="processed-indicator">
                                                <CheckCircle size={16} /> Processed
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No medicines available.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="close-modal-btn">Close</button>
                </div>
            </div>
        </div>
    );



    return (
        <div className="pharmacist-dashboard">
            <header className="dashboard-header">
                <h1>Pharmacist Management System</h1>
                <div className="header-actions">
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            <div className="dashboard-filters">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select
                    options={statusOptions}
                    placeholder="Filter by Status"
                    onChange={(selected) => setStatusFilter(selected)}
                    isClearable
                    value={statusFilter}
                    styles={customSelectStyles}
                    className="react-select-container"
                />

                <DatePicker
                    selected={dateFilter}
                    onChange={(date) => setDateFilter(date)}
                    placeholderText="Filter by Date"
                    isClearable
                    className="date-picker-input"
                />
            </div>

            <div className="prescriptions-table">
                <table>
                    <thead>
                        <tr>
                            <th>Prescription ID</th>
                            <th>Patient Name</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPrescriptions.map(prescription => (
                            <tr key={prescription.id}>
                                <td>{prescription.id}</td>
                                <td>{prescription.patientName}</td>
                                <td>{prescription.doctorName}</td>
                                <td>{prescription.date}</td>
                                <td>
                                    <span className={`status-badge ${prescription.status.toLowerCase()}`}>
                                        {prescription.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => setSelectedPrescription(prescription)}>
                                            <List />
                                        </button>
                                        <button>
                                            <MoreVertical />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedPrescription && (
                <PrescriptionDetailModal
                    prescription={selectedPrescription}
                    onClose={() => setSelectedPrescription(null)}
                />
            )}
        </div>
    );
};

export default PharmacistDashboard;