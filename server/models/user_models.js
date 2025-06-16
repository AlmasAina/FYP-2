const mongoose = require('mongoose');



const pendingConfirmationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    insuranceCompanyName: { type: String, required: true },
    insuranceCardFront: { type: String, required: true }, // Base64
    insuranceCardBack: { type: String, required: true } // Base64
});

// Doctor Schema (Profile information specific to doctors)
const doctorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, default: "N/A" },
    specialization: { type: String, default: "N/A" },
    education: { type: String, default: "N/A" },
    services: { type: [String], default: [] },
    profilePicture: { type: String, default: "N/A" },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    consultationFee: { type: Number, default: 0 },
    yearOfExperience: { type: Number, default: 0 }, // Added yearOfExperience
});


// Patient Schema (Profile information specific to patients)
const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'N/A'], default: 'N/A' },
    age: { type: Number },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'], default: 'N/A' },
    cnic: { type: String },
    contactNumber: { type: String },
    dob: { type: Date },
    maritalStatus: { type: String, enum: ['Married', 'Single', 'Divorced', 'Widowed', 'N/A'], default: 'N/A' },
    profilePicture: { type: String, default: '' },
    // Only adding the essential insurance fields
    insuranceCardFront: { type: String, default: '' },
    insuranceCardBack: { type: String, default: '' },
    insuranceProvider: { type: String, required: true }
});



// Appointment Schema (Details about appointments)
const appointmentSchema = new mongoose.Schema({
    doctorEmail: { type: String, required: true },
    doctorName: { type: String },
    specialization: { type: String },
    patientEmail: { type: String }, // Ensure patient email is mandatory
    patientName: { type: String }, // Ensure patient name is mandatory
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: HH:mm (start time of appointment)
    endTime: { type: String, required: true }, // Format: HH:mm (end time of appointment)
    status: {
        type: String,
        enum: ['Pending', 'Available', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    }, // Enum for appointment status// Added location field
    consultationFee: { type: Number, default: 0 }, // Added consultation fee field
});

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mainAdmin: { type: Boolean, default: false } // Flag to indicate if this is the main admin
});

const claimSchema = new mongoose.Schema({
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
        required: true
    },
    doctorEmail: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorFee: { type: Number, required: true },
    doctorSpecialization: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },
    patientBloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A'],
        required: true
    },
    patientContactNumber: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    claimStatus: {
        type: String,
        enum: ['Pending', 'Sent', 'Approved'],
        default: 'Pending'
    },
    insuranceStatus: {  // ✅ Added new field for insurance status
        type: String,
        enum: ['Pending', 'Processing', 'Processed'],
        default: 'Pending'
    },
    consultancyDate: { type: Date, required: true },
    insuranceCompanyName: { type: String, required: true },
    insuranceCardFront: { type: String, required: true },
    insuranceCardBack: { type: String, required: true },
    medicines: [{
        name: { type: String },
        fee: { type: Number },
        status: {
            type: String,
            enum: ['Pending', 'Approved'],
            default: 'Pending'
        }
    }],
    labTests: [{
        testName: { type: String },
        testFee: { type: Number },
        status: {
            type: String,
            enum: ['Pending', 'Approved'],
            default: 'Pending'
        }
    }]
}, { timestamps: true });

const prescriptionSchema = new mongoose.Schema({
    patientEmail: { type: String, required: true },
    doctorEmail: { type: String, required: true },
    dateIssued: { type: Date, required: true, default: Date.now },

    // Patient Information
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    // Diagnosis Section
    diagnosis: { type: String, required: true },

    // Symptoms List (Multiple Symptoms Allowed)
    symptoms: { type: [String], default: [] },

    // Medications List (Supports Name, Dosage, Frequency, and Duration)
    medicines: {
        type: [{
            name: { type: String, required: true },
            dosage: { type: String, required: true }, // e.g., "500mg"
            frequency: { type: String, required: true }, // e.g., "Twice daily"
            duration: { type: String, required: true } // e.g., "7 days"
        }],
        default: [] // Allow null by defaulting to an empty array
    },

    // Lab Tests List (Includes Name Only)
    labTests: {
        type: [{
            testName: { type: String, required: true } // Only testName is required
        }],
        default: [] // Allow null by defaulting to an empty array
    },

    // Additional Advice Section
    advice: { type: String, default: "" },

    // Follow-up Section
    followUpDate: { type: Date, default: null },

    // Timestamps for Record Keeping
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});




const labAttendeeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true }
}, { collection: 'labAttendee' });

const pharmacistSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true }
}, { collection: 'pharmacist' }); // Ensures only one document exists

const labTestSchema = new mongoose.Schema({
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
    labTests: [{
        testName: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Rejected'], default: 'Pending' }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'labTests' });


const medicineSchema = new mongoose.Schema({
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
    medicines: [{
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true }, // Example: "1 tablet twice a day"
        duration: { type: String, required: true }, // Example: "5 days"
        status: { type: String, enum: ['Pending', 'Provided'], default: 'Pending' }, // Status of medicine dispensing
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'medicines' });


const insuranceCompanySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String },
    address: { type: String },
    registrationNumber: { type: String, unique: true, sparse: true } // Add this field
}, { collection: 'insuranceCompanies' });

// Exporting Models
const PendingConfirmation = mongoose.model('PendingConfirmation', pendingConfirmationSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Claim = mongoose.model('Claim', claimSchema);
const Prescription = mongoose.model('Prescription', prescriptionSchema);
const LabAttendee = mongoose.model('LabAttendee', labAttendeeSchema);
const Pharmacist = mongoose.model('Pharmacist', pharmacistSchema);
const LabTest = mongoose.model('LabTest', labTestSchema);
const Medicine = mongoose.model('Medicine', medicineSchema);
const InsuranceCompany = mongoose.model('InsuranceCompany', insuranceCompanySchema);


module.exports = { Doctor, Patient, Appointment, Admin, Claim, Prescription, LabAttendee, Pharmacist, LabTest, Medicine, InsuranceCompany, PendingConfirmation };
