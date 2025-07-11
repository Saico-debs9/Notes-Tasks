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

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const res = await fetchTasks();
    const tasksWithSubtasks = res.data.map(t => ({
    ...t,
    Subtasks: t.Subtasks && t.Subtasks.length > 0
      ? t.Subtasks
      : [{ title: '', is_done: false }]
  }));
    setTasks(tasksWithSubtasks);
  };

  const handleAddClick = () => {
    setFormData({ title: '', date: '', time: '', subtasks: [], id: null });
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
    await updateTask(task.id, { is_done: !task.is_done });
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

      // Clone tasks to modify safely
      const updatedTasks = [...tasks];

      // Find task index in state
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const task = updatedTasks[taskIndex];

      // Save current subtask if needed
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

      // Append a new empty subtask to UI state
      task.Subtasks.push({ title: '', is_done: false });

      // Update the state
      updatedTasks[taskIndex] = task;
      setTasks(updatedTasks);

      // Focus the new input field after rendering
      setTimeout(() => {
        const newIdx = task.Subtasks.length - 1;
        if (!subtaskRefs.current[taskId]) subtaskRefs.current[taskId] = [];
        if (subtaskRefs.current[taskId][newIdx]) {
          subtaskRefs.current[taskId][newIdx].focus();
        }
      }, 0);
    }
  };


  // const handleSubtaskChange = (e, taskId, index) => {
  //   const newTasks = tasks.map(t => {
  //     if (t.id === taskId) {
  //       const updatedSubtasks = [...t.Subtasks];
  //       updatedSubtasks[index].title = e.target.value;
  //       return { ...t, Subtasks: updatedSubtasks };
  //     }
  //     return t;
  //   });
  //   setTasks(newTasks);
  // };
  // const handleTaskFieldChange = (e, taskId) => {
  //   const newTasks = tasks.map(t => {
  //     if (t.id === taskId) {
  //       return { ...t, title: e.target.value };
  //     }
  //     return t;
  //   });
  //   setTasks(newTasks);
  // };




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
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={(e) => handleMainTaskToggle(e, task)}
            />
            {editingTask === task.id ? (
              <>
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => handleEditFieldChange(task.id, 'title', e.target.value)}
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
            ) : (
              <>
                <h4>{task.title}</h4>
                <p>{task.due_date ? new Date(task.due_date).toLocaleString() : ''}</p>
                <div className="subtasks">
                  {task.Subtasks.map((subtask, idx) => (
                    <div key={subtask.id || idx} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtask.is_done}
                        onChange={() => handleSubtaskToggle(task.id, idx)}
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
                        const updated = [...formData.subtasks];
                        updated[idx].title = e.target.value;
                        setFormData({ ...formData, subtasks: updated });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setFormData({ ...formData, subtasks: [...formData.subtasks, { title: '', is_done: false }] });
                          setTimeout(() => subtaskRefs.current[idx + 1]?.focus(), 0);
                        }
                      }}
                      ref={el => subtaskRefs.current[idx] = el}
                    />
                  </div>
                ))}
                {formData.subtasks.length === 0 && (
                  <div className="subtask-form-item">
                    <input
                      type="text"
                      placeholder="Subtask title"
                      value=""
                      onChange={(e) => setFormData({ ...formData, subtasks: [{ title: e.target.value, is_done: false }] })}
                    />
                  </div>
                )}
              </div>
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
