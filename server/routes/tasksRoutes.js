const express = require('express');
const router = express.Router();
const auth = require('../controllers/tokenController');
const tasksController = require('../controllers/tasksController');

router.use(auth);

router.post('/createTasks', tasksController.createTask);
router.get('/getTasks', tasksController.getTasks);
router.put('/:id/updateTasks', tasksController.updateTask);
router.delete('/:id/deleteTasks', tasksController.deleteTask);

module.exports = router;
