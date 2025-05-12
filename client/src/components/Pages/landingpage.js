import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Header from "../header.js";
import Footer from "../Footer.js";
import './Landingpage.css';

function LP() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: '',
        timeSlot: '',
        department: '',
        notes: '',
        terms: false
    });

    const services = [
        {
            icon: 'bi-currency-exchange',
            title: 'Payment Processing',
            description: 'Secure and efficient healthcare payment solutions'
        },
        {
            icon: 'bi-shield-check',
            title: 'Insurance Verification',
            description: 'Real-time insurance eligibility checks'
        },
        {
            icon: 'bi-graph-up',
            title: 'Analytics Dashboard',
            description: 'Comprehensive financial reporting and insights'
        }
    ];

    const features = [
        {
            icon: 'bi-shield-check',
            title: 'Secure Payments',
            description: 'Bank-grade security for all your healthcare transactions'
        },
        {
            icon: 'bi-clock',
            title: '24/7 Support',
            description: 'Round-the-clock assistance for all your queries'
        },
        {
            icon: 'bi-graph-up',
            title: 'Real-time Analytics',
            description: 'Track your healthcare expenses with detailed insights'
        }
    ];
    const stats = [
        { number: '500+', label: 'Satisfied Patients' },
        { number: '300+', label: 'Successful Surgeries' },
        { number: '150+', label: 'Expert Doctors' },
        { number: '50+', label: 'Awards Won' },
    ];

    const testimonials = [
        {
            name: 'John Doe',
            role: 'Software Engineer',
            quote: 'CareTransact made my healthcare experience seamless and efficient!',
            image: 'https://via.placeholder.com/60',
        },
        {
            name: 'Jane Smith',
            role: 'Marketing Specialist',
            quote: 'The automated claims system saved me a lot of hassle. Highly recommend!',
            image: 'https://via.placeholder.com/60',
        },
    ];
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <>
            <Header />

            {/* Hero Section */}
            <header id="home" className="vh-100 d-flex align-items-center position-relative overflow-hidden">
                <div className="hero-bg-overlay"></div>
                <motion.div
                    className="container position-relative z-index-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="row align-items-center">
                        <div className="col-lg-6 text-white">
                            <motion.h1
                                className="display-4 fw-bold mb-4"
                                initial={{ x: -100 }}
                                animate={{ x: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                            >
                                Welcome to <span className="text-primary">Care</span>Transact
                                <div className="h5 mt-2">Your Healthcare Financial Partner</div>
                            </motion.h1>

                            <motion.p
                                className="lead mb-4"
                                initial={{ x: -100 }}
                                animate={{ x: 0 }}
                                transition={{ duration: 1, delay: 0.4 }}
                            >
                                Revolutionizing healthcare payments with cutting-edge technology
                                <span className="d-block mt-2">✓ Secure Payments  ✓ Real-time Processing  ✓ 24/7 Support</span>
                            </motion.p>

                            <motion.div
                                className="d-flex gap-3"
                                initial={{ x: -100 }}
                                animate={{ x: 0 }}
                                transition={{ duration: 1, delay: 0.6 }}
                            >
                                <motion.a
                                    href="#book-appointment"
                                    className="btn btn-primary btn-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started <i className="bi bi-arrow-right ms-2"></i>
                                </motion.a>
                                <motion.a
                                    href="#services"
                                    className="btn btn-outline-light btn-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Learn More <i className="bi bi-info-circle ms-2"></i>
                                </motion.a>
                            </motion.div>
                        </div>

                        <motion.div
                            className="col-lg-6 d-none d-lg-block"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.8 }}
                        >
                            <div className="hero-image-container">
                                {/* <img
                                    src="LPdoc.jpeg"
                                    alt="LOGO"
                                    className="img-fluid floating-animation"
                                /> */}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className="hero-scroll-indicator"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.2, repeat: Infinity }}
                    >
                        <a href="#services" className="text-white">
                            <i className="bi bi-mouse"></i>
                            <span className="d-block">Scroll Down</span>
                        </a>
                    </motion.div>
                </motion.div>
            </header>
            {/* Services Section */}
            <section id="services" className="services py-5">
                <div className="container">
                    <motion.h2
                        className="text-center mb-5"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        Our Services
                    </motion.h2>
                    <div className="row g-4">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="col-md-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="card h-100">
                                    <div className="card-body text-center">
                                        <i className={`bi ${service.icon} display-4 text-primary mb-3`}></i>
                                        <h5 className="card-title">{service.title}</h5>
                                        <p className="card-text">{service.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="why-choose-us py-5 bg-light">
                <div className="container">
                    <motion.h2
                        className="text-center mb-5"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                    >
                        Why Choose CareTransact?
                    </motion.h2>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="col-lg-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="feature-card text-center">
                                    <div className="feature-icon">
                                        <i className={`bi ${feature.icon}`}></i>
                                    </div>
                                    <h4>{feature.title}</h4>
                                    <p>{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Stats Counter Section */}
            <section className="stats-section py-5">
                <motion.div
                    className="stats-counter container"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="row text-center">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="col-md-3 col-sm-6 mb-4"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <h2 className="display-4 fw-bold text-primary">{stat.number}</h2>
                                <p className="text-white">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials py-5">
                <div className="container">
                    <motion.h2
                        className="text-center mb-5"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                    >
                        What Our Users Say
                    </motion.h2>
                    <div className="row">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="col-md-6 mb-4"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="card h-100 shadow">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="rounded-circle"
                                                    width="60"
                                                />
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h5 className="mb-0">{testimonial.name}</h5>
                                                <p className="text-muted mb-0">{testimonial.role}</p>
                                            </div>
                                        </div>
                                        <p className="card-text">{testimonial.quote}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default LP;