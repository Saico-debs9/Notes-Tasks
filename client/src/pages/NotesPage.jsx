import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from '../services/notesService';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/NotesPage.css';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', id: null });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const res = await fetchNotes();
    setNotes(res.data);
  };

  const handleAddClick = () => {
    setFormData({ title: '', content: '', id: null });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return alert('Title cannot be empty');
    
    if (formData.id) {
      const updated = await updateNote(formData.id, formData);
      setNotes(notes.map(n => n.id === updated.data.id ? updated.data : n));
    } else {
      const created = await createNote(formData);
      setNotes([...notes, created.data]);
    }
    setShowForm(false);
  };

  const handleEdit = (note) => {
    setFormData(note);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const handleLongPress = (note) => {
    handleDelete(note.id);
  };

  const handleRightClick = (e, note) => {
    e.preventDefault();
    handleDelete(note.id);
  };

  return (
    <div className="notes-container">
      <div className="notes-grid">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            onClick={() => handleEdit(note)}
            onContextMenu={(e) => handleRightClick(e, note)}
            onTouchStart={(e) => {
              let timer = setTimeout(() => handleLongPress(note), 1000);
              e.target.addEventListener('touchend', () => clearTimeout(timer), { once: true });
            }}
          >
            <h4>{note.title}</h4>
            <p>{note.content}</p>
          </div>
        ))}
      </div>

      {/* Floating + button - confined within NotesPage only */}
      <button className="add-note-btn" onClick={handleAddClick}>+</button>

      {/* Fade-in form overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="note-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="note-form"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <div className="form-buttons">
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

export default NotesPage;
