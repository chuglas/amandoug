const express = require('express');
const multer  = require('multer');
const User = require('../models/user');
const Event = require('../models/event');
const Photo = require('../models/photo');



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

  res.redirect(`/events/${newEvent.id}`);
  })
});


router.get('/events/:eventId', (req, res, next) => {
  var eventId = req.params.eventId;

  Event.findById(eventId, (err, eventObject) => {
    if (err) { return next(err); }
    console.log("event object: " + eventObject)
    res.render('event', { eventObject });
  });

})


var upload = multer({ dest: './public/uploads/' });

router.post('/events/:eventId/upload', upload.single('file'), function(req, res){

  var eventIdParam = req.params.eventId;

  const pic = {
    eventId: eventIdParam,
    name: req.body.name,
    description: req.body.description,
    url_path: `/public/uploads/${req.file.filename}`,
  };

  const newPic = new Photo(pic);

  console.log('picture doc:  ' + newPic);

  newPic.save((err) => {
      res.redirect('/profile-page');
  });
});

module.exports = router;
