import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from '../services/notesService';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/NotesPage.css';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', id: null });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const res = await fetchNotes();
    setNotes(res.data);
  };

  const handleAddClick = async () => {

    setNewNote({ title: '', content: '' });
    setShowForm(true);
  };

  const handleSaveNewNote = async () => {
    if (!newNote.title.trim()) return alert('Title cannot be empty');

    const created = await createNote(newNote);
    setNotes([...notes, created.data]);
    setShowForm(false);
  };
  const handleEditChange = (id, field, value) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, [field]: value } : note
    ));
  };
const handleEdit = (noteId) => {
    setEditingNoteId(noteId);
  };

  const handleEditSave = async (note) => {
    if (!note.title.trim()) return alert('Title cannot be empty');
    const updated = await updateNote(note.id, note);
    setNotes(notes.map(n => n.id === updated.data.id ? updated.data : n));
    setEditingNoteId(null);
  };

const handleNoteChange = (id, field, value) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
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
            onClick={() => handleEdit(note.id)}
            onContextMenu={(e) => handleRightClick(e, note)}
            onTouchStart={(e) => {
              let timer = setTimeout(() => handleLongPress(note), 1000);
              e.target.addEventListener('touchend', () => clearTimeout(timer), { once: true });
            }}
          >
            {editingNoteId === note.id ? (
              <>
                <input
                  value={note.title}
                  onChange={(e) => handleNoteChange(note.id, 'title', e.target.value)}
                />
                <textarea
                  value={note.content}
                  onChange={(e) => handleNoteChange(note.id, 'content', e.target.value)}
                />
               <button
                  className="save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSave(note);
                  }}
                >
                  ✔
                </button>
              </>
            ) : (
              <>
                <h4>{note.title}</h4>
                <p>{note.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
      <button className="add-note-btn" onClick={handleAddClick}>+</button>
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
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <textarea
                placeholder="Content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
              <div className="form-buttons">
                <button className="save-btn" onClick={handleSaveNewNote}>✔</button>
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
