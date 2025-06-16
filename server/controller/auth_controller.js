const { Doctor, Patient, Appointment, Admin, Claim, Prescription, LabAttendee, Pharmacist, LabTest, Medicine, InsuranceCompany, PendingConfirmation } = require('../models/user_models');

const mongoose = require('mongoose');
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const { admin, db } = require("../firebaseAdmin");
const bcrypt = require("bcrypt");
// Patient Controllers
const addPatient = async (req, res) => {
    try {
        const { email, insuranceCompanyName } = req.body;
        // Ensure required fields are provided (adjust according to your schema)
        const patient = new Patient({
            email,
            insuranceProvider: insuranceCompanyName,
            name: "Default Name", // Temporary value; collect this in the form if required
            password: "tempPassword" // Temporary value; adjust as per your auth flow
        });
        await patient.save();
        res.status(201).json({ message: 'Patient email saved successfully', patient });
    } catch (error) {
        console.error('Error saving patient email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const addcardPatient = async (req, res) => {
    try {
        const { email, insuranceCompanyName, insuranceCardFront, insuranceCardBack } = req.body;

        console.log("Received data:", req.body); // Log the received data

        // Check if the patient already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            console.error("Patient already exists:", existingPatient);
            return res.status(400).json({ message: 'Patient already exists' });
        }

        // Create a new patient entry
        const newPatient = new Patient({
            email,
            insuranceProvider: insuranceCompanyName,
            insuranceCardFront,
            insuranceCardBack,
            name: "Default Name",       // Placeholder, you may update this
        });

        await newPatient.save();
        console.log("Patient saved successfully:", newPatient);
        res.status(201).json({ message: 'Patient data saved successfully', patient: newPatient });
    } catch (error) {
        console.error("Error saving patient data:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ message: `Server error while saving patient data: ${error.message}` });
    }
};


const getPatientDetails = async (req, res) => {
    try {
        const { email } = req.query;
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { email, insuranceProvider, ...updatedFields } = req.body;

        // Update patient details, including insurance provider
        const patient = await Patient.findOneAndUpdate(
            { email },
            { ...updatedFields, insuranceProvider },  // ✅ Now updating insurance provider
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.status(200).json({ message: 'Patient details updated', patient });
    } catch (error) {
        console.error('Error updating patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// auth_controller.js
const getInsuranceCompanies = async (req, res) => {
    try {
        const companies = await InsuranceCompany.find({}, 'name');
        res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching insurance companies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Doctor Controllers
const getDoctorDetails = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.status(200).json({
            name: doctor.name || '',
            specialization: doctor.specialization || '',
            education: doctor.education || '',
            services: doctor.services || [],
            profilePicture: doctor.profilePicture || null,
            gender: doctor.gender || 'Male',
            consultationFee: doctor.consultationFee || 0,
            yearOfExperience: doctor.yearOfExperience || 0, // Added yearOfExperience
        });
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getDoctorProfile = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.status(200).json({
            name: doctor.name || 'N/A',
            specialization: doctor.specialization || 'N/A',
            contactNumber: doctor.contactNumber || 'N/A',
            profilePicture: doctor.profilePicture || null
        });
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const { email, ...updatedFields } = req.body;
        const updatedDoctor = await Doctor.findOneAndUpdate({ email }, updatedFields, { new: true, upsert: true });

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ message: 'Doctor profile updated successfully', doctor: updatedDoctor });
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const saveAppointmentSlot = async (req, res) => {
    try {
        const { doctorEmail, date, startTime, endTime } = req.body;

        // Validate required fields
        if (!doctorEmail || !date || !startTime || !endTime) {
            return res.status(400).json({ error: "Doctor email, date, start time, and end time are required." });
        }

        // Fetch doctor's details from the database
        const doctor = await Doctor.findOne({ email: doctorEmail });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found." });
        }

        // Convert time to comparable format
        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(`${date}T${endTime}:00`);

        // Check for overlapping slots
        const overlappingSlot = await Appointment.findOne({
            doctorEmail,
            date,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlaps
                { startTime: { $eq: startTime }, endTime: { $eq: endTime } }, // Exact match
            ],
        });

        if (overlappingSlot) {
            return res.status(400).json({ error: "This time slot overlaps with an existing appointment." });
        }

        // Create and save the appointment
        const newAppointment = new Appointment({
            doctorEmail,
            doctorName: doctor.name,
            date,
            startTime,
            endTime,
            consultationFee: doctor.consultationFee,
            status: "Available",
        });

        await newAppointment.save();

        res.status(201).json({
            message: "Appointment slot saved successfully.",
            appointment: newAppointment,
        });
    } catch (error) {
        console.error("Error saving appointment slot:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


const getAvailableSlots = async (req, res) => {
    try {
        const { doctorEmail } = req.query;

        const query = doctorEmail ? { doctorEmail, status: "Available" } : { status: "Available" };
        const availableSlots = await Appointment.find(query);

        if (!availableSlots || availableSlots.length === 0) {
            return res.status(404).json({ error: "No available slots found." });
        }

        res.status(200).json(availableSlots);
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


const removeExpiredSlots = async () => {
    try {
        const now = new Date();
        await Appointment.deleteMany({
            $or: [
                { date: { $lt: now } },
                { date: now, endTime: { $lte: now.toTimeString().slice(0, 5) } },
            ],
        });
        console.log("Expired slots removed successfully.");
    } catch (error) {
        console.error("Error removing expired slots:", error);
    }
};


const removePastAppointments = async (req, res) => {
    try {
        const now = new Date(); // Current date and time
        await Appointment.deleteMany({
            $or: [
                { date: { $lt: now } }, // Past dates
                { date: now, endTime: { $lte: now.toTimeString().slice(0, 5) } }, // Same date but past time
            ],
        });

        res.status(200).json({ message: "Past appointments removed successfully." });
    } catch (error) {
        console.error("Error removing past appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};



const getCategorizedSlots = async (req, res) => {
    try {
        const { doctorEmail } = req.query;
        if (!doctorEmail) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const slots = await Appointment.find({ doctorEmail, status: "Available" });

        const categorizedSlots = {
            today: slots.filter(slot =>
                new Date(slot.date).toDateString() === today.toDateString()),
            tomorrow: slots.filter(slot =>
                new Date(slot.date).toDateString() === tomorrow.toDateString()),
            future: slots.filter(slot =>
                new Date(slot.date) > tomorrow),
        };

        res.status(200).json(categorizedSlots);
    } catch (error) {
        console.error("Error fetching categorized slots:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

//Patient Appointment selection

const findDoctorEmail = async (req, res) => {
    try {
        const { name, specialization, gender, yearOfExperience } = req.query;
        const doctor = await Doctor.findOne({
            name,
            specialization,
            gender,
            yearOfExperience,
        });
        if (doctor) {
            return res.json({ email: doctor.email });
        }
        return res.status(404).json({ error: "Doctor not found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch doctor email" });
    }
};


const getAvailableDoctorAppointments = async (req, res) => {
    try {
        const { doctorEmail } = req.query;

        if (!doctorEmail) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        const appointments = await Appointment.find({ doctorEmail, status: "Available" });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ error: "No available appointments found for this doctor." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching doctor's available appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const bookAppointment = async (req, res) => {
    try {
        const { doctorEmail, date, startTime, patientEmail, patientName } = req.body;

        // Validate required fields
        if (!doctorEmail || !date || !startTime || !patientEmail || !patientName) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Find the appointment slot
        const appointment = await Appointment.findOneAndUpdate(
            { doctorEmail, date, startTime, status: "Available" },
            {
                patientEmail,
                patientName,
                status: "Pending",
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ error: "Slot not available for booking." });
        }

        res.status(200).json({ message: "Appointment booked successfully.", appointment });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getPatientAppointments = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Patient email is required." });
        }

        // Fetch appointments with status Pending or Confirmed
        const appointments = await Appointment.find({
            patientEmail: email,
            status: { $in: ["Pending", "Confirmed"] },
        });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found for this patient." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getFutureAppointments = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Patient email is required." });
        }

        const today = new Date();

        // Fetch appointments with future dates
        const appointments = await Appointment.find({
            patientEmail: email,
            date: { $gte: today },
        });

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No future appointments found." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching future appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ error: "Appointment ID is required." });
        }

        // Find the appointment by its ID
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }

        const appointmentDate = new Date(appointment.date);
        const currentDate = new Date();

        const timeDifference = (appointmentDate - currentDate) / (1000 * 60 * 60); // Difference in hours

        // Check if the appointment is within 24 hours
        if (timeDifference < 24) {
            return res.status(400).json({
                error: "Appointments cannot be canceled within 24 hours of the scheduled time.",
            });
        }

        // Update the appointment status and clear patient details
        appointment.status = "Available";
        appointment.patientEmail = null;
        appointment.patientName = null;

        // Save the updated appointment
        await appointment.save();

        res.status(200).json({ message: "Appointment successfully canceled." });
    } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};



const rescheduleAppointment = async (req, res) => {
    try {
        const { currentAppointmentId } = req.body;

        if (!currentAppointmentId) {
            return res.status(400).json({ error: "Appointment ID is required for rescheduling." });
        }

        const currentAppointment = await Appointment.findById(currentAppointmentId);

        if (!currentAppointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }

        const currentDate = new Date();
        const appointmentDate = new Date(currentAppointment.date);
        const timeDifference = (appointmentDate - currentDate) / (1000 * 60 * 60); // Difference in hours

        if (timeDifference < 24) {
            return res.status(400).json({
                error: "Appointments cannot be rescheduled within 24 hours of the scheduled time.",
            });
        }

        // Update the current appointment slot
        currentAppointment.status = "Available";
        currentAppointment.patientEmail = null;
        currentAppointment.patientName = null;

        await currentAppointment.save();

        res.status(200).json({
            message: "Your appointment has been successfully rescheduled. You can now book a new slot.",
        });
    } catch (error) {
        console.error("Error rescheduling appointment:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};



const checkUserType = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user is an Admin
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(200).json({ userType: 'admin' });
        }

        // Check if the user is a Doctor
        const doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(200).json({ userType: 'doctor' });
        }

        // Check if the user is a Patient
        const patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(200).json({ userType: 'patient' });
        }

        // Check if the user is a Pharmacist
        const pharmacist = await Pharmacist.findOne({ email });
        if (pharmacist) {
            return res.status(200).json({ userType: 'pharmacist' });
        }

        // Check if the user is a Lab Attendee
        const labAttendee = await LabAttendee.findOne({ email });
        if (labAttendee) {
            return res.status(200).json({ userType: 'labAttendee' });
        }

        // Check if the user is an Insurance Company
        const insuranceCompany = await InsuranceCompany.findOne({ email });
        if (insuranceCompany) {
            return res.status(200).json({ userType: 'insuranceCompany' });
        }

        res.status(404).json({ message: 'Email not found' });
    } catch (error) {
        console.error('Error checking user type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





const fetchFuturePendingAndConfirm = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/auth/get-future-pending-and-confirm", {
            params: { email },
        });

        setAppointments(response.data); // Update state with the fetched appointments
    } catch (error) {
        console.error("Error fetching future appointments:", error.response?.data || error.message);
        toast.error("Failed to fetch future appointments.");
    }
};




//doctor confirming the appointment
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorEmail } = req.query;

        if (!doctorEmail) {
            return res.status(400).json({ error: "Doctor email is required." });
        }

        // Fetch pending appointments
        const pendingAppointments = await Appointment.find({
            doctorEmail,
            status: "Pending",
        });

        // Fetch confirmed appointments
        const futureAppointments = await Appointment.find({
            doctorEmail,
            status: "Confirmed",
        });

        res.status(200).json({
            pendingAppointments,
            futureAppointments,
        });
    } catch (error) {
        console.error("Error fetching doctor's appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
const updateAppointmentStatus = async (req, res) => {
    try {
        console.log("Request received for updating appointment status:", req.body);

        const { appointmentId, status } = req.body;

        if (!appointmentId || !status) {
            return res.status(400).json({ error: 'Appointment ID and status are required.' });
        }

        const updateFields = { status };

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            updateFields,
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        console.log("Updated Appointment:", updatedAppointment);

        res.status(200).json({
            message: 'Appointment updated successfully.',
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getFuturePendingAndConfirmAppointments = async (req, res) => {
    try {
        console.log("Request Params:", req.query); // Debug
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Patient email is required." });
        }

        const today = new Date();

        // Fetch appointments
        const appointments = await Appointment.find({
            patientEmail: email,
            date: { $gte: today },
            status: { $in: ["Pending", "Confirmed"] },
        });

        console.log("Fetched Appointments:", appointments); // Debug

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "No future appointments found." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching future appointments:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


// prescription

const savePrescription = async (req, res) => {
    try {
        const {
            patientEmail,
            patientAge,
            patientGender,
            doctorEmail,
            diagnosis,
            symptoms,
            medications,
            labTests,
            advice,
            followUpDate
        } = req.body;


        // Validate required fields
        if (!patientEmail || !patientAge || !patientGender || !diagnosis) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(patientEmail)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Check if patient exists in the database
        const patient = await Patient.findOne({ email: patientEmail });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found in the database." });
        }

        // Verify if patient age and gender match
        if (patient.age !== parseInt(patientAge) || patient.gender !== patientGender) {
            return res.status(400).json({ message: "Patient details do not match the records." });
        }

        // Create a new prescription
        const newPrescription = new Prescription({
            patientEmail,
            patientAge,
            patientGender,
            doctorEmail,
            diagnosis,
            symptoms,
            medicines: medications,
            labTests: labTests,
            advice,
            followUpDate,
            dateIssued: new Date()
        });

        await newPrescription.save();

        // Create insurance claim
        const doctor = await Doctor.findOne({ email: doctorEmail });

        if (!doctor || !patient) {
            return res.status(404).json({ message: "Doctor or Patient not found" });
        }

        const newClaim = new Claim({
            prescriptionId: newPrescription._id,
            doctorEmail: doctor.email,
            doctorName: doctor.name,
            doctorFee: doctor.consultationFee,
            doctorSpecialization: doctor.specialization,
            patientEmail: patient.email,
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientBloodGroup: patient.bloodGroup,
            patientContactNumber: patient.contactNumber,
            totalAmount: doctor.consultationFee,
            claimStatus: 'Pending',
            consultancyDate: new Date(),
            insuranceCompanyName: patient.insuranceProvider,
            insuranceCardFront: patient.insuranceCardFront,
            insuranceCardBack: patient.insuranceCardBack,
            medicines: [],
            labTests: []
        });

        await newClaim.save();

        res.status(201).json({
            message: "Prescription saved successfully!",
            prescription: newPrescription,
            claim: newClaim
        });

    } catch (error) {
        console.error("Error saving prescription:", error);
        res.status(500).json({ message: "Failed to save prescription." });
    }

};

const checkPrescription_before = async (req, res) => {
    const { doctorEmail, patientEmail, date } = req.query;

    try {
        const prescription = await Prescription.findOne({
            doctorEmail,
            patientEmail,
            dateIssued: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // Start of the day (00:00:00.000)
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999)) // End of the day (23:59:59.999)
            }
        });

        res.status(200).json({ exists: !!prescription });
    } catch (error) {
        console.error("Error checking prescription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const checkPrescription = async (req, res) => {
    const { doctorEmail, patientEmail, date } = req.query;

    try {
        const prescription = await Prescription.findOne({
            doctorEmail,
            patientEmail,
            dateIssued: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)), // Start of the day (00:00:00.000)
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999)) // End of the day (23:59:59.999)
            }
        });

        if (!prescription) {
            alert("Plaese save the Prescription first!!")
            return res.status(404).json({ exists: false });
        }

        res.status(200).json({ exists: true, prescriptionId: prescription._id });
    } catch (error) {
        console.error("Error checking prescription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createLabTests = async (req, res) => {
    const { prescriptionId, labTests } = req.body;

    try {
        const savedLabTests = await LabTest.create({
            prescriptionId,
            labTests
        });

        res.status(201).json({ message: "Lab tests saved successfully!", data: savedLabTests });
    } catch (error) {
        console.error("Error saving lab tests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const checkLabTests = async (req, res) => {
    const { prescriptionId } = req.query;

    try {
        const labTests = await LabTest.findOne({ prescriptionId });

        if (labTests) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking lab tests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createPharmacyRequest = async (req, res) => {
    try {
        const {
            prescriptionId,
            doctorEmail,
            doctorName,
            patientEmail,
            patientAge,
            patientGender,
            diagnosis,
            medications,
            advice,
            date
        } = req.body;

        // Validate required fields
        if (!prescriptionId || !doctorEmail || !patientEmail || !medications.length) {
            return res.status(400).json({ message: "Prescription ID, doctor email, patient email, and at least one medication are required." });
        }

        // Check if the prescription exists
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ message: "Prescription not found. Please save the prescription first." });
        }

        // Create and save the pharmacy request
        const newPharmacyRequest = new Medicine({
            prescriptionId,
            medicines: medications.map(med => ({
                medicineName: med.name,
                dosage: med.dosage,
                duration: med.duration,
                status: "Pending" // Default status
            }))
        });

        await newPharmacyRequest.save();

        res.status(201).json({ message: "Pharmacy request created successfully!", data: newPharmacyRequest });
    } catch (error) {
        console.error("Error creating pharmacy request:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const checkMedicines = async (req, res) => {
    const { prescriptionId } = req.query;

    try {
        const medicines = await Medicine.findOne({ prescriptionId });

        if (medicines) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking medicines:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};






//////////   pharmacist
const getPharmacistMedicines = async (req, res) => {
    try {
        // Fetch all medicines and populate the prescriptionId field
        const medicines = await Medicine.find().populate('prescriptionId');

        if (!medicines.length) {
            return res.status(404).json({ message: 'No medicines found' });
        }

        // Extract unique prescription IDs
        const prescriptionIds = [...new Set(medicines.map(med => med.prescriptionId?._id.toString()))];

        // Fetch prescriptions with populated doctor and patient emails
        const prescriptions = await Prescription.find({ _id: { $in: prescriptionIds } });

        if (!prescriptions.length) {
            return res.status(404).json({ message: 'No prescriptions found for these medicines' });
        }

        // Extract unique doctor and patient emails
        const doctorEmails = [...new Set(prescriptions.map(pres => pres.doctorEmail))];
        const patientEmails = [...new Set(prescriptions.map(pres => pres.patientEmail))];

        // Fetch doctor details
        const doctors = await Doctor.find({ email: { $in: doctorEmails } });
        const doctorMap = doctors.reduce((acc, doctor) => {
            acc[doctor.email] = { name: doctor.name, specialization: doctor.specialization };
            return acc;
        }, {});

        // Fetch patient details
        const patients = await Patient.find({ email: { $in: patientEmails } });
        const patientMap = patients.reduce((acc, patient) => {
            acc[patient.email] = { name: patient.name, age: patient.age, gender: patient.gender };
            return acc;
        }, {});

        // Construct response data
        const result = medicines.map(med => {
            const prescription = prescriptions.find(pres => pres._id.toString() === med.prescriptionId?._id.toString());
            if (!prescription) return null; // Skip if no prescription found

            return {
                _id: med._id, // Add medicine ID
                prescriptionId: prescription._id,
                doctor: doctorMap[prescription.doctorEmail] || { name: "Unknown", specialization: "Unknown" },
                patient: patientMap[prescription.patientEmail] || { name: "Unknown", age: "N/A", gender: "N/A" },
                medicines: med.medicines.map(medItem => ({  // ✅ Correctly fetch medicines
                    id: medItem._id,
                    name: medItem.medicineName,
                    dosage: medItem.dosage,
                    duration: medItem.duration,
                    status: medItem.status
                }))
            };
        }).filter(record => record !== null); // Remove any null entries

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching medicines for pharmacist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateMedicineStatus = async (req, res) => {
    try {
        const { medicineId } = req.body;

        if (!medicineId) {
            return res.status(400).json({ error: "Medicine ID is required." });
        }

        // 1. Find the medicine entry in Medicine collection
        const medicineEntry = await Medicine.findOne({ "medicines._id": medicineId });
        if (!medicineEntry) {
            return res.status(404).json({ error: "Medicine not found in medicines collection." });
        }

        // 2. Get prescriptionId and medicine name
        const prescriptionId = medicineEntry.prescriptionId;
        const targetMedicine = medicineEntry.medicines.find(med => med._id.toString() === medicineId);
        const medicineName = targetMedicine?.medicineName;

        // 3. Update status in Medicine collection
        const updatedMedicine = await Medicine.findOneAndUpdate(
            { "medicines._id": medicineId },
            { $set: { "medicines.$.status": "Provided" } },
            { new: true }
        );

        // 4. Update corresponding medicine in Claim collection using medicineName
        const updatedClaim = await Claim.findOneAndUpdate(
            { prescriptionId, "medicines.name": medicineName },
            { $set: { "medicines.$.status": "Approved" } },
            { new: true }
        );

        // 5. Check if all medicines are approved
        if (updatedClaim) {
            const allApproved = updatedClaim.medicines.every(med => med.status === "Approved");
            if (allApproved) {
                await Claim.findByIdAndUpdate(updatedClaim._id);
            }
        }

        res.status(200).json({
            message: "Status updated successfully",
            medicine: updatedMedicine,
            claim: updatedClaim
        });

    } catch (error) {
        console.error("Error updating medicine status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


//////////////////////  lab attendant

const getLabAttendeeTests = async (req, res) => {
    try {
        console.log("✅ API HIT: /api/auth/lab-attendee-tests"); // 🔍 Log to confirm API call

        // Fetch all lab tests
        const labTests = await LabTest.find().populate('prescriptionId');
        console.log("🔍 Fetched lab tests:", labTests); // Debugging log

        if (!labTests.length) {
            console.log("⚠️ No lab tests found in DB.");
            return res.status(404).json({ message: 'No lab tests found' });
        }

        // Fetch prescriptions
        const prescriptionIds = [...new Set(labTests.map(test => test.prescriptionId?._id.toString()))];
        console.log("🔍 Prescription IDs:", prescriptionIds);

        const prescriptions = await Prescription.find({ _id: { $in: prescriptionIds } });
        console.log("🔍 Fetched prescriptions:", prescriptions);

        if (!prescriptions.length) {
            console.log("⚠️ No prescriptions found for lab tests.");
            return res.status(404).json({ message: 'No prescriptions found' });
        }

        res.status(200).json(labTests); // ✅ If successful, send response
    } catch (error) {
        console.error("❌ ERROR in getLabAttendeeTests:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// In controller (auth_controller.js)
const updateLabTestStatus = async (req, res) => {
    try {
        const { prescriptionId, testId, newStatus } = req.body;

        // 1. Update LabTest status
        const updatedLabTest = await LabTest.findOneAndUpdate(
            { "labTests._id": testId },
            { $set: { "labTests.$.status": newStatus } },
            { new: true }
        );

        if (!updatedLabTest) {
            return res.status(404).json({ error: "Lab test not found" });
        }

        // 2. Get testName from updated lab test
        const test = updatedLabTest.labTests.find(t => t._id.toString() === testId);
        if (!test) {
            return res.status(404).json({ error: "Test not found in lab tests" });
        }

        // 3. Update corresponding Claim's lab test status
        const updatedClaim = await Claim.findOneAndUpdate(
            { prescriptionId, "labTests.testName": test.testName },
            { $set: { "labTests.$.status": "Approved" } },
            { new: true }
        );

        res.status(200).json({
            message: "Status updated successfully",
            labTest: updatedLabTest,
            claim: updatedClaim
        });

    } catch (error) {
        console.error("Error updating lab test status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getLabTestsByPrescriptionId = async (req, res) => {
    try {
        const { prescriptionId } = req.query;

        if (!prescriptionId) {
            return res.status(400).json({ error: "Prescription ID is required." });
        }

        // Find the lab test for this prescription
        const labTest = await LabTest.findOne({ prescriptionId }).populate('prescriptionId');

        if (!labTest) {
            return res.status(404).json({ error: "No lab tests found for this prescription." });
        }

        // Get prescription details
        const prescription = labTest.prescriptionId;

        // Get doctor and patient details
        const doctor = await Doctor.findOne({ email: prescription.doctorEmail });
        const patient = await Patient.findOne({ email: prescription.patientEmail });

        const result = {
            id: labTest._id.toString(),
            prescriptionId: prescription._id.toString(),
            patientName: patient?.name || "Unknown Patient",
            patientId: patient?._id.toString() || "Unknown",
            doctorName: doctor?.name || "Unknown Doctor",
            labAttendee: "Assigned Lab Attendee", // Consider adding this to your schema
            date: prescription.dateIssued.toISOString().split('T')[0],
            status: labTest.labTests.every(test => test.status === "Completed") ? "Processed" : "Processing",
            urgency: prescription.urgency || "Normal", // Consider adding this to your schema
            labTests: labTest.labTests.map(test => ({
                id: test._id.toString(),
                testName: test.testName,
                type: "Lab Test", // Consider adding this to your schema if you need test types
                status: test.status,
                comments: test.comments || ""
            }))
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching lab tests by prescription ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPatientName = async (req, res) => {
    try {
        const { email } = req.query;
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.status(200).json({
            name: patient.name || email, // Return the patient's name or email if name is not available
            email: patient.email,
            age: patient.age,
            gender: patient.gender
        });
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



/////////  claim

// Fetch claim by prescription ID (fixed to prevent CastError)
const getClaimByPrescriptionId = async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        // Validate ObjectId before querying
        if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
            return res.status(400).json({ message: "Invalid Prescription ID format" });
        }

        const claim = await Claim.findOne({ prescriptionId: new mongoose.Types.ObjectId(prescriptionId) });

        if (!claim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.json(claim);
    } catch (error) {
        console.error("Error fetching claim:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const createLabTestsAndUpdateClaim = async (req, res) => {
    try {
        const { prescriptionId, labTests } = req.body;

        if (!prescriptionId || !labTests || labTests.length === 0) {
            return res.status(400).json({ error: "PrescriptionId and labTests are required." });
        }

        // Step 1: Save the lab tests in LabTest schema
        const savedLabTests = await LabTest.create({
            prescriptionId,
            labTests: labTests.map(test => ({
                testName: test,
                status: "Pending"
            }))
        });

        console.log("✅ Lab tests saved successfully.");

        // Step 2: Check if a claim exists for the prescription
        const existingClaim = await Claim.findOne({ prescriptionId });

        if (!existingClaim) {
            console.log("⚠️ No existing claim found for this prescription.");
            return res.status(200).json({
                message: "Lab tests saved, but no claim exists for this prescription."
            });
        }

        // Step 3: Ensure claim exists before processing lab test fees
        if (existingClaim.labTests.length === 0) {
            console.log("✅ Claim found but no lab tests exist. Updating claim...");

            // **🔹 File Path for Lab Test Fees**
            const filePath = path.join(__dirname, '../data/lab_tests.xlsx');

            // **🔹 Check if the file exists**
            if (!fs.existsSync(filePath)) {
                console.error("❌ Lab test fee file not found:", filePath);
                return res.status(500).json({ error: "Lab test fee file not found." });
            }

            try {
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // **🔹 Convert Excel Data into an Object { testName: fee }**
                const testFees = {};
                jsonData.slice(1).forEach(row => {
                    if (row.length >= 2) {
                        const testName = row[0].trim();
                        const testFee = parseFloat(row[1]);
                        if (!isNaN(testFee)) {
                            testFees[testName] = testFee;
                        }
                    }
                });

                console.log("📄 Lab test fees loaded:", testFees);

                // Step 4: Calculate Total Lab Test Fee
                let totalLabTestFee = 0;

                existingClaim.labTests = labTests.map(test => {
                    const testFee = testFees[test] || 0; // Default fee 0 if not found
                    totalLabTestFee += testFee;
                    return {
                        testName: test,
                        testFee: testFee,
                        status: "Pending"
                    };
                });

                // **🔹 Add Lab Test Fees to Total Amount**
                existingClaim.totalAmount += totalLabTestFee;

                await existingClaim.save();
                console.log("✅ Claim updated with lab tests, fees, and total amount updated.");

                return res.status(200).json({
                    message: "Lab tests saved and claim updated with fees and total amount.",
                    savedLabTests,
                    updatedClaim: existingClaim
                });
            } catch (error) {
                console.error("❌ Error reading lab_tests.xlsx file:", error);
                return res.status(500).json({ error: "Error reading lab test price file." });
            }
        }

        return res.status(200).json({
            message: "Lab tests saved, but claim already had lab tests.",
            savedLabTests
        });

    } catch (error) {
        console.error("❌ Error in createLabTestsAndUpdateClaim:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};



const createPharmacyRequestAndUpdateClaim = async (req, res) => {
    try {
        const { prescriptionId, medicines } = req.body;

        if (!prescriptionId || !medicines || medicines.length === 0) {
            return res.status(400).json({ error: "PrescriptionId and medicines are required." });
        }

        // Step 1: Save the medicines in the Medicine schema
        const savedMedicines = await Medicine.create({
            prescriptionId,
            medicines: medicines.map(med => ({
                medicineName: med.name,
                dosage: med.dosage,
                duration: med.duration,
                status: "Pending"
            }))
        });

        console.log("✅ Medicines saved successfully.");

        // Step 2: Check if a claim exists for the prescription
        const existingClaim = await Claim.findOne({ prescriptionId });

        if (!existingClaim) {
            console.log("⚠️ No existing claim found for this prescription.");
            return res.status(200).json({
                message: "Medicines saved, but no claim exists for this prescription."
            });
        }

        // Step 3: Ensure the claim exists before processing medicine fees
        if (existingClaim.medicines.length === 0) {
            console.log("✅ Claim found but no medicines exist. Updating claim...");

            // **🔹 File Path for Medicine Fees**
            const filePath = path.join(__dirname, '../data/medicines.xlsx');

            // **🔹 Check if the file exists**
            if (!fs.existsSync(filePath)) {
                console.error("❌ Medicine fee file not found:", filePath);
                return res.status(500).json({ error: "Medicine fee file not found." });
            }

            try {
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // **🔹 Convert Excel Data into an Object { medicineName: fee }**
                const medicineFees = {};
                jsonData.slice(1).forEach(row => {
                    if (row.length >= 2) {
                        const medicineName = row[0].trim();
                        const medicineFee = parseFloat(row[1]);
                        if (!isNaN(medicineFee)) {
                            medicineFees[medicineName] = medicineFee;
                        }
                    }
                });

                console.log("📄 Medicine fees loaded:", medicineFees);

                // Step 4: Calculate Total Medicine Fee
                let totalMedicineFee = 0;

                existingClaim.medicines = medicines.map(med => {
                    const medicineFee = medicineFees[med.name] || 0; // Default fee 0 if not found
                    totalMedicineFee += medicineFee;
                    return {
                        name: med.name,
                        fee: medicineFee,
                        status: "Pending"
                    };
                });

                // **🔹 Add Medicine Fees to Total Amount**
                existingClaim.totalAmount += totalMedicineFee;

                await existingClaim.save();
                console.log("✅ Claim updated with medicines, fees, and total amount updated.");

                return res.status(200).json({
                    message: "Medicines saved and claim updated with fees and total amount.",
                    savedMedicines,
                    updatedClaim: existingClaim
                });
            } catch (error) {
                console.error("❌ Error reading medicines.xlsx file:", error);
                return res.status(500).json({ error: "Error reading medicine price file." });
            }
        }

        return res.status(200).json({
            message: "Medicines saved, but claim already had medicines.",
            savedMedicines
        });

    } catch (error) {
        console.error("❌ Error in createPharmacyRequestAndUpdateClaim:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};



















////////////////////////  admin 

//contoller for the admin dashboard

//get user count
const getUserCounts = async (req, res) => {
    try {
        const doctorCount = await Doctor.countDocuments();
        const patientCount = await Patient.countDocuments();
        const labAttendeeCount = await LabAttendee.countDocuments();
        const pharmacistCount = await Pharmacist.countDocuments();
        const insuranceCompanyCount = await InsuranceCompany.countDocuments();

        res.json({
            doctorCount,
            patientCount,
            labAttendeeCount,
            pharmacistCount,
            insuranceCompanyCount

        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching counts' });
    }
};

//get appointemnt count
const getAppointmentCounts = async (req, res) => {
    try {
        // Fetch the total count of appointments
        const appointmentCount = await Appointment.countDocuments();

        // Fetch the count of appointments with status 'Available'
        const availableCount = await Appointment.countDocuments({ status: 'Available' });

        // Fetch the count of appointments with status 'Pending'
        const pendingCount = await Appointment.countDocuments({ status: 'Pending' });

        // Fetch the count of appointments with status 'Confirmed'
        const confirmedCount = await Appointment.countDocuments({ status: 'Confirmed' });

        // Return the counts as a response
        res.json({
            appointmentCount,
            availableCount,
            pendingCount,
            confirmedCount
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching appointment counts' });
    }
};
const getUsers = async (req, res) => {
    try {
        let users;
        const type = req.query.type;

        if (type === "doctors") {
            users = await Doctor.find({}, "_id name ");
        } else if (type === "patients") {
            users = await Patient.find({}, "_id name");
        } else if (type === "labAttendees") {
            users = await LabAttendee.find({}, "_id name");
        } else if (type === "pharmacists") {
            users = await Pharmacist.find({}, "_id name");
        }
        else if (type === "insuranceCompany") {
            users = await InsuranceCompany.find({}, "_id name");
        }
        else {
            return res.status(400).json({ message: "Invalid entity type" });
        }

        // Convert _id to id
        const formattedUsers = users.map(user => ({
            id: user._id,  // Convert _id to id
            name: user.name,
            qualification: user.qualification, // Only exists for doctors
            //only exist for insurance company
            registrationNumber: user.registrationNumber,
            contactNumber: user.contactNumber,
        }));
        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};


const removeUser = async (req, res) => {
    try {
        const { id, role } = req.params;
        console.log(`Received request to delete ${role} with ID: ${id}`);

        if (!id || !role) {
            return res.status(400).json({ error: "User ID and role are required" });
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid User ID format" });
        }

        const modelMapping = {
            doctor: Doctor,
            patient: Patient,
            pharmacist: Pharmacist,
            lab_attendee: LabAttendee,
            insuranceCompany: InsuranceCompany,
        };

        const Model = modelMapping[role];

        if (!Model) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // 🔹 Find user in MongoDB
        const user = await Model.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userEmail = user.email; // Extract email from MongoDB

        // 🔹 Delete from MongoDB
        await Model.findByIdAndDelete(id);
        console.log(`Deleted user from MongoDB: ${id}`);

        // 🔹 Delete from Firestore (Find document by email)
        if (userEmail) {
            const snapshot = await db.collection("users").where("email", "==", userEmail).get();
            if (!snapshot.empty) {
                const batch = db.batch();
                snapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Deleted Firestore document from 'users' collection for email: ${userEmail}`);
            } else {
                console.warn(`No Firestore document found for email: ${userEmail}`);
            }
        }

        // 🔹 Delete from Firebase Authentication
        if (userEmail) {
            try {
                const userRecord = await admin.auth().getUserByEmail(userEmail);
                await admin.auth().deleteUser(userRecord.uid);
                console.log(`Deleted user from Firebase Auth: ${userEmail}`);
            } catch (firebaseError) {
                console.warn(`User not found in Firebase Auth: ${userEmail} - ${firebaseError.message}`);
            }
        }

        res.status(200).json({ message: `${role} deleted successfully from MongoDB, Firestore ('users' collection), and Firebase Auth.` });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
};

const handleAddUser = async (req, res) => {
    try {
        const { email, password, entity, name, contact, regnumber } = req.body;

        if (!email || !password || !entity) {
            return res.status(400).json({ error: "Email, password, and entity are required." });
        }

        // ✅ Normalize entity to lowercase for case-insensitive handling
        const entityLower = entity.toLowerCase();

        // ✅ Identify the correct MongoDB model
        let EntityModel;
        if (entityLower === "doctor" || entityLower === "doctors") EntityModel = Doctor;
        else if (entityLower === "patient") EntityModel = Patient;
        else if (entityLower === "pharmacist" || entityLower === "pharmacists") EntityModel = Pharmacist;
        else if (entityLower === "labattendees") EntityModel = LabAttendee;
        else if (entityLower === "insurancecompany") EntityModel = InsuranceCompany;
        else {
            return res.status(400).json({ error: "Invalid entity type." });
        }

        // ✅ Check if user already exists in MongoDB
        const existingUserMongo = await EntityModel.findOne({ email });
        if (existingUserMongo) {
            return res.status(400).json({ error: "User already exists in MongoDB." });
        }

        // ✅ Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({ email, password });
        const uid = userRecord.uid;

        // ✅ Store user in Firestore
        const usersRef = db.collection("users");
        await usersRef.doc(uid).set({
            email,
            uid,
            entity: entityLower,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("Saving to MongoDB:", { model: EntityModel.modelName, email });

        // ✅ Prepare user data for MongoDB
        const newUserData = { email };

        if (entityLower === "doctor" || entityLower === "doctors") {
            newUserData.name = name && name.trim() ? name : "N/A"; // ✅ Default name if missing
        }
        if (entityLower === "pharmacist" || entityLower === "pharmacists") {
            newUserData.name = name && name.trim() ? name : "N/A"; // Ensure name is provided
        }
        if (entityLower === "labattendees") {
            newUserData.name = name && name.trim() ? name : "N/A"; // Ensure name is provided
        }
        if (entityLower === "insurancecompany") {
            newUserData.name = name && name.trim() ? name : "N/A";
            newUserData.contactNumber = contact && contact.trim() ? contact : "N/A";
            newUserData.registrationNumber = regnumber && regnumber.trim() ? regnumber : "N/A";
        }



        // ✅ Save user to MongoDB
        const newUser = new EntityModel(newUserData);
        try {
            await newUser.save();
            console.log("User saved successfully in MongoDB!");
        } catch (mongoError) {
            console.error("Error saving to MongoDB:", mongoError);
            return res.status(500).json({ error: "MongoDB insertion failed", details: mongoError.message });
        }

        return res.status(201).json({ message: "User added successfully!", uid });
    } catch (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({ error: "Failed to add user", details: error.message });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { entity, id } = req.params;
        console.log(entity);

        let model;
        switch (entity) {
            case 'doctors':
                model = Doctor;
                break;
            case 'patients':
                model = Patient;
                break;
            case 'pharmacists':
                model = Pharmacist;
                break;
            case 'labAttendees':
                model = LabAttendee;
                break;
            case 'insuranceCompany':
                model = InsuranceCompany;
                break;
            default:
                return res.status(400).json({ error: "Invalid entity type." });
        }

        const user = await model.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fetch confirmed appointments
const getConfirmedAppointments = async (req, res) => {
    try {
        const confirmedAppointments = await Appointment.find({ status: "Confirmed" })
            .select("_id patientName doctorName date startTime"); // Only select required fields

        res.status(200).json(confirmedAppointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments", error: error.message });
    }
};

const getClaimStats = async (req, res) => {
    try {
        console.log("Fetching claim stats..."); // Debugging log

        const total = await Claim.countDocuments({});
        const pending = await Claim.countDocuments({ insuranceStatus: "Pending" });
        const processing = await Claim.countDocuments({ insuranceStatus: "Processing" });
        const processed = await Claim.countDocuments({ insuranceStatus: "Processed" });

        res.json({ total, pending, processing, processed });
    } catch (error) {
        console.error("Error fetching claim stats:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getClaims = async (req, res) => {
    try {
        const claims = await Claim.find();
        res.status(200).json(claims);
    } catch (error) {
        console.error("Error fetching claims:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateClaimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { claimStatus } = req.body;

        const updatedClaim = await Claim.findByIdAndUpdate(id, { claimStatus }, { new: true });

        if (!updatedClaim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.json(updatedClaim);
    } catch (error) {
        res.status(500).json({ message: "Error updating claim status", error });
    }
};






















///////////   record doctor
const getDoctorMedicalRecords = async (req, res) => {
    try {
        const { doctorEmail } = req.params;

        if (!doctorEmail) {
            return res.status(400).json({
                success: false,
                message: 'Doctor email is required'
            });
        }

        console.log("Searching for claims with doctor email:", doctorEmail);

        // Use exact match first, then try case-insensitive if needed
        let doctorClaims = await Claim.find({
            doctorEmail: doctorEmail
        })
            .populate('prescriptionId')
            .sort({ createdAt: -1 });

        // If no results with exact match, try case-insensitive
        if (!doctorClaims || doctorClaims.length === 0) {
            doctorClaims = await Claim.find({
                doctorEmail: { $regex: new RegExp('^' + doctorEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
            })
                .populate('prescriptionId')
                .sort({ createdAt: -1 });
        }

        console.log(`Found ${doctorClaims.length} claims for ${doctorEmail}`);

        if (!doctorClaims || doctorClaims.length === 0) {
            // Make sure we return a consistent structure even when no records found
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'No medical records found for this doctor'
            });
        }

        // Process records to format them appropriately
        const medicalRecords = doctorClaims.map(claim => {
            return {
                id: claim._id,
                prescriptionId: claim.prescriptionId?._id || claim.prescriptionId,
                patientName: claim.patientName,
                patientEmail: claim.patientEmail,
                patientAge: claim.patientAge,
                patientGender: claim.patientGender,
                patientBloodGroup: claim.patientBloodGroup,
                patientContactNumber: claim.patientContactNumber,
                consultancyDate: claim.consultancyDate,
                claimStatus: claim.claimStatus,
                totalAmount: claim.totalAmount,
                doctorFee: claim.doctorFee,
                insuranceCompanyName: claim.insuranceCompanyName,
                medicines: claim.medicines || [],
                labTests: claim.labTests || [],
                createdAt: claim.createdAt
            };
        });

        // Return data in the EXPECTED format
        return res.status(200).json({
            success: true,
            count: medicalRecords.length,
            data: medicalRecords
        });
    } catch (error) {
        console.error('Error fetching doctor medical records:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching medical records',
            error: error.message
        });
    }
};








//////////////////  patient Record
const getPatientMedicalRecords = async (req, res) => {
    try {
        const { patientEmail } = req.params;

        console.log("=== BACKEND: Patient Records Request ===");
        console.log("Request params:", req.params);
        console.log("Patient email being searched:", patientEmail);

        if (!patientEmail) {
            console.log("ERROR: Missing patient email in request");
            return res.status(400).json({
                success: false,
                message: 'Patient email is required'
            });
        }

        // Use exact match first, then try case-insensitive if needed
        console.log("Attempting exact email match query...");
        let patientClaims = await Claim.find({
            patientEmail: patientEmail
        })
            .populate('prescriptionId')
            .sort({ createdAt: -1 });

        // If no results with exact match, try case-insensitive
        if (!patientClaims || patientClaims.length === 0) {
            console.log("No exact matches found, trying case-insensitive match...");
            patientClaims = await Claim.find({
                patientEmail: { $regex: new RegExp('^' + patientEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
            })
                .populate('prescriptionId')
                .sort({ createdAt: -1 });
        }

        console.log(`Found ${patientClaims.length} claims for ${patientEmail}`);

        if (patientClaims.length > 0) {
            console.log("Sample claim structure:", JSON.stringify(patientClaims[0], null, 2).substring(0, 300) + "...");
        }

        if (!patientClaims || patientClaims.length === 0) {
            console.log("No records found for this patient");
            // Make sure we return a consistent structure even when no records found
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'No medical records found for this patient'
            });
        }

        // Process records to format them appropriately
        console.log("Processing and formatting medical records...");
        const medicalRecords = patientClaims.map(claim => {
            const record = {
                id: claim._id,
                prescriptionId: claim.prescriptionId?._id || claim.prescriptionId,
                patientName: claim.patientName,
                patientEmail: claim.patientEmail,
                patientAge: claim.patientAge,
                patientGender: claim.patientGender,
                patientBloodGroup: claim.patientBloodGroup,
                patientContactNumber: claim.patientContactNumber,
                doctorName: claim.doctorName || (claim.prescriptionId?.doctorName || "Unknown"),
                consultancyDate: claim.consultancyDate,
                claimStatus: claim.claimStatus || "Pending",
                totalAmount: claim.totalAmount || 0,
                doctorFee: claim.doctorFee || 0,
                insuranceCompanyName: claim.insuranceCompanyName || "None",
                medicines: claim.medicines || [],
                labTests: claim.labTests || [],
                diagnosis: claim.diagnosis || (claim.prescriptionId?.diagnosis || ""),
                notes: claim.notes || (claim.prescriptionId?.notes || ""),
                createdAt: claim.createdAt
            };

            // Remove any undefined values to prevent serialization issues
            Object.keys(record).forEach(key => {
                if (record[key] === undefined) {
                    record[key] = null;
                }
            });

            return record;
        });

        console.log(`Returning ${medicalRecords.length} formatted records`);
        console.log("Response structure:", {
            success: true,
            count: medicalRecords.length,
            data: medicalRecords.length > 0 ? "[Array of records]" : "[]"
        });

        // IMPORTANT: Set the correct content type header
        res.setHeader('Content-Type', 'application/json');

        // Return data in the EXPECTED format matching frontend expectations
        return res.status(200).json({
            success: true,
            count: medicalRecords.length,
            data: medicalRecords
        });

    } catch (error) {
        console.error('Error fetching patient medical records:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching medical records',
            error: error.message
        });
    }
};




/// insuranc company

const getInsuranceDetail = async (req, res) => {
    try {
        const email = req.params.email;
        const company = await InsuranceCompany.findOne({ email });

        if (!company) {
            return res.status(404).json({ message: "Insurance company not found" });
        }

        res.json({
            name: company.name,
            email: company.email,
            contactNumber: company.contactNumber,
            address: company.address,
            registrationNumber: company.registrationNumber
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const getInsuranceClaims = async (req, res) => {
    try {
        const email = req.params.email;
        const company = await InsuranceCompany.findOne({ email });

        if (!company) {
            return res.status(404).json({ message: "Insurance company not found" });
        }

        const claims = await Claim.aggregate([
            {
                $match: {
                    insuranceCompanyName: company.name,
                    insuranceStatus: { $in: ["Pending", "Processing", "Processed"] }
                }
            },
            {
                $group: {
                    _id: "$insuranceStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" },
                    claims: { $push: "$$ROOT" }
                }
            }
        ]);

        // Convert the array to an object with status as keys
        const result = claims.reduce((acc, curr) => {
            acc[curr._id] = {
                count: curr.count,
                totalAmount: curr.totalAmount,
                claims: curr.claims
            };
            return acc;
        }, {});

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching insurance claims:', error);
        res.status(500).json({ message: "Server error", error });
    }
};

const updateClaimStatusInsurance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Processed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedClaim = await Claim.findByIdAndUpdate(
            id,
            { insuranceStatus: status },
            { new: true }
        );

        if (!updatedClaim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json(updatedClaim);
    } catch (error) {
        console.error('Error updating claim status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getInsuranceCompanyClaims = async (req, res) => {
    try {
        const { companyName } = req.params; // Get company name from request params

        if (!companyName) {
            return res.status(400).json({ error: "Insurance company name is required." });
        }

        const companyClaims = await Claim.find({
            insuranceCompanyName: { $regex: new RegExp(companyName, "i") }, // ✅ Case-insensitive match
            claimStatus: { $regex: new RegExp("^Sent$", "i") },            // ✅ Case-insensitive match for "Sent"
            insuranceStatus: { $regex: new RegExp("^Pending$", "i") }      // ✅ Case-insensitive match for "Pending"
        }).select("id patientName doctorName consultancyDate medicines labTests");

        res.status(200).json(companyClaims);
    } catch (error) {
        console.error("Error fetching claims for insurance company:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getClaimDetailsById = async (req, res) => {
    try {
        const { claimId } = req.params;

        if (!claimId) {
            return res.status(400).json({ error: "Claim ID is required." });
        }

        const claim = await Claim.findById(claimId);

        if (!claim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.status(200).json(claim);
    } catch (error) {
        console.error("Error fetching claim details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getAcceptedClaims = async (req, res) => {
    try {
        const { companyName } = req.params; // Get insurance company name from request params

        if (!companyName) {
            return res.status(400).json({ error: "Insurance company name is required." });
        }

        const acceptedClaims = await Claim.find({
            insuranceCompanyName: { $regex: new RegExp(companyName, "i") }, // ✅ Case-insensitive match
            insuranceStatus: "Processed",  // ✅ Filter by Processed insurance status
            claimStatus: "Approved"  // ✅ Filter by Approved claim status
        }).select("id patientName doctorName consultancyDate medicines labTests");

        res.status(200).json(acceptedClaims);
    } catch (error) {
        console.error("Error fetching accepted claims:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getInsuranceClaimsForProcessing = async (req, res) => {
    try {
        const { companyName } = req.params;

        if (!companyName) {
            return res.status(400).json({ error: "Insurance company name is required." });
        }

        const companyClaims = await Claim.find({
            insuranceCompanyName: { $regex: new RegExp(companyName, "i") }, // Case-insensitive match
            claimStatus: { $regex: new RegExp("^Sent$", "i") }, // Case-insensitive match for "Sent"
            insuranceStatus: { $regex: new RegExp("^Processing$", "i") } // Case-insensitive match for "Processing"
        }).select("id patientName doctorName consultancyDate medicines labTests doctorFee totalAmount insuranceCardFront insuranceCardBack");

        res.status(200).json(companyClaims);
    } catch (error) {
        console.error("Error fetching under review claims:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateClaimToApproved = async (req, res) => {
    try {
        const { claimId } = req.params; // Get claim ID from request

        const updatedClaim = await Claim.findByIdAndUpdate(
            claimId,
            {
                claimStatus: "Approved",
                insuranceStatus: "Processed"
            },
            { new: true }
        );

        if (!updatedClaim) {
            return res.status(404).json({ error: "Claim not found" });
        }

        res.json({ message: "Claim approved successfully", claim: updatedClaim });
    } catch (error) {
        console.error("Error updating claim status:", error);
        res.status(500).json({ error: "Server error" });
    }
};


const markClaimAsProcessing = async (req, res) => {
    try {
        const { claimId } = req.params;

        const updatedClaim = await Claim.findByIdAndUpdate(
            claimId,
            { insuranceStatus: "Processing" }, // Update insuranceStatus to Processing
            { new: true }
        );

        if (!updatedClaim) {
            return res.status(404).json({ error: "Claim not found" });
        }

        res.json({ message: "Claim marked as Processing", claim: updatedClaim });
    } catch (error) {
        console.error("Error updating claim status:", error);
        res.status(500).json({ error: "Server error" });
    }
};


const getClaimsSummaryLastSixMonths = async (req, res) => {
    try {
        const { companyName } = req.params;
        if (!companyName) {
            return res.status(400).json({ error: "Insurance company name is required." });
        }

        // Get current date and last 6 months range
        const currentDate = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        // Get all claims for the company in the last 6 months
        const claims = await Claim.find({
            insuranceCompanyName: { $regex: new RegExp(companyName, "i") }, // Case-insensitive match
            consultancyDate: { $gte: sixMonthsAgo, $lte: currentDate }, // Date range
        });

        // Get last 6 months as an array
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(currentDate.getMonth() - i);
            months.push(date.toLocaleString('default', { month: 'short' }));
        }

        // Initialize count structure
        const summary = {};
        months.forEach(month => {
            summary[month] = { Pending: 0, Processed: 0, Accepted: 0 };
        });

        // Categorize claims into counts
        claims.forEach(claim => {
            const month = new Date(claim.consultancyDate).toLocaleString('default', { month: 'short' });

            if (new RegExp("^Pending$", "i").test(claim.insuranceStatus) && new RegExp("^Sent$", "i").test(claim.claimStatus)) {
                summary[month].Pending++;
            } else if (new RegExp("^Processing$", "i").test(claim.insuranceStatus) && new RegExp("^Sent$", "i").test(claim.claimStatus)) {
                summary[month].Processed++;
            } else if (new RegExp("^Processed$", "i").test(claim.insuranceStatus) && new RegExp("^Approved$", "i").test(claim.claimStatus)) {
                summary[month].Accepted++;
            }
        });

        // Convert summary object to array for frontend
        const formattedData = months.map(month => ({
            month,
            Pending: summary[month].Pending,
            Processed: summary[month].Processed,
            Accepted: summary[month].Accepted
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching claims summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




// const savePendingConfirmation = async (req, res) => {
//     try {
//         console.log("✅ Request received in controller");

//         const { email, name, insuranceCompanyName } = req.body;

//         // Check for uploaded files
//         if (!req.files || !req.files['insuranceCardFront'] || !req.files['insuranceCardBack']) {
//             console.error("❌ Missing file uploads");
//             return res.status(400).json({ error: "Files are required" });
//         }

//         const frontCardPath = req.files['insuranceCardFront'][0].path;
//         const backCardPath = req.files['insuranceCardBack'][0].path;

//         // Validate required fields
//         if (!email || !name || !insuranceCompanyName) {
//             console.error("❌ Missing required fields:", { email, name, insuranceCompanyName });
//             return res.status(400).json({ error: "All fields are required" });
//         }

//         // Create a new record in the PendingConfirmation collection
//         const newConfirmation = new PendingConfirmation({
//             email,
//             name,
//             insuranceCompanyName,
//             insuranceCardFront: frontCardPath,
//             insuranceCardBack: backCardPath
//         });

//         await newConfirmation.save();
//         console.log("✅ Pending confirmation saved successfully!");
//         res.status(201).json({ message: "Pending confirmation saved successfully!" });
//     } catch (error) {
//         console.error("❌ Error saving pending confirmation:", error.message);
//         res.status(500).json({ error: "Failed to save pending confirmation" });
//     }
// };
const savePendingConfirmation = async (req, res) => {
    try {
        const { email, name, insuranceCompanyName, insuranceCardFront, insuranceCardBack } = req.body;

        // Create a new pending confirmation entry
        const pendingConfirmation = new PendingConfirmation({
            email,
            name,
            insuranceCompanyName,
            insuranceCardFront,  // Save as base64
            insuranceCardBack    // Save as base64
        });

        await pendingConfirmation.save();
        res.status(201).json({ message: "Pending confirmation saved successfully!" });
    } catch (error) {
        console.error("Error saving pending confirmation:", error);
        res.status(500).json({ error: "Failed to save pending confirmation." });
    }
};




// insurance confirmation
const getPendingConfirmations = async (req, res) => {
    try {
        const { companyName } = req.params;

        const pendingConfirmations = await PendingConfirmation.find({ insuranceCompanyName: companyName });

        if (!pendingConfirmations || pendingConfirmations.length === 0) {
            return res.status(404).json({ message: "No pending confirmations found." });
        }

        res.status(200).json(pendingConfirmations);
    } catch (error) {
        console.error("Error fetching pending confirmations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


// auth_controller.js
const getPendingConfirmationDetails = async (req, res) => {
    try {
        const { companyName } = req.params;

        const pendingConfirmations = await PendingConfirmation.find(
            { insuranceCompanyName: companyName }
        );

        if (!pendingConfirmations || pendingConfirmations.length === 0) {
            return res.status(404).json({ message: "No pending confirmations found." });
        }

        // Ensure the response is an array of objects
        const result = pendingConfirmations.map(item => ({
            email: item.email,
            name: item.name,
            insuranceCompanyName: item.insuranceCompanyName,
            insuranceCardFront: item.insuranceCardFront,
            insuranceCardBack: item.insuranceCardBack
        }));

        res.status(200).json(result); // Return as an array of objects
    } catch (error) {
        console.error("Error fetching pending confirmation details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// auth_controller.js
const getInsuranceCardDetails = async (req, res) => {
    try {
        const { email } = req.params;

        const user = await PendingConfirmation.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return both front and back card URLs
        res.status(200).json({
            insuranceCardFront: user.insuranceCardFront,
            insuranceCardBack: user.insuranceCardBack,
        });
    } catch (error) {
        console.error("Error fetching insurance card details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Fetch pending confirmation details by email
// const getPendingConfirmationByEmail = async (req, res) => {
//     try {
//         const { email } = req.params;
//         const confirmation = await PendingConfirmation.findOne({ email });

//         if (!confirmation) {
//             return res.status(404).json({ error: 'No pending confirmation found for this email' });
//         }

//         res.status(200).json(confirmation);
//     } catch (error) {
//         console.error('Error fetching pending confirmation:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
const getPendingConfirmationByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const confirmation = await PendingConfirmation.findOne({ email });

        if (!confirmation) {
            return res.status(404).json({ error: 'No pending confirmation found for this email' });
        }

        res.status(200).json({
            insuranceCardFront: confirmation.insuranceCardFront,
            insuranceCardBack: confirmation.insuranceCardBack
        });
    } catch (error) {
        console.error('Error fetching pending confirmation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const removePendingConfirmation = async (req, res) => {
    try {
        const { email } = req.params;

        // Delete the pending confirmation record by email
        const result = await PendingConfirmation.findOneAndDelete({ email });

        if (!result) {
            return res.status(404).json({ message: 'Pending confirmation not found' });
        }

        res.status(200).json({ message: 'Pending confirmation removed successfully' });
    } catch (error) {
        console.error("Error removing pending confirmation:", error);
        res.status(500).json({ message: 'Internal server error while removing pending confirmation' });
    }
};











module.exports = {
    addPatient,
    getPatientDetails,
    updatePatient,
    getInsuranceCompanies,
    getDoctorDetails,
    getDoctorProfile,
    updateDoctor,
    saveAppointmentSlot,
    getAvailableSlots,
    removeExpiredSlots,
    removePastAppointments,
    getCategorizedSlots,
    findDoctorEmail,
    getAvailableDoctorAppointments,
    bookAppointment,
    getPatientAppointments,
    getFutureAppointments,
    cancelAppointment,
    rescheduleAppointment,
    checkUserType,
    getDoctorAppointments,
    updateAppointmentStatus,
    getFuturePendingAndConfirmAppointments,
    savePrescription,
    checkPrescription_before,
    checkPrescription,
    createLabTests,
    checkLabTests,
    createPharmacyRequest,
    checkMedicines,
    getPharmacistMedicines,
    updateMedicineStatus,
    getLabAttendeeTests,
    updateLabTestStatus,
    getLabTestsByPrescriptionId,
    getPatientName,
    getClaimByPrescriptionId,
    createLabTestsAndUpdateClaim,
    createPharmacyRequestAndUpdateClaim,
    getUserCounts,
    getAppointmentCounts,
    getUsers,
    removeUser,
    handleAddUser,
    getUserDetails,
    getDoctorMedicalRecords,
    getPatientMedicalRecords,
    getInsuranceDetail,
    getInsuranceClaims,
    updateClaimStatusInsurance,
    getInsuranceCompanyClaims,
    getClaimDetailsById,
    getAcceptedClaims,
    getInsuranceClaimsForProcessing,
    updateClaimToApproved,
    markClaimAsProcessing,
    getClaimsSummaryLastSixMonths,


    //admin
    getClaims,
    updateClaimStatus,
    getClaimStats,
    getConfirmedAppointments,

    //signup
    savePendingConfirmation,


    //insurance
    getPendingConfirmations,
    getPendingConfirmationDetails,
    getInsuranceCardDetails,
    getPendingConfirmationByEmail,
    addcardPatient,
    removePendingConfirmation

};
