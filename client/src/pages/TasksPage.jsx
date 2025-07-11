import React, { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/tasksService';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', id: null });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const res = await fetchTasks();
    setTasks(res.data);
  };

  const handleAddClick = () => {
    setFormData({ title: '', date: '', time: '', id: null });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return alert('Task cannot be empty');

    const due_date = formData.date && formData.time
      ? `${formData.date} ${formData.time}:00`
      : null;

    const payload = {
      title: formData.title,
      due_date,
      is_dont: false,
    };
    try {
      if (formData.id) {
        const updated = await updateTask(formData.id, payload);
        setTasks(tasks.map(t => t.id === updated.data.id ? updated.data : t));
      } else {
        const created = await createTask(payload);
        setTasks([...tasks, created.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error saving task");
    }
  };
  const handleEdit = (task) => {
    const [date, time] = task.due_date
      ? task.due_date.split('T')
      : ['', ''];

    setFormData({
      id: task.id,
      title: task.title,
      date: date || '',
      time: time ? time.substring(0, 5) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    }
  };
  const handleToggleDone = async (task) => {
    const updated = await updateTask(task.id, {
      title: task.title,
      due_date: task.due_date,
      is_done: !task.is_done,
    });
    setTasks(tasks.map(t => t.id === updated.data.id ? updated.data : t));
  };
  const handleLongPress = (task) => {
    handleDelete(task.id);
  };

  const handleRightClick = (e, task) => {
    e.preventDefault();
    handleDelete(task.id);
  };

  return (
    <div className="tasks-container">
      <div className="tasks-grid">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card ${task.is_done ? 'done' : ''}`}
            onClick={() => handleEdit(task)}
            onContextMenu={(e) => handleRightClick(e, task)}
            onTouchStart={(e) => {
              let timer = setTimeout(() => handleLongPress(task), 1000);
              e.target.addEventListener('touchend', () => clearTimeout(timer), { once: true });
            }}
          >
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={() => handleToggleDone(task)}
            />
            <h4>{task.title}</h4>
            <p>{task.due_date ? new Date(task.due_date).toLocaleString() : ''}</p>
          </div>
        ))}
      </div>

      <button className="add-task-btn" onClick={handleAddClick}>+</button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="task-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="task-form"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <input
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
              <button className="save-btn" onClick={handleSave}>✔</button>
              <button className="cancel-btn" onClick={() => setShowForm(false)}>✖</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
