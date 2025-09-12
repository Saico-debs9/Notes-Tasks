import React, { useEffect } from "react";
import { googleLogin } from "../services/authService";
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const handleCredentialResponse = async (response) => {
    try {
      const tokenId = response.credential;
      

      const res = await googleLogin(tokenId);

      localStorage.setItem("token", res.data.token);
      navigate('/');
    } catch (err) {
      console.error("Google login failed", err);
      alert("Google login failed. Try again.");
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      if (window.google && document.getElementById("googleBtn")) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "outline", size: "large" }
        );
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <div id="googleBtn"></div>;
};

export default GoogleLoginButton;
