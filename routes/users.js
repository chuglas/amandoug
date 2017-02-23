var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Event = require('../models/event');
const ensureLogin    = require("connect-ensure-login");

/* GET users listing. */
router.get("/:username", ensureLogin.ensureLoggedIn(), (req, res, next) => {

  var userParam = req.params.username;

  if (req.user.username === req.params.username) {

    User.findOne({username: req.user.username })
        .populate('userEvents')
        .exec((err, user)=>{
          if (err) { next(err) }
          res.render("auth/profile", { user: user, userParam });
        })
  }
  else {
    User.findOne({username: req.params.username })
        .populate('userEvents')
        .exec((err, user2)=>{
          if (err) { next(err) }
          res.render("auth/profilePublic", { user: user2 });
        })
    }
  // console.log(req.user);
});


module.exports = router;
