const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER1,
        pass: process.env.EMAIL_PASSWORD1
    }
});

// Enhanced validation middleware
const validateQueryRequest = [
    check('subject', 'Subject is required').not().isEmpty().trim().escape(),
    check('message', 'Message must be at least 10 characters').isLength({ min: 10 }).trim().escape(),
    check('priority').isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority level'),
    check('email', 'Email is required').optional().isEmail().withMessage('Invalid email format').normalizeEmail()
];

// Helper function for priority colors
const getPriorityColor = (priority) => {
    const colors = {
        'Low': '#28a745',
        'Medium': '#ffc107',
        'High': '#fd7e14',
        'Urgent': '#dc3545'
    };
    return colors[priority] || '#6c757d';
};

/**
 * @route POST /api/helpdesk/send-query
 * @desc Send patient query to helpdesk
 * @access Public
 */
router.post('/send-query', validateQueryRequest, async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
            message: 'Validation failed'
        });
    }

    try {
        const { subject, message, priority, email } = req.body;

        // Email options
        const mailOptions = {
            from: `"Healthcare System" <${process.env.EMAIL_USER1}>`,
            to: process.env.ADMIN_EMAIL,
            replyTo: email || process.env.EMAIL_USER1,
            subject: `[${priority} Priority] Patient Query: ${subject}`,
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #002d5b; border-bottom: 2px solid #add8e6; padding-bottom: 10px;">New Patient Query</h2>
                    <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(priority)};">${priority}</span></p>
                    ${email ? `<p><strong>From:</strong> ${email}</p>` : ''}
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 15px;">
                        <h3 style="color: #002d5b;">Message:</h3>
                        <p style="white-space: pre-line;">${message}</p>
                    </div>
                    <p style="margin-top: 30px; color: #777; font-size: 12px;">
                        This is an automated email from the healthcare system.
                    </p>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Success response
        res.status(200).json({
            success: true,
            message: 'Your query has been sent successfully. We will respond soon.'

        });

        console.log('Attempting to send email to:', process.env.ADMIN_EMAIL);
        console.log('Using sender:', process.env.EMAIL_USER1);

    } catch (error) {
        console.error('Error sending email:', error);

        // Enhanced error response
        res.status(500).json({
            success: false,
            message: 'Failed to send your query. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route GET /api/helpdesk/test
 * @desc Test route to verify helpdesk endpoint is working
 * @access Public
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "Helpdesk endpoint is working!",
        timestamp: new Date().toISOString()
    });
});


module.exports = router;