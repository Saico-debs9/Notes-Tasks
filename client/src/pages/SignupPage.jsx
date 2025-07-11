import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/authService';
import { toast } from 'react-toastify';
import '../styles/App.css';



const SignupPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      toast.success('Signup successful. Please Login');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className='form-container'>
     
      <div>
      
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} />
        <button type="submit">Signup</button>
        <div className='link-container'><span>Already have an account?</span><a className="link" href="/login">Login</a>
        </div>

      </form>
      </div>
      </div>
  );
};

export default SignupPage;
