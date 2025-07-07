import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import NotesPage from './NotesPage';
import TasksPage from './TasksPage';
import '../styles/Dashboard.css'
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('notes');

  const handleSwipeLeft = () => {
    setActiveTab('tasks');
  };

  const handleSwipeRight = () => {
    setActiveTab('notes');
  };
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true // enables swipe with mouse on desktop
  });
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  return (
    <div className="dashboard-container" {...handlers}>
      <div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>

      </div>
      <div className="tab-buttons">
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

      <div className="tab-slider">
        <div className={`tab-slide ${activeTab === 'notes' ? 'left' : 'right'}`}>
          <div className="tab-panel">
            <NotesPage />
          </div>
          <div className="tab-panel">
            <TasksPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
