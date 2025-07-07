import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from '../services/notesService';
import { toast } from 'react-toastify';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editId, setEditId] = useState(null);

  const loadNotes = async () => {
    try {
      const res = await fetchNotes();
      setNotes(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load notes');
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateNote(editId, form);
        toast.success('Note updated');
      } else {
        await createNote(form);
        toast.success('Note created');
      }
      setForm({ title: '', content: '' });
      setEditId(null);
      loadNotes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content });
    setEditId(note.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      toast.success('Note deleted');
      loadNotes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <h2>Notes</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} />
        <button type="submit">{editId ? 'Update' : 'Add'} Note</button>
      </form>

      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <strong>{note.title}</strong>: {note.content}
            <button onClick={() => handleEdit(note)}>Edit</button>
            <button onClick={() => handleDelete(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesPage;
