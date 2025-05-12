nodemailer = require('nodemailer');
const connectDB = require('../utils/db');
const mongoose = require('mongoose');
require('dotenv').config();
let count = 0;

// Ensure the Appointment model is only defined once
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', new mongoose.Schema({
    doctorEmail: { type: String, required: true },
    doctorName: { type: String },
    specialization: { type: String },
    patientEmail: { type: String, required: true },
    patientName: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: HH:mm
    endTime: { type: String, required: true },   // Format: HH:mm
    status: {
        type: String,
        enum: ['Pending', 'Available', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    consultationFee: { type: Number, default: 0 }
}));


// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Email credentials from .env
        pass: process.env.EMAIL_PASS
    }
});

// Function to Check Appointments and Send Emails
const checkAppointmentsAndSendEmails = async () => {

    try {
        console.log('Connecting to DB...');
        await connectDB(); // Ensure database is connected

        const now = new Date();
        console.log('System time:', now.toString());  // Log system time

        // Loop through appointments
        const upcomingAppointments = await Appointment.find({
            status: 'Confirmed',  // Only consider confirmed appointments
        });

        for (const appointment of upcomingAppointments) {
            const appointmentDate = new Date(appointment.date);
            const appointmentStartTime = appointment.startTime.split(":");  // Split the time into hours and minutes
            appointmentDate.setHours(parseInt(appointmentStartTime[0]), parseInt(appointmentStartTime[1]), 0, 0);  // Set the appointment time based on date and start time

            // Log the appointment date and time retrieved from the DB
            console.log('Appointment time from DB:', appointmentDate.toString());

            const timeDifferenceInMillis = appointmentDate.getTime() - now.getTime();  // Difference in milliseconds
            const timeDifferenceInHours = timeDifferenceInMillis / (1000 * 60 * 60);  // Convert milliseconds to hours

            // Log the time difference in hours
            console.log('Time difference in hours:', timeDifferenceInHours);

            // Check if the time difference is exactly 24 hours
            if (Math.abs(timeDifferenceInHours - 24) < 0.01) {  // Allow a small tolerance for floating point precision
                // Time is exactly 24 hours ahead of now, send the email
                console.log('Time difference is exactly 24 hours, sending reminder email...');

                const appointmentTime = `${appointment.startTime} to ${appointment.endTime}`;
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: appointment.patientEmail,
                    subject: 'Appointment Reminder',
                    text: `Dear ${appointment.patientName},\n\nThis is a reminder for your appointment with Dr. ${appointment.doctorName} (${appointment.specialization}) on ${appointment.date.toDateString()} from ${appointmentTime}.\n\nConsultation Fee: $${appointment.consultationFee}\n\nThank you!`

                };

                await transporter.sendMail(mailOptions);
                console.log(`Reminder sent to ${appointment.patientEmail}`);
                count += 1;
            } else {
                console.log('Time difference is not exactly 24 hours, no email sent');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


let interval;

// Flag to track if emails are being sent
let emailsSent = false;

interval = setInterval(() => {
    console.log('Running appointment reminder job...');

    if (!emailsSent) {
        checkAppointmentsAndSendEmails().then(() => {
            if (count !== 0) {
                console.log('Count is no longer 0, stopping job.');
                clearInterval(interval);  // Clear the interval after sending the email and updating count
            }
        }).catch(error => {
            console.error('Error in checking appointments and sending emails:', error);
        });
    }

}, 5000);

module.exports = checkAppointmentsAndSendEmails;
