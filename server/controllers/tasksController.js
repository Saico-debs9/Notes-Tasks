const { Tasks } = require('../models');

exports.createTask = async (req, res) => {
  const { title, due_date } = req.body;
  try {
    const t = await Tasks.create({ title, due_date, user_id: req.user.id });
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Tasks.findAll({ where: { user_id: req.user.id } });
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, due_date, is_done } = req.body;
  try {
    const t = await Tasks.findOne({ where: { id, user_id: req.user.id } });
    if (!t) return res.status(404).json({ error: "Task not found" });
    t.task = title;
    t.due_date = due_date;
    t.is_done = is_done;
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Tasks.destroy({ where: { id, user_id: req.user.id } });
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
