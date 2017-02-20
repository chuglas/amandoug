const express = require('express');
const multer  = require('multer');
const passport       = require("passport");
const ensureLogin    = require("connect-ensure-login");
const User = require('../models/user');
const Event = require('../models/event');
const Photo = require('../models/photo');



const router = express.Router();


router.get('/new-event', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('new-event');
})

router.post('/new-event', ensureLogin.ensureLoggedIn(), (req, res, next) => {
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

// ------------------------------------------------------------------------------
// RENDERING EVENT PAGE
// ------------------------------------------------------------------------------

router.get('/events/:eventId', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  var eventId = req.params.eventId;

  Event.findById(eventId, (err, eventObject) => {
    if (err) { return next(err); }
    console.log("event object: " + eventObject)
    res.render('event', { eventObject });
  });

})

// ------------------------------------------------------------------------------
// UPLOADING PHOTOS
// ------------------------------------------------------------------------------

var upload = multer({ dest: './public/uploads/' });

router.post('/events/:eventId/upload', ensureLogin.ensureLoggedIn(), upload.single('file'), function(req, res){

  var eventIdParam = req.params.eventId;

  const pic = {
    eventId: eventIdParam,
    name: req.body.name,
    description: req.body.description,
    url_path: `/uploads/${req.file.filename}`,
  };

  const newPic = new Photo(pic);

  newPic.save((err) => {
      res.redirect(`/events/${eventIdParam}`);
  });

  Event.findByIdAndUpdate(
    eventIdParam,
    {$push: {eventPhotos: newPic}},
    {safe: true, upsert: true},
    function(err, model) {
        console.log(err);
    }
  );

});

// ------------------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------------------
module.exports = router;
