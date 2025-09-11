const express = require('express');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();
const cors = require("cors");

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());



const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const notesRoutes = require('./routes/notesRoutes');
const tasksRoutes = require('./routes/tasksRoutes');

app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);





app.get("/", (req, res) => {
  res.send("Backend is alive!");
});



sequelize.sync()
  .then(() => {
    console.log("Database synced successfully");
    const port = process.env.PORT || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Backend running on ${port}`);
    });
    
  })
  .catch(err => {
    console.error('Database sync error:', err);
  });
