import React, { useState, useEffect } from "react";
import './login_signup.css';
import Header from "../header.js";
import Footer from "../Footer.js";
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../firebase.js";
import { Toaster, toast } from "sonner";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [insuranceCompanyName, setInsuranceCompanyName] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validations, setValidations] = useState({
        length: false,
        number: false,
        specialChar: false,
        passwordMatch: false
    });
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [emailVerifiedForCurrentSession, setEmailVerifiedForCurrentSession] = useState(false);
    const [insuranceCompanies, setInsuranceCompanies] = useState([]);

    // Fetch insurance companies on component mount
    useEffect(() => {
        const fetchInsuranceCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/insurance-companies');
                setInsuranceCompanies(response.data);
            } catch (error) {
                console.error('Error fetching insurance companies:', error);
                toast.error('Failed to load insurance companies');
            }
        };

        fetchInsuranceCompanies();
    }, []);

    // Existing useEffect for auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    await reload(user);
                    if (!user.emailVerified && !emailVerificationSent) {
                        toast.info("Verification email sent. Please check your inbox.", {
                            style: { backgroundColor: "#2196f3", color: "#fff" },
                            duration: 5000
                        });
                        setEmailVerificationSent(true);
                    }
                } catch (error) {
                    console.error("Error checking verification status:", error);
                }
            }
        });

        const verificationCheckInterval = () => {
            const interval = setInterval(async () => {
                const user = auth.currentUser;
                if (user && user.email === email) {
                    try {
                        await reload(user);
                        if (user.emailVerified && email !== "") {
                            const userRef = doc(db, "users", user.uid);
                            const userDoc = await getDoc(userRef);
                            if (userDoc.exists() && !emailVerifiedForCurrentSession) {
                                setEmailVerifiedForCurrentSession(true);
                                toast.success("Email verified! You can now login.", {
                                    style: { backgroundColor: "#4caf50", color: "#fff" },
                                    duration: 5000
                                });
                                clearInterval(interval);
                            }
                        }
                    } catch (error) {
                        console.error("Error during verification check:", error);
                    }
                }
            }, 3000);
            return interval;
        };

        const interval = verificationCheckInterval();
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [email, emailVerifiedForCurrentSession, emailVerificationSent]);

    // Existing password validation and handler functions
    const validatePassword = (password, confirmPassword) => {
        const lengthValid = password.length >= 6;
        const numberValid = /\d/.test(password);
        const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const passwordMatchValid = password === confirmPassword && confirmPassword !== '';
        setValidations({ length: lengthValid, number: numberValid, specialChar: specialCharValid, passwordMatch: passwordMatchValid });
    };

    // Replace your current getPasswordStrength function with this:
    const getPasswordStrength = () => {
        let strength = {
            width: '0%',
            backgroundColor: '#e0e0e0',
            text: ''
        };

        if (validations.length && validations.number && validations.specialChar) {
            strength = { width: '100%', backgroundColor: '#4caf50', text: 'Strong' }; // Green
        } else if (validations.length && validations.number) {
            strength = { width: '66%', backgroundColor: '#ffa500', text: 'Medium' }; // Orange
        } else if (validations.length) {
            strength = { width: '33%', backgroundColor: '#ff0000', text: 'Weak' }; // Red
        }

        return strength;
    };

    // Update the password strength indicator in your JSX:
    // Replace your current password strength container with this:
    {
        isPasswordFocused && password && (
            <div className="password-strength-container">
                <div className="password-strength-bar">
                    <div style={{
                        width: getPasswordStrength().width,
                        backgroundColor: getPasswordStrength().backgroundColor
                    }}></div>
                </div>
                <span className="strength-text">{getPasswordStrength().text}</span>
            </div>
        )
    }

    const handleSaveEmailToDatabase = async (email, password, uid, insuranceCompanyName) => {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, { email, createdAt: new Date(), uid, insuranceCompanyName });
            await axios.post('http://localhost:5000/api/auth/patients', { email, insuranceCompanyName });
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!insuranceCompanyName) {
            toast.error("Please select an insurance company.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            await handleSaveEmailToDatabase(email, password, userCredential.user.uid, insuranceCompanyName);
            toast.info("Verification email sent. Please check your inbox.");
        } catch (error) {
            console.error("Signup failed:", error);
            toast.error(`Signup failed: ${error.message}`);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        validatePassword(password, newConfirmPassword);
    };

    const validatePakistaniEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(pk|com|org|edu|gov|mil)$/.test(email);
    const togglePasswordVisibility = (e) => { e.preventDefault(); setShowPassword(!showPassword); };
    const toggleConfirmPasswordVisibility = (e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); };
    const allValid = Object.values(validations).every(Boolean) && insuranceCompanyName !== '';

    return (
        <>
            <Header />
            <Toaster position='top-center' richColors closeButton />
            <div className="signup-container">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="signup-content">
                        <h2>Signup</h2>

                        {/* Email Input */}
                        <div className="email-input-container">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email"
                                className={validatePakistaniEmail(email) || email === "" ? "" : "invalid-email"}
                            />
                            {!validatePakistaniEmail(email) && email !== "" && (
                                <p className="error-text">Invalid email format!</p>
                            )}
                        </div>

                        {/* Insurance Company Dropdown */}
                        <div className="email-input-container">
                            <select
                                value={insuranceCompanyName}
                                onChange={(e) => setInsuranceCompanyName(e.target.value)}
                                required
                                className="insurance-dropdown"
                            >
                                <option value="">Select Insurance Company</option>
                                {insuranceCompanies.map(company => (
                                    <option key={company._id} value={company.name}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Password Input */}
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                required
                                placeholder="Password"
                            />
                            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>

                        {/* Password Strength Indicator */}
                        {isPasswordFocused && password && (
                            <div className="password-strength-container">
                                <div className="password-strength-bar">
                                    <div style={{
                                        width: getPasswordStrength().width,
                                        backgroundColor: getPasswordStrength().backgroundColor
                                    }}></div>
                                </div>
                                <span className="strength-text">{getPasswordStrength().text}</span>
                            </div>
                        )}

                        {/* Confirm Password Input */}
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                                placeholder="Confirm Password"
                            />
                            <span className="password-toggle-icon" onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        {confirmPassword && !validations.passwordMatch && (
                            <p className="password-match-error">Passwords do not match</p>
                        )}

                        {/* Submit Section */}
                        <div className="signup-footer">
                            <button
                                type="submit"
                                disabled={!allValid}
                                className={`continue-button ${!allValid ? 'disabled' : ''}`}
                            >
                                Continue
                            </button>
                            <div className="signup">
                                <p>Already have an account? <a href="/login"><b>Login</b></a></p>
                            </div>
                        </div>
                    </div>
                    <div className="signup-image">
                        <img src="/signup.png" alt="signup" tabIndex="-1" />
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
}

export default Signup;