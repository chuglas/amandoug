const express = require('express');
const User = require('../models/user');
const Event = require('../models/event');

const router = express.Router();

// router.use((req, res, next) => {
//   if(req.session.currentUser){
//     next();
//     return;
//   }
//
//   res.redirect('/login');
// });

router.get('/new-event', (req, res, next) => {
//   let query;
//
// query = { user: req.session.currentUser._id};
res.render('new-event');
})

router.post('/new-event', (req, res, next) => {
  const eventInfo = {
    name: req.body.name,
    user: res.locals.currentUserId,
    description: req.body.description,
    date: req.body.date
  };
  const newEvent = new Event(eventInfo);

  newEvent.save((err) => {
    if (err) {
    next(err);
    return;
  }

  // console.log('currentUserId : ' + res.locals.currentUserId)
  // User.findById(res.locals.currentUserId, (err, user)=>{
  //   if (err) {return next(err);}
  //
  //   console.log('whole user: ' + user)
  //   console.log('USER EVENTS:  ', user.userEvents);
  //   console.log('NEW event:', newEvent);
  //   user.userEvents.push(newEvent);
  //   $push: { user.userEvents: newEvent};
  // })

  User.findByIdAndUpdate(
    res.locals.currentUserId,
    {$push: {userEvents: newEvent}},
    {safe: true, upsert: true},
    function(err, model) {
        console.log(err);
    }
);

  res.redirect('/profile-page');
})


});



module.exports = router;
