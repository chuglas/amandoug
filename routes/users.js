var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Event = require('../models/event');
const ensureLogin    = require("connect-ensure-login");

/* GET users listing. */
router.get("/:username", ensureLogin.ensureLoggedIn(), (req, res, next) => {

  User.findOne({username: req.user.username })
    .populate('userEvents')
    .exec((err, user)=>{
      if (err) { next(err) }
      console.log("user", user.userEvents[0].eventPhotos);
      res.render("auth/profile", { user: user });
    })




  // console.log(req.user);
});


module.exports = router;
