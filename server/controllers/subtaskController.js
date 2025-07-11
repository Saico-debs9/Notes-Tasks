const {Tasks, SubTasks}= require("../models");
const { updateTaskStatus } = require("./tasksController");

exports.createSubtask = async (req, res) => {
  const { task_id, title } = req.body;
  try {
    const st = await SubTasks.create({ task_id, title });
    res.json(st);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSubtask = async (req, res) => {
  const { id } = req.params;
  const { title, is_done } = req.body;
  try {
    const st = await SubTasks.findByPk(id);
    if (!st) return res.status(404).json({ error: 'Subtask not found' });

    if (title !== undefined) st.title = title;
    if (is_done !== undefined) st.is_done = is_done;

    await st.save();

    await updateTaskStatus(st.task_id);

    res.json(st);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

