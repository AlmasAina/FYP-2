import React from 'react';
import './head_footer.css';
import { useNavigate } from 'react-router-dom';
import { navigate } from '../../node_modules/react-big-calendar/lib/utils/constants';

function Header() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/Login');
  };
  const handleLandingpage=()=>{
      navigate('/LP')
   }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top bg-gradient">
      <div className="container">
        <a className="navbar-brand" href="#">
          <i className="bi bi-heart-pulse-fill me-2"></i>CareTransact
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
          <li className="nav-item">
             <a className="nav-link active" onClick={handleLandingpage}>Home</a>
         </li>
            <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
            <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            <li className="nav-item">
              <button className="btn btn-light ms-2" onClick={handleLogin}>Login</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
