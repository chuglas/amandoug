const express        = require('express');
const multer         = require('multer');
const passport       = require("passport");
const ensureLogin    = require("connect-ensure-login");
const User           = require('../models/user');
const Event          = require('../models/event');
const Photo          = require('../models/photo');
const moment         = require('moment');
const upload         = multer({ dest: './public/uploads/' });

const router = express.Router();

const ObjectID = require('mongodb').ObjectID;

router.get('/:username/events/new-event', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  var userParam = req.params.username;
  res.render('new-event', {userParam});
})

router.post('/:username/events/new-event', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const eventInfo = {
    name: req.body.name,
    _user: res.locals.currentUserId,
    description: req.body.description,
    date: req.body.date
  };

  User.findById(res.locals.currentUserId, (err, user)=>{
    console.log("user", user);
    let event = new Event(eventInfo);
    console.log("event", event);
    user.userEvents.push(event);
    console.log("userEvents:", user.userEvents)
    user.save((err)=>{
      event.save((err, eventSaved)=>{
        console.log("eventSaved", eventSaved);
        if (err) { next(err) }
        res.redirect(`/${user.username}/events/${eventSaved._id}`);
      })
    });
  })
});

// ------------------------------------------------------------------------------
// RENDERING EVENT PAGE
// ------------------------------------------------------------------------------

router.get('/:username/events/:eventId', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  var eventId = req.params.eventId;
  var userParam = req.params.username;

  Event.findOne({_id: eventId })
    .populate('eventPhotos')

    .exec((err, eventObject)=>{
      if(err) { next(err)}
      console.log('eventObject', eventObject);
      res.render('event', { eventObject, userParam });
      // res.send('da')
    })
})

// ------------------------------------------------------------------------------
// RENDERING PUBLIC EVENT PAGE
// ------------------------------------------------------------------------------

router.get('/:username/events/:eventId/public', (req, res, next) => {
  var eventId = req.params.eventId;
  var userParam = req.params.username;

  Event.findOne({_id: eventId })
    .populate('eventPhotos')

    .exec((err, eventObject)=>{
      if(err) { next(err)}

            console.log('eventObject', eventObject);
            res.render('eventPublic', { eventObject, userParam });

    })


})

// ------------------------------------------------------------------------------
// UPLOADING PHOTOS
// ------------------------------------------------------------------------------

router.post('/:username/events/:eventId/upload', ensureLogin.ensureLoggedIn(), upload.single('file'), function(req, res, next){

  var eventIdParam = req.params.eventId;
  var userParam    = req.params.username;


  const pic = {
    eventId: eventIdParam,
    description: req.body.description,
    url_path: `/uploads/${req.file.filename}`,
  };

  Event.findById(eventIdParam, (err, event)=>{
    console.log("event", event)
    const newPic = new Photo(pic);
    console.log("newPic", newPic);
    event.eventPhotos.push(newPic);
    event.save((err)=>{
      if (err) { next(err) };
      newPic.save((err, picSaved)=>{
        console.log("picSaved", picSaved);
        if (err) { next(err) }
        res.redirect(`/${userParam}/events/${eventIdParam}`);
      })
    });
  })
});

// ------------------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------------------
//
router.post('/:username/events/:eventId/delete', (req, res, next) => {
  var eventId = req.params.eventId;
  var userId = res.locals.currentUserId;
  var userParam = req.params.username;
  // console.log("eventId: ", eventId);
  // console.log("userId: ", userId);

  Event.findByIdAndRemove(eventId, (err, removedEvent) => {
    console.log("err", err);
    if (err){ return next(err); }
    console.log("removedEvent: ", removedEvent);
    User.findByIdAndUpdate(
      { "_id": ObjectID(userId) },
      { $pull: { "userEvents": ObjectID(eventId) } },
      { safe: true },
      function(err, user) {
        if(err) {
          console.log(err);
        } else {
          // console.log("my user: ", user);
          res.redirect(`/${userParam}/`);
        }

      }
    );
  });
});

// ------------------------------------------------------------------------------
// EDIT EVENTS
// ------------------------------------------------------------------------------
router.get('/:username/events/:eventId/edit', (req, res, next) => {
  var eventIdParam = req.params.eventId;
  var userParam = req.params.username;

  Event.findById(eventIdParam, (err, eventObject2) => {
    console.log("here");
    if (err) { return next(err); }
    res.render('edit', {eventObject2, userParam});
  });

});

router.post('/:username/events/:eventId', (req, res, next) => {
      var eventIdParam = req.params.eventId;
      var userParam = req.params.username;

      let updates = {
          name: req.body.name,
          description: req.body.description,
          date: req.body.date
      };

      Event.findByIdAndUpdate(eventIdParam, updates, (err, eventObject2) => {
        console.log("found");
        if (err){ next(err); }
         return res.redirect(`/${userParam}/events/${eventIdParam}`);
      });
});






// ------------------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------------------
module.exports = router;
