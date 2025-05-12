import React, { useState, useEffect } from "react";
import "./dr_home.css";
import editIcon from "../../assets/images/edit_profile.png";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import defaultimg from "../../assets/images/image.jpg";
import bg from "../../assets/images/patinet_bg.avif";

const DoctorProfile = ({ isSidebarVisible, toggleSidebar }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "N/A",
        specialization: "N/A",
        education: "N/A",
        services: [],
        profilePicture: "N/A",
        gender: "Other",
        consultationFee: 0,
        yearOfExperience: 0,
    });

    const [uploadedImage, setUploadedImage] = useState(null);

    const { email } = useAuth();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (!email) return; // Prevent fetching if email is missing
            try {
                const response = await axios.get("http://localhost:5000/api/auth/doctor-details", { params: { email } });
                const services = response.data.services === "N/A" ? [] : response.data.services;
                setProfileData({ ...response.data, services });
            } catch (error) {
                console.error("Error fetching doctor details:", error);
            }
        };

        fetchDoctorDetails();
    }, [email]);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setUploadedImage(e.target.result);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleServiceChange = (index, value) => {
        const newServices = [...profileData.services];
        newServices[index] = value;
        setProfileData({
            ...profileData,
            services: newServices,
        });
    };

    const addService = () => {
        setProfileData({
            ...profileData,
            services: [...profileData.services, ""],
        });
    };

    const removeService = (index) => {
        const newServices = profileData.services.filter((_, i) => i !== index);
        setProfileData({
            ...profileData,
            services: newServices,
        });
    };

    const saveChanges = async () => {
        try {
            await axios.put("http://localhost:5000/api/auth/update-doctor", {
                email,
                ...profileData,
                profilePicture: uploadedImage || profileData.profilePicture,
            });
            setIsEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div
            className={`doc-home-container ${isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"}`}
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                paddingTop: '80px', // Adds space from the top to bring the card lower
            }}
        >
            <div className="scrollable-container" style={{ width: '100%', maxWidth: '900px' }}>
                <div
                    className={`doctor-profile-card ${isSidebarVisible ? "with-sidebar" : ""}`}
                    style={{
                        margin: '0 auto',
                        marginTop: '2rem',
                        marginBottom: '2rem',
                    }}
                >
                    <div className="profile-image-container-doc">
                        <img
                            src={uploadedImage || (profileData.profilePicture === "N/A" ? defaultimg : profileData.profilePicture)}
                            alt="Doctor"
                            className="profile-image-doc"
                        />
                        {isEditMode && (
                            <label className="edit-icon">
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />
                                <img src={editIcon} alt="Edit" className="edit-icon-image" />
                            </label>
                        )}
                        <button className="edit-profile-btn" onClick={isEditMode ? saveChanges : toggleEditMode}>
                            {isEditMode ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>
                    <div className={`profile-details ${isEditMode ? "scrollable-form-container" : ""}`}>
                        <div className="profile-field">
                            {isEditMode ? (
                                <>
                                    <h3 className="field-label">Full Name</h3>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleInputChange}
                                        className="profile-input"
                                    />
                                </>
                            ) : (
                                <>
                                    <h3>{profileData.name}</h3>
                                </>
                            )}
                        </div>

                        <div className="profile-field">
                            <h5 className="field-label"><b>Specialization</b></h5>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="specialization"
                                    value={profileData.specialization}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                <p className="field-value">{profileData.specialization}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <h5 className="field-label"><b>Medical Education</b></h5>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="education"
                                    value={profileData.education}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                <p className="field-value">{profileData.education}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <h5 className="field-label"><b>Gender</b></h5>
                            {isEditMode ? (
                                <select
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <p className="field-value">{profileData.gender}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <h5 className="field-label"><b>Years of Experience</b></h5>
                            {isEditMode ? (
                                <input
                                    type="number"
                                    name="yearOfExperience"
                                    value={profileData.yearOfExperience}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="profile-input"
                                />
                            ) : (
                                <p className="field-value">{`${profileData.yearOfExperience} years`}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <h5 className="field-label"><b>Consultation Fee</b></h5>
                            {isEditMode ? (
                                <input
                                    type="number"
                                    name="consultationFee"
                                    value={profileData.consultationFee}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="profile-input"
                                />
                            ) : (
                                <p className="field-value">{`Rs. ${profileData.consultationFee}`}</p>
                            )}
                        </div>

                        <div className="profile-field">
                            <h5 className="field-label"><b>Services</b></h5>
                            <div className="field-value">
                                <ul className="services-list">
                                    {profileData.services.map((service, index) => (
                                        <li key={index} className="service-item">
                                            {isEditMode ? (
                                                <div className="service-input-controls">
                                                    <input
                                                        type="text"
                                                        value={service}
                                                        onChange={(e) => handleServiceChange(index, e.target.value)}
                                                        className="profile-input service-input"
                                                    />
                                                    <div className="service-buttons">
                                                        <button className="minus" onClick={() => removeService(index)}>-</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                service
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {isEditMode && (
                                    <div className="add-service">
                                        <button className="plus" onClick={addService}>+ Add Service</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;