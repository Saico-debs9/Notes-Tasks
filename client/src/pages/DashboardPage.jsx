import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import NotesPage from './NotesPage';
import TasksPage from './TasksPage';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const navigate = useNavigate();

  const handleSwipeLeft = () => setActiveTab('tasks');
  const handleSwipeRight = () => setActiveTab('notes');

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container" {...handlers}>
      
      <div className="top-bar">
        <div className='tab-buttons'>
        <button
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>
      <div className='logout-container'>
        <button onClick={handleLogout} className='logout-btn'>Logout</button>
      </div>
      </div>

      <div className="tab-content">
        {activeTab === 'notes' && <NotesPage />}
        {activeTab === 'tasks' && <TasksPage />}
      </div>
    </div>
  );
};

export default DashboardPage;
