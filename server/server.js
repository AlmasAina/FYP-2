const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const authRouter = require('./router/auth_router');
require('dotenv').config();
const checkAppointmentsAndSendEmails = require('./services/reminder_service');

const app = express();
const bodyParser = require('body-parser');


const helpdeskRoutes = require('./router/helpdeskroutes');
// Increase the payload limit to 50MB
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Middleware
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Routes
app.use('/api/helpdesk', helpdeskRoutes);

// Database Connection and Server Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Run the appointment reminder service when the server starts
checkAppointmentsAndSendEmails();
