const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher, updateTeacher } = require('../controllers/teacherController');

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);
router.put('/update', updateTeacher);

module.exports = router;