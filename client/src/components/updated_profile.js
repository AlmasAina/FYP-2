import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../components/firebase'; // Ensure this points to your Firebase setup file

const UpdatedProfile = () => {
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const response = await axios.post('http://localhost:5000/api/auth/save-email', { email: user.email });
                    setEmail(response.data.user.email);
                }
            } catch (error) {
                console.error('Error fetching email:', error);
            }
        };

        fetchEmail();
    }, []);

    return (
        <div>
            <h1>Welcome to Your Profile</h1>
            <p>Email: {email}</p>
        </div>
    );
};

export default UpdatedProfile;
