import React, { useState, useEffect, useRef } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/tasksService';
import { createSubtask, updateSubtask } from '../services/tasksService';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    subtasks: [],
    id: null
  });
  const subtaskRefs = useRef([]);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [focusSubtaskIdx, setFocusSubtaskIdx] = useState(null);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [alertedTasks, setAlertedTasks] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      tasks.forEach((task) => {
        if (!task.is_done && task.due_date) {
          const due = new Date(task.due_date);

          if (due <= now) {
            if (!alertedTasks[task.id]) {
              alert(`Task "${task.title}" is due!`);
              setAlertedTasks(prev => ({ ...prev, [task.id]: true }));
            }
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [tasks, alertedTasks]);


  useEffect(() => {
    if (focusTaskId && focusSubtaskIdx !== null) {
      const ref = subtaskRefs.current[focusTaskId]?.[focusSubtaskIdx];
      if (ref) ref.focus();
      setFocusTaskId(null);
      setFocusSubtaskIdx(null);
    }
  }, [tasks]);
  useEffect(() => {
    loadTasks();
  }, []);


  const loadTasks = async () => {
    const res = await fetchTasks();
    const tasksWithSubtasks = res.data.map(t => ({
      ...t,
      Subtasks: t.Subtasks && t.Subtasks.length > 0
        ? t.Subtasks.sort((a, b) => a.id - b.id)
        : [{ title: '', is_done: false }]
    }));
    setTasks(tasksWithSubtasks);
  };

  const handleAddClick = () => {
    subtaskRefs.current = [];
    setFormData({ title: '', date: '', time: '', subtasks: [{ title: '', is_done: false }], id: null });
    setShowForm(true);
  };
  const handleSave = async () => {
    if (!formData.title.trim()) return alert('Task title cannot be empty');
    if (formData.time && !formData.date) {
      return alert('Please select a date when adding a time.');
    }

    const due_date = formData.date && formData.time
      ? `${formData.date} ${formData.time}:00+05:30`
      : null;


    const payload = {
      title: formData.title,
      due_date,
      is_done: false,
    };
    try {
      const created = await createTask(payload);
      const taskId = created.data.id;

      for (const sub of formData.subtasks) {
        if (sub.title.trim()) {
          await createSubtask({ task_id: taskId, title: sub.title });
        }
      }
      await loadTasks();
      setShowForm(false);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error saving task");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleLongPress = (task) => {
    handleDelete(task.id);
  };

  const handleRightClick = (e, task) => {
    e.preventDefault();
    handleDelete(task.id);
  };

  const handleSubtaskToggle = async (e, taskId, subtask) => {
    e.stopPropagation();
    await updateSubtask(subtask.id, {
      title: subtask.title,
      is_done: !subtask.is_done
    });

    const updatedTask = tasks.find(t => t.id === taskId);
    const allDone = updatedTask.Subtasks.every(s =>
      s.id === subtask.id ? !s.is_done : s.is_done
    );

    await updateTask(taskId, { is_done: allDone });
    await loadTasks();
  };


  const handleMainTaskToggle = async (e, task) => {
    e.stopPropagation();
    const newIsDone = !task.is_done;

    await updateTask(task.id, { is_done: newIsDone });


    for (const subtask of task.Subtasks) {
      if (subtask.id) {
        await updateSubtask(subtask.id, {
          title: subtask.title,
          is_done: newIsDone
        });
      }
    }

    await loadTasks();
  };


  const handleEditFieldChange = (taskId, field, value) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
  };

  const handleSubtaskEditChange = (taskId, index, value) => {
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    updatedTasks[taskIndex].Subtasks[index].title = value;
    setTasks(updatedTasks);
  };

  const handleSubtaskKeyDown = async (e, taskId, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const updatedTasks = [...tasks];

      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const task = updatedTasks[taskIndex];


      const currentSub = task.Subtasks[idx];
      if (currentSub.title.trim()) {
        if (!currentSub.id) {
          try {
            const res = await createSubtask({ task_id: taskId, title: currentSub.title });
            task.Subtasks[idx].id = res.data.id;
          } catch (err) {
            console.error(err);
          }
        } else {
          try {
            await updateSubtask(currentSub.id, {
              title: currentSub.title,
              is_done: currentSub.is_done
            });
          } catch (err) {
            console.error(err);
          }
        }
      }


      task.Subtasks.push({ title: '', is_done: false });
      updatedTasks[taskIndex] = task;
      setTasks(updatedTasks);

      setFocusTaskId(taskId);
      setFocusSubtaskIdx(task.Subtasks.length - 1);



      setTimeout(() => {
        const newIdx = task.Subtasks.length - 1;
        if (!subtaskRefs.current[taskId]) subtaskRefs.current[taskId] = [];
        if (subtaskRefs.current[taskId][newIdx]) {
          subtaskRefs.current[taskId][newIdx].focus();
        }
      }, 0);
    }
  };




  const handleSaveEdit = async (task) => {
    const payload = {
      title: task.title,
      due_date: task.due_date,
      is_done: task.is_done,
    };

    await updateTask(task.id, payload);

    for (const sub of task.Subtasks) {
      if (sub.id) {
        await updateSubtask(sub.id, { title: sub.title, is_done: sub.is_done });
      } else if (sub.title.trim()) {
        await createSubtask({ task_id: task.id, title: sub.title });
      }
    }

    setEditingTask(null);
    await loadTasks();
  };

  return (
    <div className="tasks-container">
      <div className="tasks-grid">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-card ${task.is_done ? 'done' : ''}`}
            onClick={() => setEditingTask(task.id)}
            onContextMenu={(e) => handleRightClick(e, task)}
            onTouchStart={(e) => {
              let timer = setTimeout(() => handleLongPress(task), 1000);
              e.target.addEventListener('touchend', () => clearTimeout(timer), { once: true });
            }}
          >
            <div className='task-main-checkbox'>
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={(e) => handleMainTaskToggle(e, task)}
              />

              {editingTask === task.id ? (
                <input
                  type="text"
                  value={task.title}
                  className="task-title-input"
                  onChange={(e) => handleEditFieldChange(task.id, 'title', e.target.value)}
                />
              ) : (
                <span className="task-title">{task.title}</span>
              )}
            </div>
            {editingTask === task.id && (
              <>
                <input
                  type="date"
                  min={new Date().toLocaleDateString('en-CA').split('T')[0]}
                  value={tempDate || (task.due_date && !isNaN(new Date(task.due_date)) ? new Date(task.due_date).toLocaleDateString('en-CA').split('T')[0] : '')}
                  onChange={(e) => {
                    setTempDate(e.target.value);
                  }}
                  onBlur={(e) => {

                    const newDate = e.target.value;
                    const today = new Date().toLocaleDateString('en-CA').split('T')[0];

                    if (newDate < today) {
                      alert("Date cannot be in the past");
                      setTempDate('');
                      return;
                    }
                    const existingTime = task.due_date && !isNaN(new Date(task.due_date)) ? new Date(task.due_date).toLocaleDateString('en-CA').split('T')[1].slice(0, 5) : '00:00';
                    handleEditFieldChange(task.id, 'due_date', `${newDate} ${existingTime}:00`);
                    setTempDate('');
                  }}
                />
                <input
                  type="time"
                  value={tempTime || (task.due_date && !isNaN(new Date(task.due_date)) ? new Date(task.due_date).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5) : '')}
                  onChange={(e) => {
                    setTempTime(e.target.value);
                  }}
                  onBlur={(e) => {
                    const newTime = e.target.value;
                    const existingDate = task.due_date && !isNaN(new Date(task.due_date)) ? new Date(task.due_date).toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5) : '';
                    handleEditFieldChange(task.id, 'due_date', `${existingDate} ${newTime}:00`);
                  }}
                />

                <div className="subtasks">
                  {(task.Subtasks || []).map((subtask, idx) => (
                    <div key={subtask.id || idx} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtask.is_done}
                        onChange={(e) => handleSubtaskToggle(e, task.id, subtask)}
                      />
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => handleSubtaskEditChange(task.id, idx, e.target.value)}
                        onKeyDown={(e) => handleSubtaskKeyDown(e, task.id, idx)}
                        ref={el => {
                          if (!subtaskRefs.current[task.id]) subtaskRefs.current[task.id] = [];
                          subtaskRefs.current[task.id][idx] = el;
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => handleSaveEdit(task)}>Save</button>
              </>

            )}
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
                min={new Date().toLocaleDateString('en-CA').split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
              <div className="subtasks-form">

                {formData.subtasks.map((subtask, idx) => (
                  <div key={idx} className="subtask-form-item">
                    <input
                      type="text"
                      placeholder="Subtask title"
                      value={subtask.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prevFormData => {
                          const updatedSubtasks = prevFormData.subtasks.map((s, i) => {
                            if (i === idx) {
                              return { ...s, title: value };
                            }
                            return s;
                          });
                          return { ...prevFormData, subtasks: updatedSubtasks };
                        });
                      }}

                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setFormData(prev => {
                            const newSubtasks = [...prev.subtasks, { title: '', is_done: false }];
                            return { ...prev, subtasks: newSubtasks };
                          });

                          setTimeout(() => {
                            const ref = subtaskRefs.current[idx + 1];
                            if (ref && typeof ref.focus === "function") ref.focus();
                          }, 100);
                        }
                      }}

                      ref={el => {
                        if (el) subtaskRefs.current[idx] = el;
                      }}
                    />
                  </div>
                ))}

              </div>
              <div className='form-buttons'>
                <button className="save-btn" onClick={handleSave}>✔</button>
                <button className="cancel-btn" onClick={() => setShowForm(false)}>✖</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
