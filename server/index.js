const express = require('express');
require('dotenv').config({ path: '../.env' });
const { sequelize } = require('./models');

const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const notesRoutes = require('./routes/notesRoutes');
const tasksRoutes = require('./routes/tasksRoutes');

app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);



const port = process.env.PORT || 9089;

sequelize.sync().then(() => {
  console.log("Database synced with alter:true");
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on ${port}`);
  });
});
