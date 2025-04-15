import React, { useState } from 'react';
import { authAPI } from '../api/auth'; // Adjust the import path as necessary

const AuthForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFacebookLogin = async () => {
        // Call the Facebook login API
        const accessToken = 'your_facebook_access_token'; // Replace with actual token retrieval logic
        try {
            const response = await authAPI.facebookLogin({ access_token: accessToken });
            console.log('Facebook login successful:', response);
        } catch (error) {
            console.error('Facebook login error:', error);
        }
    };

    const handleGoogleLogin = async () => {
        // Call the Google login API
        const accessToken = 'your_google_access_token'; // Replace with actual token retrieval logic
        try {
            const response = await authAPI.googleLogin({ access_token: accessToken });
            console.log('Google login successful:', response);
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleFacebookLogin}>Login with Facebook</button>
            <button onClick={handleGoogleLogin}>Login with Google</button>
        </div>
    );
};

export default AuthForm;
