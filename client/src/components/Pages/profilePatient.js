import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./profilePatient.css";
import DefaultProfilePic from "../../assets/images/image.jpg";
import DefaultCardFront from "../../assets/images/card_front.png";
import DefaultCardBack from "../../assets/images/card_back.png";
import EditIcon from "../../assets/images/edit_profile.png";
import ReactCardFlip from "react-card-flip";
import axios from "axios";
import imageCompression from 'browser-image-compression';




const ProfilePatient = ({ isSidebarVisible }) => {
    const { email } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        gender: "",
        age: "",
        bloodGroup: "",
        cnic: "",
        contactNumber: "",
        dob: "",
        maritalStatus: "",
        // Only keeping insurance provider
        insuranceProvider: "",
    });
    const [profileImage, setProfileImage] = useState(DefaultProfilePic);
    const [insuranceCardFront, setInsuranceCardFront] = useState(DefaultCardFront);
    const [insuranceCardBack, setInsuranceCardBack] = useState(DefaultCardBack);
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const [showInsuranceCard, setShowInsuranceCard] = useState(false);
    const [errors, setErrors] = useState({});
    const [insuranceCompanies, setInsuranceCompanies] = useState([]); // Store insurance company names
    const [selectedInsurance, setSelectedInsurance] = useState("");  // Store selected insurance company


    useEffect(() => {
        if (email) {
            axios
                .get("http://localhost:5000/api/auth/patient-details", { params: { email } })
                .then((response) => {
                    const data = response.data;
                    setProfileData(data);
                    if (data.profilePicture) {
                        setProfileImage(data.profilePicture);
                    }
                    // Load insurance card images if available
                    if (data.insuranceCardFront) {
                        setInsuranceCardFront(data.insuranceCardFront);
                    }
                    if (data.insuranceCardBack) {
                        setInsuranceCardBack(data.insuranceCardBack);
                    }
                })
                .catch((error) => {
                    alert("Error fetching patient details:", error);
                });
        }
    }, [email]);

    useEffect(() => {
        const fetchInsuranceCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/insurance-companies');
                setInsuranceCompanies(response.data); // ✅ Store fetched companies in state
            } catch (error) {
                console.error('Error fetching insurance companies:', error);
                alert('Failed to load insurance companies');
            }
        };

        fetchInsuranceCompanies();
    }, []);


    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
        setErrors({});
    };

    const validateFields = () => {
        const newErrors = {};
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        const phoneRegex = /^03\d{9}$/;
        const today = new Date();

        if (!profileData.cnic.match(cnicRegex)) {
            newErrors.cnic = "Invalid CNIC format (e.g., 12345-6789012-3).";
        }
        if (!profileData.contactNumber.match(phoneRegex)) {
            newErrors.contactNumber = "Invalid phone number format.";
        }
        if (new Date(profileData.dob) >= today) {
            newErrors.dob = "Date of Birth must be in the past.";
        }
        const enteredDOB = new Date(profileData.dob);
        const enteredAge = parseInt(profileData.age, 10);
        const calculatedAge = today.getFullYear() - enteredDOB.getFullYear();
        const birthdayThisYear = new Date(today.getFullYear(), enteredDOB.getMonth(), enteredDOB.getDate());

        // Check if the birthday has passed this year
        const adjustedAge = today < birthdayThisYear ? calculatedAge - 1 : calculatedAge;

        if (adjustedAge !== enteredAge) {
            newErrors.dob = "Age and DOB do not match.";
        }
        if (profileData.age < 0) {
            newErrors.age = "Age cannot be negative.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const compressImage = async (imageFile) => {
        const options = {
            maxSizeMB: 1, // Maximum size in MB
            maxWidthOrHeight: 1024, // Maximum width or height
            useWebWorker: true, // Use web worker for better performance
        };
        try {
            const compressedFile = await imageCompression(imageFile, options);
            return compressedFile;
        } catch (error) {
            console.error('Error compressing image:', error);
            return imageFile; // Return original file if compression fails
        }
    };

    const saveChanges = async () => {
        if (!validateFields()) return;

        // Compress images before sending
        const compressedProfileImage = await compressImage(profileImage);
        const compressedCardFront = await compressImage(insuranceCardFront);
        const compressedCardBack = await compressImage(insuranceCardBack);

        const updatedProfile = {
            ...profileData,
            profilePicture: compressedProfileImage,
            insuranceCardFront: compressedCardFront,
            insuranceCardBack: compressedCardBack
        };

        axios
            .put("http://localhost:5000/api/auth/update-patient", updatedProfile)
            .then(() => {
                setIsEditMode(false);
                console.log("Profile updated successfully!");
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
            });
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "age" && value < 0) return; // Prevent negative age
        setProfileData({ ...profileData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCardFrontChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setInsuranceCardFront(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCardBackChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setInsuranceCardBack(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOutsideClick = (event) => {
        if (event.target.classList.contains("insurance-card-overlay")) {
            setShowInsuranceCard(false);
        }
    };

    return (
        <div className={`profile-page ${isSidebarVisible ? "" : "sidebar-hidden"}`}>
            <div className={`profile-card ${isEditMode ? "edit-mode" : ""}`}>
                <div className="profile-header">
                    <div className="profile-image-container">
                        <img src={profileImage} alt="Profile" className="profile-image" />
                        {isEditMode && (
                            <>
                                <div
                                    className="edit-icon"
                                    onClick={() => document.getElementById("profile-image-input").click()}
                                >
                                    <img src={EditIcon} alt="Edit Icon" />
                                </div>
                                <input
                                    type="file"
                                    id="profile-image-input"
                                    style={{ display: "none" }}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </>
                        )}
                    </div>
                    <div className="profile-info">
                        <p>{profileData.email}</p>
                        <div className="action-buttons">
                            <button
                                className="edit-btn"
                                onClick={isEditMode ? saveChanges : toggleEditMode}
                            >
                                {isEditMode ? "Save Changes" : "Edit Profile"}
                            </button>
                            <button
                                className="insurance-card-btn"
                                onClick={() => setShowInsuranceCard(true)}
                            >
                                View Insurance Card
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-details">
                    {[
                        { label: "Name", name: "name", type: "text" },
                        { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"] },
                        { label: "Age", name: "age", type: "number" },
                        { label: "Blood Group", name: "bloodGroup", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
                        { label: "CNIC", name: "cnic", type: "text" },
                        { label: "Contact Number", name: "contactNumber", type: "text" },
                        { label: "Date of Birth", name: "dob", type: "date" },
                        { label: "Marital Status", name: "maritalStatus", type: "select", options: ["Married", "Single", "Divorced", "Widowed"] },
                    ].map(({ label, name, type, options }) => (
                        <div key={name} className="detail-item">
                            <span className="detail-label">{label}:</span>
                            {isEditMode ? (
                                type === "select" ? (
                                    <select
                                        name={name}
                                        value={profileData[name] || ""}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    >
                                        {["N/A", ...options].map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={type}
                                        name={name}
                                        value={profileData[name] || ""}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    />
                                )
                            ) : (
                                <p className="detail-value">
                                    {name === "dob" && profileData[name]
                                        ? new Date(profileData[name]).toLocaleDateString()
                                        : profileData[name] || "N/A"}
                                </p>
                            )}
                            {errors[name] && <span className="error">{errors[name]}</span>}
                        </div>
                    ))}
                </div>

                {/* Simplified Insurance Information Section */}
                <div className="insurance-section">
                    <div className="insurance-provider">
                        <span className="detail-label">Insurance Provider:</span>
                        {isEditMode ? (
                            <select
                                value={selectedInsurance || profileData.insuranceProvider || ""}
                                onChange={(e) => setSelectedInsurance(e.target.value)}
                                className="profile-input"
                            >
                                <option value="">Select Insurance Provider</option>
                                {insuranceCompanies.map(company => (
                                    <option key={company._id} value={company.name}>{company.name}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="detail-value">{profileData.insuranceProvider || "N/A"}</p>
                        )}
                    </div>


                    {/* Always visible card preview/upload section */}
                    <div className="insurance-card-section">
                        <h3>Insurance Card</h3>
                        <div className="card-preview-container">
                            <div className="card-preview">
                                <p>Front Side</p>
                                <img
                                    src={insuranceCardFront}
                                    alt="Insurance Card Front"
                                    className="card-preview-image"
                                />
                                {isEditMode && (
                                    <>
                                        <button
                                            className="card-upload-btn"
                                            onClick={() => document.getElementById("card-front-input").click()}
                                        >
                                            Upload Front
                                        </button>
                                        <input
                                            type="file"
                                            id="card-front-input"
                                            style={{ display: "none" }}
                                            accept="image/*"
                                            onChange={handleCardFrontChange}
                                        />
                                    </>
                                )}
                            </div>
                            <div className="card-preview">
                                <p>Back Side</p>
                                <img
                                    src={insuranceCardBack}
                                    alt="Insurance Card Back"
                                    className="card-preview-image"
                                />
                                {isEditMode && (
                                    <>
                                        <button
                                            className="card-upload-btn"
                                            onClick={() => document.getElementById("card-back-input").click()}
                                        >
                                            Upload Back
                                        </button>
                                        <input
                                            type="file"
                                            id="card-back-input"
                                            style={{ display: "none" }}
                                            accept="image/*"
                                            onChange={handleCardBackChange}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insurance Card Popup with Flip functionality - Improved sizing */}
            {showInsuranceCard && (
                <div className="insurance-card-overlay" onClick={handleOutsideClick}>
                    <div className="insurance-card-popup">
                        <div className="card-popup-header">
                            <h3>Insurance Card</h3>
                            <p><strong>Provider:</strong> {profileData.insuranceProvider || 'N/A'}</p>
                            <button
                                className="close-popup-btn"
                                onClick={() => setShowInsuranceCard(false)}
                            >
                                Close
                            </button>
                        </div>
                        <ReactCardFlip isFlipped={isCardFlipped} flipDirection="horizontal">
                            {/* Front Side - Click to Flip */}
                            <div className="card-side" onClick={() => setIsCardFlipped(true)}>
                                <p className="flip-instruction">Click to view back</p>
                                <img src={insuranceCardFront} alt="Insurance Card Front" />
                            </div>

                            {/* Back Side - Click to Flip */}
                            <div className="card-side" onClick={() => setIsCardFlipped(false)}>
                                <p className="flip-instruction">Click to view front</p>
                                <img src={insuranceCardBack} alt="Insurance Card Back" />
                            </div>
                        </ReactCardFlip>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePatient;