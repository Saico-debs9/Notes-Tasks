const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

app.use(cors());
app.use(express.json());

// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// const notesRoutes = require('./routes/notesRoutes');
// const tasksRoutes = require('./routes/tasksRoutes');

// app.use('/api/notes', notesRoutes);
// app.use('/api/tasks', tasksRoutes);

const port= process.env.PORT;
app.get('/', (req, res) => res.send('Backend is alive!'));
async function startServer() {
  try {
   
   //  await sequelize.sync(); 
   //  console.log("Database synced");
    app.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`Backend running on ${port}`);
    });
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  }
}
startServer();
