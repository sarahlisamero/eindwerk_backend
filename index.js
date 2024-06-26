require ('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

//const passport = require('./passport/passport');
const port = 3000;

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const parentsRouter = require('./routes/api/v1/parents');
app.use('/api/v1/parents', parentsRouter);
const childrenRouter = require('./routes/api/v1/children');
app.use('/api/v1/children', childrenRouter);
const tasksRouter = require('./routes/api/v1/tasks');
app.use('/api/v1/tasks', tasksRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
