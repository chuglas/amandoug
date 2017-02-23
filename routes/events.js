const express = require('express');
const multer  = require('multer');
const passport       = require("passport");
const ensureLogin    = require("connect-ensure-login");
const User = require('../models/user');
const Event = require('../models/event');
const Photo = require('../models/photo');
const upload = multer({ dest: './public/uploads/' });
const auth = require('../helpers/auth');

const router = express.Router();

const ObjectID = require('mongodb').ObjectID;

router.get('/:username/events/new-event', (req, res, next) => {
  var userParam = req.params.username;
  res.render('new-event', {userParam});
});

router.post('/:username/events/new-event', (req, res, next) => {
  const eventInfo = {
    name: req.body.name,
    _user: res.locals.currentUserId,
    description: req.body.description,
    date: req.body.date
  };

  User.findById(res.locals.currentUserId, (err, user)=>{
    let event = new Event(eventInfo);
    user.userEvents.push(event);
    user.save((err)=>{
      event.save((err, eventSaved)=>{
        if (err) { next(err); }
        res.redirect(`/${user.username}/events/${eventSaved._id}`);
      });
    });
  });
});

// ------------------------------------------------------------------------------
// RENDERING EVENT PAGE
// ------------------------------------------------------------------------------

router.get('/:username/events/:eventId', (req, res, next) => {
  var eventId = req.params.eventId;
  var userParam = req.params.username;

  Event.findOne({_id: eventId })
    .populate('eventPhotos')
    .exec((err, eventObject)=>{
      if(err) { next(err);}
      let sameUser = (res.locals.isUserLoggedIn && res.locals.currentUser.username === userParam ) ? true : false;
      console.log(sameUser);
      res.render('event', { eventObject, userParam, sameUser });
    });
});

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
    const newPic = new Photo(pic);
    event.eventPhotos.push(newPic);
    event.save((err)=>{
      if (err) { next(err); }
      newPic.save((err, picSaved)=>{
        if (err) { next(err); }
        res.redirect(`/${userParam}/events/${eventIdParam}`);
      });
    });
  });
});

// ------------------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------------------
//
router.post('/:username/events/:eventId/delete', (req, res, next) => {
  var eventId = req.params.eventId;
  var userId = res.locals.currentUserId;
  var userParam = req.params.username;

  Event.findByIdAndRemove(eventId, (err, removedEvent) => {
    console.log("err", err);
    if (err){ return next(err); }
    User.findByIdAndUpdate(
      { "_id": ObjectID(userId) },
      { $pull: { "userEvents": ObjectID(eventId) } },
      { safe: true },
      function(err, user) {
        if(err) {
          console.log(err);
        } else {
          res.redirect(`/${userParam}/`);
        }

      }
    );
  });
});

// ------------------------------------------------------------------------------
// EDIT EVENTS
// ------------------------------------------------------------------------------
router.get('/:username/events/:eventId/edit', auth.protectProfile('/login'), (req, res, next) => {
  var eventIdParam = req.params.eventId;
  var userParam = req.params.username;

  Event.findById(eventIdParam, (err, eventObject2) => {
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
        if (err){ next(err); }
         return res.redirect(`/${userParam}/events/${eventIdParam}`);
      });
});

// ------------------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------------------
module.exports = router;
