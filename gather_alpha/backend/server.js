const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://group:12345@cluster0-8mim2.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

app.use('/events', eventsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
