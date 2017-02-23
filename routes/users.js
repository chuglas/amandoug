var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Event = require('../models/event');
const ensureLogin    = require("connect-ensure-login");


/* GET users listing. */
router.get("/:username", (req, res, next) => {

  var userParam = req.params.username;

  User.findOne({username: userParam })
    .populate('userEvents')
    .exec((err, user)=>{
      if (err) { next(err); }
      let sameUser = (res.locals.isUserLoggedIn && res.locals.currentUser.username === userParam ) ? true : false;
      var userLink = null;
      if (req.session.passport) {
         userLink = res.locals.currentUser.username;
      }
      res.render("auth/profile", { user: user, sameUser: sameUser, userLink});
  });
});


module.exports = router;
