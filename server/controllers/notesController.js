const { Notes } = require('../models');

exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await Notes.create({ title, content, UserId: req.user.id });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Notes.findAll({ where: { UserId: req.user.id } });
    res.json(notes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const note = await Notes.findOne({ where: { id, UserId: req.user.id } });
    if (!note) return res.status(404).json({ error: "Note not found" });
    note.title = title;
    note.content = content;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Notes.destroy({ where: { id, UserId: req.user.id } });
    if (!deleted) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
