import React, { useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { toast } from 'react-toastify';
import '../styles/Login.css';
import GoogleLoginButton from '../components/GoogleLoginButton'


const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const [shake, setShake] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      
      const decoded = jwtDecode(res.data.token);
      const expiryTime = decoded.exp * 1000; 
      const delay = expiryTime - Date.now();

      if (delay > 0) {
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, delay);
      } else {
        localStorage.removeItem('token');
        navigate('/login');
      }
      
      navigate('/');
      toast.success('Logged in successfully');
    } catch (err) {
      console.log(err);
      setShake(true);
      setTimeout(()=>setShake(false), 500);
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    
    <div className='login-page'>
     
      <div className='login-card'>
        
      <h2>Login</h2>
        <form onSubmit={handleSubmit} className='login-form'>
          <input name="username" placeholder="Username" onChange={handleChange} className={shake ? 'shake' : ''} />
          <input name="password" placeholder="Password" type="password" onChange={handleChange} className={shake ? 'shake' : ''} />
          <button type="submit">Login</button>
          <div className='link-container'><span>New here?</span><a className="link" href="/signup">Signin</a>
            <GoogleLoginButton />
          </div>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
