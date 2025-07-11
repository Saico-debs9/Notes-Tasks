const express = require('express');
const router = express.Router();
const auth = require('../controllers/tokenController');
const tasksController = require('../controllers/tasksController');
const subTaskController = require('../controllers/subtaskController');

router.use(auth);

router.post('/createTasks', tasksController.createTask);
router.get('/getTasks', tasksController.getTasks);
router.put('/:id/updateTasks', tasksController.updateTask);
router.delete('/:id/deleteTasks', tasksController.deleteTask);
router.post('/createSubtask', subTaskController.createSubtask);
router.put('/updateSubtask/:id', subTaskController.updateSubtask);

module.exports = router;
