import React, { useState } from "react";
import './forget_password.css';
import Header from "../header.js";
import Footer from "../Footer.js";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase.js"; // Import Firestore database
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore functions
import { Toaster, toast } from "sonner";

function ForgotPassword() {
    const [email, setEmail] = useState('');

    const validatePakistaniEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(pk|com|org|edu|gov|mil)$/;
        return emailRegex.test(email);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        try {
            // Check if email exists in Firestore
            const usersRef = collection(db, "users"); // Replace 'users' with your Firestore collection name
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Email not found
                toast.error("Email does not exist!", {
                    style: { backgroundColor: "#f44336", color: "#fff" },
                });
                return;
            }

            // Email found, send password reset
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent!", {
                style: { backgroundColor: "#4caf50", color: "#fff" },
            });
        } catch (error) {
            toast.error(`Error: ${error.message}`, {
                style: { backgroundColor: "#f44336", color: "#fff" },
            });
        }
    };

    return (
        <>
            <Header />
            <Toaster position="top-center" richcolors closeButton />
            <div className="forgot-password-container">
                <form className="forgot-password-form" onSubmit={handlePasswordReset}>
                    <h2>Forgot Password</h2>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className={validatePakistaniEmail(email) || email === "" ? "" : "invalid-email"}
                        />
                        {!validatePakistaniEmail(email) && email !== "" && (
                            <p className="error-text">Invalid email format!</p>
                        )}
                    </div>
                    <button type="submit">Send Reset Email</button>
                </form>
            </div>
            <Footer />
        </>
    );
}

export default ForgotPassword;
