const { Tasks } = require('../models');

exports.createTask = async (req, res) => {
  const { task, due_date } = req.body;
  try {
    const t = await Tasks.create({ task, due_date, UserId: req.user.id });
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Tasks.findAll({ where: { UserId: req.user.id } });
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { task, due_date, is_done } = req.body;
  try {
    const t = await Tasks.findOne({ where: { id, UserId: req.user.id } });
    if (!t) return res.status(404).json({ error: "Task not found" });
    t.task = task;
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
    const deleted = await Tasks.destroy({ where: { id, UserId: req.user.id } });
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
