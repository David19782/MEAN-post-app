const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const router = express.Router();
const User = require("../models/user");
const user = require("../models/user");


router.post("/signup", (req,res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    })
    user.save()
    .then(result => {
      res.status(201).json({
        message: "User signup!",
        result: result
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
  })
})

router.post("/login", (req,res, next) => {
  let fetchedUser;
  User.findOne({email: req.body.email})
  .then(user => {
    if(!user){
      res.status(401).json({
        message: "Auth failed"
      })
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password,fetchedUser.password);
  })
  .then(comp => {
   // console.log(comp);
    if(!comp){
      return res.status(401).json({
        message: "Auth failed"
      })
    }
    const token = jwt.sign({email: fetchedUser.email, id: fetchedUser._id}, "secret_this_should_be_longer", {expiresIn: "1h"})
   // console.log(token)
    res.status(201).json({
      expiresIn: 3600,
      token: token,
      userId: fetchedUser._id
    })
  })
  .catch( err => {
   // console.log(err)
    res.status(401).json({
      message: "Auth failed"
    })
  })
})

module.exports = router;
