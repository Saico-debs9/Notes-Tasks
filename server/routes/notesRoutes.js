const express = require('express');
const router = express.Router();
const auth = require('../controllers/tokenController');
const notesController = require('../controllers/notesController');

router.use(auth);

router.post('/createNotes', notesController.createNote);
router.get('/getNotes', notesController.getNotes);
router.put('/:id/updateNotes', notesController.updateNote);
router.delete('/:id/deleteNotes', notesController.deleteNote);

module.exports = router;
