const express = require('express');
const router = express.Router();
const auth = require('../controllers/tokenController');
const tasksController = require('../controllers/tasksController');

router.use(auth);

router.post('/', tasksController.createTask);
router.get('/', tasksController.getTasks);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
