const express = require('express');
const multer  = require('multer');
const passport       = require("passport");
const ensureLogin    = require("connect-ensure-login");
const User = require('../models/user');
const Event = require('../models/event');
const Photo = require('../models/photo');
const upload = multer({ dest: './public/uploads/' });

const router = express.Router();

const ObjectID = require('mongodb').ObjectID;


// ------------------------------------------------------------------------------
// EDIT PHOTOS
// ------------------------------------------------------------------------------

router.get('/:username/events/:eventId/:photoId/edit', (req, res, next) => {
  var userParam    = req.params.username;
  var photoIdParam = req.params.photoId;
  var eventIdParam = req.params.eventId;

  Photo.findById(photoIdParam, (err, photoObject) => {
    console.log("here");
    if (err) { return next(err); }
    res.render('editPhoto', {photoObject, eventIdParam, userParam});
  });

});



router.post('/:username/events/:eventId/:photoId/update', (req, res, next) => {
  var photoIdParam = req.params.photoId;
  var eventIdParam = req.params.eventId;
  var userParam    = req.params.username;


      let updates = {
          description: req.body.description
      };

      Photo.findByIdAndUpdate(photoIdParam, updates, (err, photoObject) => {
        console.log("found");
        if (err){ next(err); }
         return res.redirect(`/${userParam}/events/${eventIdParam}`);
      });
});

// ------------------------------------------------------------------------------
//  DELETE PHOTOS
// ------------------------------------------------------------------------------

router.post('/:username/events/:eventId/:photoId/delete', (req, res, next) => {
  var eventId   = req.params.eventId;
  var photoId   = req.params.photoId;
  var userParam = req.params.username;


  Photo.findByIdAndRemove(photoId, (err, removedPhoto) => {
    console.log("err", err);
    if (err){ return next(err); }
    console.log("removedPhoto: ", removedPhoto);
    Event.findByIdAndUpdate(
      { "_id": ObjectID(eventId) },
      { $pull: { "eventPhotos": ObjectID(photoId) } },
      { safe: true },
      function(err, user) {
        if(err) {
          console.log(err);
        } else {
          res.redirect(`/${userParam}/events/${eventId}`);
        }

      }
    );
  });

});

module.exports = router;
