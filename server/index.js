const express = require('express');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://notes-tasks-nu.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // respond immediately to preflight
  }
  next();
});

app.use(express.json());
app.options("*", cors());


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const notesRoutes = require('./routes/notesRoutes');
const tasksRoutes = require('./routes/tasksRoutes');

app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);



const port = process.env.PORT || 9089;


app.listen(port, '0.0.0.0', () => {
      console.log(`Backend running on ${port}`);
    });

sequelize.sync()
  .then(() => {
    console.log("Database synced successfully");
    
  })
  .catch(err => {
    console.error('Database sync error:', err);
  });
