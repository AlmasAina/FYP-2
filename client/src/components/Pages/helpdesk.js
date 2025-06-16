import React, { useState } from "react";
import "./helpdesk.css";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import SidebarPatient from "./sidebarPatient"; // Import the SidebarPatient
const HelpDesk = ({ isSidebarVisible, toggleSidebar }) => {
    const { email } = useAuth();
    const [queryData, setQueryData] = useState({
        subject: "",
        message: "",
        priority: "Medium"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQueryData({ ...queryData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!queryData.subject.trim()) {
            newErrors.subject = "Subject cannot be empty";
        }
        if (!queryData.message.trim()) {
            newErrors.message = "Message cannot be empty";
        } else if (queryData.message.trim().length < 10) {
            newErrors.message = "Message should be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const { data } = await axios.post("http://localhost:5000/api/helpdesk/send-query", {
                ...queryData // Remove the email field since backend doesn't expect it
            });

            setSubmitStatus({
                type: "success",
                message: data.message || "Your query has been sent successfully. We'll respond shortly."
            });

            // Reset form after successful submission
            setQueryData({
                subject: "",
                message: "",
                priority: "Medium"
            });

        } catch (error) {
            console.error("Error sending query:", error);
            setSubmitStatus({
                type: "error",
                message: error.response?.data?.message || "Failed to send your query. Please try again later."
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className={`helpdesk-page ${isSidebarVisible ? "" : "sidebar-hidden"}`}>

            {/* SidebarPatient Integration */}
            <SidebarPatient isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

            <div className="helpdesk-card">
                <div className="helpdesk-header">
                    <h2>Patient Help Desk</h2>
                    <p>Got a question? We're here to help! Fill out the form below and our team will get back to you promptly.</p>
                </div>

                {submitStatus && (
                    <div className={`status-message ${submitStatus.type}`}>
                        {submitStatus.message}
                    </div>
                )}

                <form className="helpdesk-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={queryData.subject}
                            onChange={handleInputChange}
                            placeholder="Enter the subject of your query"
                            className={errors.subject ? "error-input" : ""}
                        />
                        {errors.subject && <span className="error-text">{errors.subject}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={queryData.priority}
                            onChange={handleInputChange}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Your Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={queryData.message}
                            onChange={handleInputChange}
                            placeholder="Describe your issue or question in detail..."
                            rows="6"
                            className={errors.message ? "error-input" : ""}
                        ></textarea>
                        {errors.message && <span className="error-text">{errors.message}</span>}
                    </div>

                    <div className="form-footer">
                        <p className="form-note">
                            Our staff typically responds within 24-48 hours during business days.
                            For urgent medical concerns, please contact emergency services.
                        </p>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>

                <div className="contact-info">
                    <h3>Other Ways to Contact Us</h3>
                    <div className="contact-methods">
                        <div className="contact-method">
                            <i className="contact-icon phone-icon"></i>
                            <div>
                                <p className="method-title">Phone Support</p>
                                <p>+92 XXX XXXXXXX</p>
                            </div>
                        </div>
                        <div className="contact-method">
                            <i className="contact-icon email-icon"></i>
                            <div>
                                <p className="method-title">Email Support</p>
                                <p>support@CareTransact.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default HelpDesk;