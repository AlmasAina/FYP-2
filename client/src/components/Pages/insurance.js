import React, { useState, useEffect } from "react";
import { FaHourglassHalf, FaClock, FaTimes, FaCheckCircle, FaSpinner, FaEllipsisH } from "react-icons/fa";
import "./insurance.css";
import insuranceCardImage from "../../assets/images/card_front.png";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ReactCardFlip from "react-card-flip";
import { useAuth } from "../../context/AuthContext"; // Import Auth Context
import axios from "axios"; // Import axios for API calls
import { toast, ToastContainer } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const InsuranceDashboard = () => {
  const { email } = useAuth(); // Get logged-in email
  const [showInsuranceCard, setShowInsuranceCard] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [acceptedClaims, setAcceptedClaims] = useState([]);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [showClaimDetails, setShowClaimDetails] = useState(null);
  const [showProcessedPopup, setShowProcessedPopup] = useState(false);
  const [showAcceptedClaimsPopup, setShowAcceptedClaimsPopup] = useState(false);
  const [showAcceptedClaimDetails, setShowAcceptedClaimDetails] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyClaims, setCompanyClaims] = useState([]);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [underReviewClaimsCount, setUnderReviewClaimsCount] = useState(0);
  const [underReviewClaims, setUnderReviewClaims] = useState([]); // ✅ Add this line
  const [showUnderReviewClaimDetails, setShowUnderReviewClaimDetails] = useState(null);
  const [claimsSummary, setClaimsSummary] = useState([]);
  const [showWaitingPopup, setShowWaitingPopup] = useState(false); // Ensure this is initialized as false

  const [pendingConfirmationCount, setPendingConfirmationCount] = useState(0);
  const [cardDetails, setCardDetails] = useState({ insuranceCardFront: "", insuranceCardBack: "" });


  //for the card display
  const [waitingClaims, setWaitingClaims] = useState([
    "user1@gmail.com",
    "user2@gmail.com",
    "user3@gmail.com",
    "user4@gmail.com",
  ]);
  const [selectedName, setSelectedName] = useState("");
  const [showDetailPopup, setShowDetailPopup] = useState(false);


  // Fetch insurance card details from the backend
  const fetchInsuranceCardDetails = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/insurance-card-details/${email}`
      );
      setCardDetails(response.data);
      setShowDetailPopup(true); // Show detailed popup with cards
    } catch (error) {
      console.error("Error fetching insurance card details:", error);
    }
  };

  // Fetch insurance card details from the backend
  // const fetchInsuranceCardDetailsByEmail = async (email) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:5000/api/auth/pending-confirmation/${email}`
  //     );
  //     setCardDetails(response.data);
  //     setShowDetailPopup(true); // Show detailed popup with cards
  //   } catch (error) {
  //     console.error("Error fetching insurance card details:", error);
  //   }
  // };

  const fetchInsuranceCardDetailsByEmail = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/pending-confirmation/${email}`
      );

      setCardDetails({
        insuranceCardFront: response.data.insuranceCardFront,
        insuranceCardBack: response.data.insuranceCardBack
      });
      setShowDetailPopup(true);
    } catch (error) {
      console.error("Error fetching insurance card details:", error);
    }
  };


  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        if (email) {
          const response = await axios.get(`http://localhost:5000/api/auth/get-company/${email}`);
          setCompanyDetails(response.data); // ✅ Ensure this is correctly defined
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      }
    };

    fetchCompanyDetails();
  }, [email]);

  useEffect(() => {
    const fetchPendingConfirmations = async () => {
      if (!companyDetails || !companyDetails.name) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/pending-confirmations/${companyDetails.name}`
        );
        setPendingConfirmationCount(response.data.length);
      } catch (error) {
        console.error("Error fetching pending confirmations:", error);
      }
    };
    fetchPendingConfirmations();
  }, [companyDetails]);

  const fetchPendingConfirmationDetails = async () => {
    if (!companyDetails || !companyDetails.name) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/pending-confirmation-details/${companyDetails.name}`
      );
      if (Array.isArray(response.data)) {
        setWaitingClaims(response.data);
      } else {
        setWaitingClaims([]); // Set empty if response is not an array
      }
      setShowWaitingPopup(true); // Show the popup only on card click
    } catch (error) {
      console.error("Error fetching pending confirmation details:", error);
    }
  };
  // insurance.js
  useEffect(() => {
    // Fetch pending confirmation details only when the card is clicked


    fetchPendingConfirmationDetails();
  }, [companyDetails]);
  // On clicking the Waiting Claims card
  const handleWaitingClaimsClick = () => {
    fetchPendingConfirmationDetails(); // Fetch data when the card is clicked
  };


  useEffect(() => {
    const fetchClaimsSummary = async () => {
      if (!companyDetails || !companyDetails.name) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/insurance/claims-summary/${companyDetails.name}`
        );

        setClaimsSummary(response.data); // Set formatted data
      } catch (error) {
        console.error("Error fetching claims summary:", error);
      }
    };
    fetchClaimsSummary();
  }, [companyDetails]);


  useEffect(() => {
    const fetchCompanyClaims = async () => {
      if (!companyDetails || !companyDetails.name) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/insurance/company-claims/${companyDetails.name}`
        );

        setCompanyClaims(response.data);
        setPendingClaimsCount(response.data.length); // ✅ Store total count
      } catch (error) {
        console.error("Error fetching company claims:", error);
      }
    };

    fetchCompanyClaims();
  }, [companyDetails]);

  useEffect(() => {
    const fetchUnderReviewClaims = async () => {
      if (!companyDetails || !companyDetails.name) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/insurance/company-processing-claims/${companyDetails.name}`
        );

        setUnderReviewClaims(response.data); // ✅ This will now work correctly
      } catch (error) {
        console.error("Error fetching under review claims:", error);
      }
    };

    fetchUnderReviewClaims();
  }, [companyDetails]);


  const fetchClaimDetails = async (claimId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/claims/details/${claimId}`);
      setShowClaimDetails(response.data);
    } catch (error) {
      console.error("Error fetching claim details:", error);
    }
  };

  useEffect(() => {
    const fetchAcceptedClaims = async () => {
      if (!companyDetails || !companyDetails.name) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/insurance/accepted-claims/${companyDetails.name}`
        );

        setAcceptedClaims(response.data);  // ✅ Store fetched accepted claims
      } catch (error) {
        console.error("Error fetching accepted claims:", error);
      }
    };

    fetchAcceptedClaims();
  }, [companyDetails]);
  const handleCloseInsuranceCard = () => {
    setShowInsuranceCard(false); // ✅ Close the insurance card
    setShowClaimDetails(null); // ✅ Ensure claim details popup remains closed
    setShowUnderReviewClaimDetails(null); // ✅ Ensure it does not show unwanted popups
    setShowPendingPopup(false); // ✅ Explicitly prevent pending popup from appearing
  };

  const fetchAcceptedClaimDetails = async (claimId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/claims/details/${claimId}`);
      setShowAcceptedClaimDetails(response.data);
    } catch (error) {
      console.error("Error fetching accepted claim details:", error);
    }
  };
  useEffect(() => {
    const fetchUnderReviewClaims = async () => {
      if (!companyDetails || !companyDetails.name) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/insurance/company-processing-claims/${companyDetails.name}`
        );

        setUnderReviewClaims(response.data); // ✅ Update state with fetched claims
      } catch (error) {
        console.error("Error fetching under review claims:", error);
      }
    };

    fetchUnderReviewClaims();
  }, [companyDetails]);

  useEffect(() => {
    const fetchUnderReviewClaims = async () => {
      if (!companyDetails || !companyDetails.name) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/insurance/company-processing-claims/${companyDetails.name}`
        );

        setUnderReviewClaims(response.data); // ✅ Update state with fetched claims
        setUnderReviewClaimsCount(response.data.length); // ✅ Store total count
      } catch (error) {
        console.error("Error fetching under review claims:", error);
      }
    };

    fetchUnderReviewClaims();
  }, [companyDetails]);


  const handleAcceptClaim = async (claimId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/auth/claims/approve/${claimId}`);

      if (response.status === 200) {
        toast.success("Claim Approved!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { background: "#28a745", color: "#fff", borderRadius: "5px" } // Green success styling
        });

        setShowClaimDetails(null); // Close the popup
        setTimeout(() => {
          window.location.reload(); // Refresh page after toast is shown
        }, 3000);
      }
    } catch (error) {
      console.error("Error approving claim:", error);

      toast.error("Failed to approve claim. Try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { background: "#dc3545", color: "#fff", borderRadius: "5px" } // Red error styling
      });
    }

  };

  const handleMarkAsProcessing = async (claimId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/auth/claims/processing/${claimId}`);

      if (response.status === 200) {
        toast.success("Claim marked as Under Review!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { background: "#28a745", color: "#fff", borderRadius: "5px" } // Custom styling
        });
        setShowClaimDetails(null); // Close the popup
        setTimeout(() => {
          window.location.reload(); // Refresh page after toast is shown
        }, 3000);
      }
    } catch (error) {
      console.error("Error marking claim as processing:", error);
      toast.error("Failed to mark as Under Review. Try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { background: "#dc3545", color: "#fff", borderRadius: "5px" } // Custom styling
      });

    }
  };
  // Frontend function to remove pending confirmation
  const removePendingConfirmation = async (email) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/auth/pending-confirmation/${email}`);

      if (response.status === 200) {
        toast.success("Pending confirmation removed successfully");
        setTimeout(() => {
          window.location.reload(); // Reload the page after success
        }, 1000); // Wait for 1 second before reloading to show the toast
      } else {
        toast.error("Failed to remove pending confirmation");
      }
    } catch (error) {
      console.error("Error removing pending confirmation:", error);
      toast.error("Server error while removing pending confirmation");
    }
  };


  const savePatientData = async () => {
    try {
      if (!companyDetails || !companyDetails.name) {
        alert("Insurance company details are not available.");
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/patient', {
        email: selectedName,
        insuranceCompanyName: companyDetails.name,  // Updated to use companyDetails.name
        insuranceCardFront: cardDetails.insuranceCardFront,
        insuranceCardBack: cardDetails.insuranceCardBack
      });

      if (response.status === 201) {
        alert('Patient data saved successfully');
        setShowDetailPopup(false); // Close the popup after saving
      } else {
        alert(`Error saving data: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      // Enhanced error logging
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Headers:", error.response.headers);
        alert(`Error: ${error.response.data.message || 'Server error occurred'}`);
      } else if (error.request) {
        // Request made but no response received
        console.error("Error Request:", error.request);
        alert('No response from the server. Please check your backend.');
      } else {
        // Something else caused the error
        console.error("Error Message:", error.message);
        alert(`Request error: ${error.message}`);
      }
    }
  };








  const handleOutsideClick = (event) => {
    if (event.target.classList.contains("insurance-card-overlay")) {
      setShowInsuranceCard(false);
    }
  };

  const handleAcceptedClaimClick = (claim) => {
    setShowAcceptedClaimDetails(claim);
  };
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  // Open detailed popup with selected name
  const handleNameClick = (name) => {
    setSelectedName(name);
    setShowDetailPopup(true);
    fetchInsuranceCardDetails(email);
    fetchInsuranceCardDetailsByEmail(name);
  };


  return (


    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {companyDetails ? companyDetails.name : "Insurance Company"}!</h1>
        <div className="header-actions">
        </div>
      </header>

      {/* Cards Section */}
      <div className="card" onClick={() => setShowAcceptedClaimsPopup(true)}>
        <FaCheckCircle className="card-icon accepted-icon" size={30} />
        <h3>Accepted Claims</h3>
        <p>{acceptedClaims.length}</p>  {/* ✅ Display dynamic count */}
      </div>


      <div className="card" onClick={() => setShowProcessedPopup(true)}>
        <FaHourglassHalf className="card-icon check-icon" size={30} />
        <h3>Under Review Claims</h3>
        <p>{underReviewClaimsCount}</p>  {/* ✅ Dynamic count */}
      </div>


      <div className="card" onClick={() => setShowPendingPopup(true)}>
        <FaClock className="card-icon clock-icon" size={30} />
        <h3>Pending Claims</h3>
        <p>{pendingClaimsCount}</p> {/* ✅ Dynamic count */}
      </div>
      {/* Waiting Claims Card */}
      <div className="card" onClick={handleWaitingClaimsClick}>
        <FaEllipsisH className="card-icon waiting-icon" size={30} />
        <h3>Waiting Claims</h3>
        <p>{pendingConfirmationCount}</p>
      </div>


      {showWaitingPopup && (
        <div className="popup-overlay">
          <div className="popup waiting-popup">
            <FaTimes className="close" onClick={() => setShowWaitingPopup(false)} />
            <h2>Waiting Claims</h2>
            <ul className="waiting-claims-list">
              {waitingClaims.length > 0 ? (
                waitingClaims.map((claim, index) => (
                  <li key={index} onClick={() => handleNameClick(claim.email)}>
                    {claim.email}
                  </li>
                ))
              ) : (
                <li>No pending confirmations found</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {showWaitingPopup && (
        <div className="popup-overlay">
          <div className="popup waiting-popup">
            <FaTimes className="close" onClick={() => setShowWaitingPopup(false)} />
            <h2>Waiting Claims</h2>
            <ul className="waiting-claims-list">
              {waitingClaims.map((claim, index) => (
                <li key={index} onClick={() => handleNameClick(claim.email)}>
                  {claim.email}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Detailed Popup with Flippable Card */}
      {showDetailPopup && (
        <div className="popup-overlay">
          <div className="popup detailed-popup">
            <FaTimes className="close top-left" onClick={() => setShowDetailPopup(false)} />
            <h2>Details for: {selectedName}</h2>

            {/* Flippable Card */}
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">

              {/* Front Side */}
              <div className="card-side" onClick={handleFlip}>
                <div className="card-content">
                  <h3>Front Side</h3>
                  {cardDetails.insuranceCardFront ? (
                    <img
                      src={cardDetails.insuranceCardFront}
                      alt="Insurance Card Front"
                      width="300"
                      height="180"
                    />
                  ) : (
                    <p>No Front Card Available</p>
                  )}
                </div>
              </div>

              {/* Back Side */}
              <div className="card-side" onClick={handleFlip}>
                <div className="card-content">
                  <h3>Back Side</h3>
                  {cardDetails.insuranceCardBack ? (
                    <img
                      src={cardDetails.insuranceCardBack}
                      alt="Insurance Card Back"
                      width="300"
                      height="180"
                    />
                  ) : (
                    <p>No Back Card Available</p>
                  )}
                </div>
              </div>
            </ReactCardFlip>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="reject-btn" onClick={() => removePendingConfirmation(selectedName)}>Reject</button>
              <button className="accept-btn" onClick={() => { savePatientData(); removePendingConfirmation(selectedName); }}>Accept</button>
            </div>
          </div>
        </div>
      )
      }






      {/* {companyDetails && (
        <div className="company-info">
          <h2>Company Details</h2>
          <p><strong>Email:</strong> {companyDetails.email}</p>
          <p><strong>Contact Number:</strong> {companyDetails.contactNumber || "N/A"}</p>
          <p><strong>Address:</strong> {companyDetails.address || "N/A"}</p>
          <p><strong>Registration Number:</strong> {companyDetails.registrationNumber || "N/A"}</p>
        </div>
      )} */}

      {/* Pending Claims Popup */}
      {
        showPendingPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Pending Claims</h2>
              <div className="popup-header-row">
                <span>Name</span>
                <span>Doctor</span>
                <span>Date</span>
              </div>

              {companyClaims && companyClaims.length > 0 ? (
                companyClaims.map((claim, index) => (
                  <div key={index} className="claim-item" onClick={() => fetchClaimDetails(claim._id)}>
                    {/* <span>{claim._id}</span> */}
                    <span>{claim.patientName}</span>
                    <span>{claim.doctorName}</span>
                    <span>{new Date(claim.consultancyDate).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p>No pending claims found for your company.</p>
              )}
              <FaTimes className="close" onClick={() => setShowPendingPopup(false)} />
            </div>
          </div>
        )
      }

      {/* Claim Details Popup */}
      {
        showClaimDetails && (
          <div className="popup-overlay">
            <div className="popup claim-details-popup">
              <FaTimes className="close" onClick={() => setShowClaimDetails(null)} />

              <h2>Claim Details</h2>
              <p><strong>Patient Name:</strong> {showClaimDetails.patientName}</p>
              <p><strong>Consultancy Date:</strong> {new Date(showClaimDetails.consultancyDate).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {showClaimDetails.doctorName} ({showClaimDetails?.doctorFee || "N/A"} PKR)</p>

              {/* Medicines Section */}
              <h3>Medicines</h3>
              <div className="details-table">
                {showClaimDetails.medicines && showClaimDetails.medicines.length > 0 ? (
                  showClaimDetails.medicines.map((med, index) => (
                    <div key={index} className="table-row">
                      <span>{med.name}</span>
                      <span>{med.fee} PKR</span>
                    </div>
                  ))
                ) : (
                  <p>No medicines found.</p>
                )}
              </div>

              {/* Tests Section */}
              <h3>Medical Tests</h3>
              <div className="details-table">
                {showClaimDetails.labTests && showClaimDetails.labTests.length > 0 ? (
                  showClaimDetails.labTests.map((test, index) => (
                    <div key={index} className="table-row">
                      <span>{test.testName}</span>
                      <span>{test.testFee} PKR</span>
                    </div>
                  ))
                ) : (
                  <p>No lab tests found.</p>
                )}
              </div>

              {/* Total Cost */}
              <h3><strong>Total Amount:</strong> {showClaimDetails?.totalAmount || "N/A"} PKR</h3>

              {/* View Insurance Card Button */}
              <button
                className="insurance-card-btn"
                onClick={() => {
                  if (showClaimDetails) {
                    setShowInsuranceCard(true);
                    setIsFlipped(false);
                  } else {
                    console.error("Claim details not available!");
                  }
                }}
              >
                View Insurance Card
              </button>

              <div className="button-container">
                <button className="accept-btn" onClick={() => handleAcceptClaim(showClaimDetails._id)}>
                  <FaCheckCircle /> Accept
                </button>

                <button className="under-review-btn" onClick={() => handleMarkAsProcessing(showClaimDetails._id)}>
                  <FaHourglassHalf /> Mark as Under Review
                </button>
              </div>



            </div>
          </div>
        )
      }


      {
        showProcessedPopup && (
          <div className="popup-overlay">
            <div className="popup processed-popup">
              <h2>Under Review Claims</h2>

              <div className="processed-popup-header">
                <span>Name</span>
                <span>Doctor</span>
                <span>Date</span>
              </div>

              {underReviewClaims.length > 0 ? (
                underReviewClaims.map((claim, index) => (
                  <div
                    key={index}
                    className="processed-claim-row"
                    onClick={() => setShowUnderReviewClaimDetails(claim)} // ✅ Click to show details
                  >
                    <span>{claim.patientName}</span>
                    <span>{claim.doctorName}</span>
                    <span>{new Date(claim.consultancyDate).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p>No under review claims found.</p>
              )}

              <FaTimes className="close" onClick={() => setShowProcessedPopup(false)} />
            </div>
          </div>
        )
      }

      {/* Insurance Card Popup */}
      {/* Insurance Card Popup */}
      {
        showInsuranceCard && showClaimDetails && (
          <div className="insurance-card-overlay" onClick={(event) => {
            if (event.target.classList.contains("insurance-card-overlay")) {
              setShowInsuranceCard(false);
            }
          }}>
            <div className="insurance-card-container">
              <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">

                {/* Front Side */}
                <div className="card-side" onClick={() => setIsFlipped(true)}>
                  <img
                    src={showClaimDetails.insuranceCardFront || insuranceCardImage}
                    alt="Insurance Card Front"
                    width="300"
                    height="180"
                  />
                </div>

                {/* Back Side */}
                <div className="card-side" onClick={() => setIsFlipped(false)}>
                  <img
                    src={showClaimDetails.insuranceCardBack || insuranceCardImage}
                    alt="Insurance Card Back"
                    width="300"
                    height="180"
                  />
                </div>

              </ReactCardFlip>
            </div>
          </div>
        )
      }

      {
        showUnderReviewClaimDetails && (
          <div className="popup-overlay">
            <div className="popup claim-details-popup">
              <FaTimes className="close" onClick={() => setShowUnderReviewClaimDetails(null)} />

              <h2>Claim Details</h2>
              <p><strong>Patient Name:</strong> {showUnderReviewClaimDetails.patientName}</p>
              <p><strong>Consultancy Date:</strong> {new Date(showUnderReviewClaimDetails.consultancyDate).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {showUnderReviewClaimDetails.doctorName} ({showUnderReviewClaimDetails?.doctorFee || "N/A"} PKR)</p>

              {/* Medicines Section */}
              <h3>Medicines</h3>
              <div className="details-table">
                {showUnderReviewClaimDetails.medicines?.length > 0 ? (
                  showUnderReviewClaimDetails.medicines.map((med, index) => (
                    <div key={index} className="table-row">
                      <span>{med.name}</span>
                      <span>{med.fee} PKR</span>
                    </div>
                  ))
                ) : (
                  <p>No medicines found.</p>
                )}
              </div>

              {/* Lab Tests Section */}
              <h3>Medical Tests</h3>
              <div className="details-table">
                {showUnderReviewClaimDetails.labTests?.length > 0 ? (
                  showUnderReviewClaimDetails.labTests.map((test, index) => (
                    <div key={index} className="table-row">
                      <span>{test.testName}</span>
                      <span>{test.testFee} PKR</span>
                    </div>
                  ))
                ) : (
                  <p>No lab tests found.</p>
                )}
              </div>

              {/* Total Cost */}
              <h3><strong>Total Amount:</strong> {showUnderReviewClaimDetails?.totalAmount || 0} PKR</h3>

              {/* Buttons: View Insurance Card & Accept */}
              {/* Accept Button (Second Row) */}
              <div className="button-row">
                <button className="accept-btn" onClick={() => handleAcceptClaim(showUnderReviewClaimDetails._id)}>
                  <FaCheckCircle /> Accept
                </button>
              </div>
            </div>

          </div>
        )
      }



      {/* Accepted Claims Popup (Brief Info) */}
      {
        showAcceptedClaimsPopup && (
          <div className="popup-overlay">
            <div className="popup accepted-claims-popup">
              <h2>Accepted Claims</h2>
              <div className="popup-header-row">
                <span>Name</span>
                <span>Doctor</span>
                <span>Date</span>
              </div>

              {acceptedClaims.length > 0 ? (
                acceptedClaims.map((claim, index) => (
                  <div
                    key={index}
                    className="claim-item"
                    onClick={() => fetchAcceptedClaimDetails(claim._id)} // Fetch details on click
                  >
                    <span>{claim.patientName}</span>
                    <span>{claim.doctorName}</span>
                    <span>{new Date(claim.consultancyDate).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p>No accepted claims found.</p>
              )}

              <FaTimes className="close" onClick={() => setShowAcceptedClaimsPopup(false)} />
            </div>
          </div>
        )
      }

      {/* Detailed Accepted Claim View */}
      {
        showAcceptedClaimDetails && (
          <div className="popup-overlay">
            <div className="popup claim-details-popup">
              <FaTimes className="close" onClick={() => setShowAcceptedClaimDetails(null)} />

              <h2>Claim Details</h2>
              <p><strong>Patient Name:</strong> {showAcceptedClaimDetails.patientName}</p>
              <p><strong>Consultancy Date:</strong> {new Date(showAcceptedClaimDetails.consultancyDate).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> {showAcceptedClaimDetails.doctorName} ({showAcceptedClaimDetails?.doctorFee || "N/A"} PKR)</p>

              {/* Medicines Section */}
              <h3>Medicines</h3>
              <div className="details-table">
                {showAcceptedClaimDetails.medicines?.length > 0 ? (
                  showAcceptedClaimDetails.medicines.map((med, index) => (
                    <div key={index} className="table-row">
                      <span>{med.name}</span>
                      <span>{med.fee} PKR</span>
                    </div>
                  ))
                ) : (
                  <p>No medicines found.</p>
                )}
              </div>

              {/* Lab Tests Section */}
              <h3>Medical Tests</h3>
              <div className="details-table">
                {showAcceptedClaimDetails.labTests?.length > 0 ? (
                  showAcceptedClaimDetails.labTests.map((test, index) => (
                    <div key={index} className="table-row">
                      <span>{test.testName}</span>
                      <span>{test.testFee} PKR</span>
                    </div>
                  ))
                ) : (
                  <p>No lab tests found.</p>
                )}
              </div>

              {/* Total Cost */}
              <h3><strong>Total Amount:</strong> {showAcceptedClaimDetails?.totalAmount || 0} PKR</h3>



              {showAcceptedClaimDetails?.insuranceCardFront && (
                <button
                  className="insurance-card-btn"
                  onClick={() => {
                    console.log("Accepted Claim Details:", showAcceptedClaimDetails); // ✅ Debugging step
                    setShowInsuranceCard(true);
                    setIsFlipped(false);
                  }}
                >
                  View Insurance Card
                </button>
              )}
            </div>
          </div>
        )
      }
      {
        showInsuranceCard && showAcceptedClaimDetails?.insuranceCardFront && (
          <div className="insurance-card-overlay" onClick={(event) => {
            if (event.target.classList.contains("insurance-card-overlay")) {
              setShowInsuranceCard(false);
            }
          }}>
            <div className="insurance-card-container">
              <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">

                {/* Front Side */}
                <div className="card-side" onClick={() => setIsFlipped(true)}>
                  <img
                    src={showAcceptedClaimDetails.insuranceCardFront || insuranceCardImage}
                    alt="Insurance Card Front"
                    width="300"
                    height="180"
                  />
                </div>

                {/* Back Side */}
                <div className="card-side" onClick={() => setIsFlipped(false)}>
                  <img
                    src={showAcceptedClaimDetails.insuranceCardBack || insuranceCardImage}
                    alt="Insurance Card Back"
                    width="300"
                    height="180"
                  />
                </div>

              </ReactCardFlip>
            </div>
          </div>
        )
      }

      <ResponsiveContainer width={600} height={300}>
        <BarChart
          data={claimsSummary}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={30}
        >
          <XAxis dataKey="month" stroke="#000" />
          <YAxis
            stroke="#000"
            domain={[0, "auto"]}
            tickFormatter={(tick) => Math.round(tick)} // ✅ Ensures only integer values are shown
            allowDecimals={false} // ✅ Prevents decimal values on Y-axis
          />
          <Tooltip
            cursor={{ fill: "none" }}
            contentStyle={{
              backgroundColor: "#0D1B2A",
              borderRadius: "8px",
              border: "1px solid #fff",
              color: "#fff"
            }}
          />
          <Legend />
          <Bar dataKey="Pending" stackId="a" fill="#ff9800" />
          <Bar dataKey="Processed" stackId="a" fill="#4caf50" />
          <Bar dataKey="Accepted" stackId="a" fill="#2196f3" />
        </BarChart>
      </ResponsiveContainer>
    </div >

  );
};

export default InsuranceDashboard;
