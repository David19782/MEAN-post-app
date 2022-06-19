const path = require("path");
const express = require("express");
const multer = require("multer");

const bodyParser = require("body-parser");
const Post = require('./models/post');
const mongoose = require("mongoose");
const postRoutes = require("./routes/posts")
const userRoutes = require("./routes/user")

const pass = "ySa1D6o9IG2UNhv4";
const passTerm = "lsF4xSu5HoDBpDGK";
const username = "App"


const app = express();

mongoose.connect("mongodb+srv://App:ySa1D6o9IG2UNhv4@nodejs.gjp1h.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to database!")
  })
  .catch(() => {
    console.log("Connection failed!")
  })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use('/images', express.static(path.join("backend/images")))


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-type, Accept, Authorization")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH, OPTIONS, PUT")
  next();
})

app.use("/api/posts",postRoutes);
app.use("/api/user" , userRoutes);





module.exports = app;
