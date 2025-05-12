import React from 'react';
import './head_footer.css';

function Footer() {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5>CareTransact</h5>
            <p className="text-muted">Transforming healthcare payments for a better tomorrow.</p>
            <div className="social-icons">
              <a href="#" className="text-white me-3">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#book-appointment" className="text-muted">Book Appointment</a>
              </li>
              <li>
                <a href="#" className="text-muted">About Us</a>
              </li>
              <li>
                <a href="#" className="text-muted">Contact</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2">
            <h5>Services</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-muted">Claims Processing</a>
              </li>
              <li>
                <a href="#" className="text-muted">Lab Services</a>
              </li>
              <li>
                <a href="#" className="text-muted">Billing & Payments</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h5>Contact</h5>
            <p className="text-muted">Email: careTransact@caretransact.firebaseapp.com</p>
            <p className="text-muted">Phone: +1 234 567 890</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;