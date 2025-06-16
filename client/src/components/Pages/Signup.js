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
import imageCompression from 'browser-image-compression';


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
    const [frontCardImage, setFrontCardImage] = useState(null);
    const [backCardImage, setBackCardImage] = useState(null);

    const handleFrontCardUpload = (e) => {
        setFrontCardImage(e.target.files[0]);
    };

    const handleBackCardUpload = (e) => {
        setBackCardImage(e.target.files[0]);
    };




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

    // const handleSaveEmailToDatabase = async (email, password, uid, insuranceCompanyName) => {
    //     try {
    //         const userRef = doc(db, "users", uid);
    //         await setDoc(userRef, { email, createdAt: new Date(), uid, insuranceCompanyName });

    //     } catch (error) {
    //         console.error("Error saving user data:", error);
    //     }
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!insuranceCompanyName || !frontCardImage || !backCardImage) {
    //         toast.error("Please complete all fields.");
    //         return;
    //     }
    //     try {
    //         // Step 1: Create user with Firebase authentication
    //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //         await sendEmailVerification(userCredential.user);
    //         toast.info("Verification email sent. Please check your inbox.");

    //         // Step 2: Save user email to Firebase Firestore
    //         await handleSaveEmailToDatabase(email, password, userCredential.user.uid, insuranceCompanyName);

    //         // Step 3: Prepare FormData for backend API call
    //         const formData = new FormData();
    //         formData.append("email", email);
    //         formData.append("name", "Default Name"); // You can update this with actual name input
    //         formData.append("insuranceCompanyName", insuranceCompanyName);
    //         formData.append("insuranceCardFront", frontCardImage);  // Correct: Use file object directly
    //         formData.append("insuranceCardBack", backCardImage);    // Correct: Use file object directly

    //         // Step 4: Make API call to save user data and files
    //         const response = await axios.post("http://localhost:5000/api/auth/pending-confirmation", formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',  // Correct Content-Type
    //             }
    //         });

    //         // Step 5: Check response and give feedback
    //         if (response.status === 201) {
    //             toast.success(response.data.message);
    //         } else {
    //             toast.error("Failed to save data.");
    //         }
    //     } catch (error) {
    //         console.error("Signup failed:", error.response?.data || error.message);
    //         toast.error(`Signup failed: ${error.message}`);
    //     }
    // };

    // const handleSaveEmailToDatabase = async (email, password, uid, insuranceCompanyName, frontCardImage, backCardImage) => {
    //     try {
    //         // Step 1: Save user email to Firebase Firestore
    //         const userRef = doc(db, "users", uid);
    //         await setDoc(userRef, { email, createdAt: new Date(), uid, insuranceCompanyName });

    //         // Step 2: Prepare FormData for backend API call
    //         const formData = new FormData();
    //         formData.append("email", email);
    //         formData.append("name", "Default Name"); // You can update this with actual name input
    //         formData.append("insuranceCompanyName", insuranceCompanyName);
    //         formData.append("insuranceCardFront", frontCardImage);  // Correct: Use file object directly
    //         formData.append("insuranceCardBack", backCardImage);    // Correct: Use file object directly

    //         // Step 3: Make API call to save user data and files in pending-confirmation collection
    //         const response = await axios.post("http://localhost:5000/api/auth/pending-confirmation", formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',  // Correct Content-Type
    //             }
    //         });

    //         // Step 4: Check response and give feedback
    //         if (response.status === 201) {
    //             // toast.success(response.data.message);
    //         } else {
    //             toast.error("Failed to save data.");
    //         }
    //     } catch (error) {
    //         console.error("Error saving user data:", error.response?.data || error.message);
    //         toast.error(`Error saving user data: ${error.message}`);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!insuranceCompanyName || !frontCardImage || !backCardImage) {
            toast.error("Please complete all fields.");
            return;
        }

        try {
            // Step 1: Compress the images
            const compressedFrontCardImage = await compressImage(frontCardImage);
            const compressedBackCardImage = await compressImage(backCardImage);

            // Step 2: Create user with Firebase authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            toast.info("Verification email sent. Please check your inbox.");

            // Step 3: Save user data to Firebase Firestore and MongoDB with compressed images
            await handleSaveEmailToDatabase(
                email,
                password,
                userCredential.user.uid,
                insuranceCompanyName,
                compressedFrontCardImage,  // Pass compressed Front Card Image
                compressedBackCardImage    // Pass compressed Back Card Image
            );

            // toast.success("Signup successful!");
        } catch (error) {
            console.error("Signup failed:", error.message);
            toast.error(`Signup failed: ${error.message}`);
        }
    };


    const handleSaveEmailToDatabase = async (email, password, uid, insuranceCompanyName, frontCardImage, backCardImage) => {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, { email, createdAt: new Date(), uid, insuranceCompanyName });

            // Prepare payload for MongoDB
            const payload = {
                email,
                name: "Default Name",
                insuranceCompanyName,
                insuranceCardFront: frontCardImage,  // Base64 format
                insuranceCardBack: backCardImage     // Base64 format
            };

            // API call to save user data with compressed images
            const response = await axios.post("http://localhost:5000/api/auth/pending-confirmation", payload, {
                headers: {
                    'Content-Type': 'application/json',  // Use JSON for base64
                }
            });

            if (response.status === 201) {
                //toast.success("Signup successful! Pending confirmation saved.");
            } else {
                toast.error("Failed to save pending confirmation.");
            }
        } catch (error) {
            console.error("Error saving user data:", error.response?.data || error.message);
            toast.error(`Error saving user data: ${error.message}`);
        }
    };

    // Image upload handler with compression
    const handleImageChange = async (e, setImage) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedImage = await compressImage(file);
                setImage(compressedImage); // Store compressed base64 image
            } catch (error) {
                console.error("Image compression failed:", error);
            }
        }
    };

    // Handlers for front and back card images
    const handleFrontCardChange = (e) => handleImageChange(e, setFrontCardImage);
    const handleBackCardChange = (e) => handleImageChange(e, setBackCardImage);




    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!insuranceCompanyName || !frontCardImage || !backCardImage) {
    //         toast.error("Please complete all fields.");
    //         return;
    //     }
    //     try {
    //         // Step 1: Create user with Firebase authentication
    //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //         await sendEmailVerification(userCredential.user);
    //         //toast.info("Verification email sent. Please check your inbox.");

    //         // Step 2: Call handleSaveEmailToDatabase with necessary data
    //         await handleSaveEmailToDatabase(
    //             email,
    //             password,
    //             userCredential.user.uid,
    //             insuranceCompanyName,
    //             frontCardImage,
    //             backCardImage
    //         );

    //     } catch (error) {
    //         console.error("Signup failed:", error.response?.data || error.message);
    //         toast.error(`Signup failed: ${error.message}`);
    //     }
    // };

    // Image compression utility
    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result); // Return base64 format
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file); // Convert to base64
        });
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
    const isFormValid = () => {
        return email !== '' &&
            password !== '' &&
            confirmPassword !== '' &&
            insuranceCompanyName !== '' &&
            frontCardImage !== null &&
            backCardImage !== null;
    };

    const validatePakistaniEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(pk|com|org|edu|gov|mil)$/.test(email);
    const togglePasswordVisibility = (e) => { e.preventDefault(); setShowPassword(!showPassword); };
    const toggleConfirmPasswordVisibility = (e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); };
    //const allValid = Object.values(validations).every(Boolean) && insuranceCompanyName !== '';
    const allValid = isFormValid() && Object.values(validations).every(Boolean);


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
                        <div className="image-upload-box" onClick={() => document.getElementById('front-card-input').click()}>
                            {frontCardImage ? frontCardImage.name : "Upload Front Side of Card"}
                            <input
                                id="front-card-input"
                                type="file"
                                onChange={handleFrontCardUpload}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>
                        <div className="image-upload-box" onClick={() => document.getElementById('back-card-input').click()}>
                            {backCardImage ? backCardImage.name : "Upload Back Side of Card"}
                            <input
                                id="back-card-input"
                                type="file"
                                onChange={handleBackCardUpload}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
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