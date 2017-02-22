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

router.get('/new-event', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render('new-event');
})

router.post('/new-event', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const eventInfo = {
    name: req.body.name,
    _user: res.locals.currentUserId,
    description: req.body.description,
    date: req.body.date
  };

  User.findById(res.locals.currentUserId, (err, user)=>{
    console.log("user", user)
    let event = new Event(eventInfo);
    console.log("event", event);
    user.userEvents.push(event);
    console.log("userEvents:", user.userEvents)
    user.save((err)=>{
      event.save((err, eventSaved)=>{
        console.log("eventSaved", eventSaved);
        if (err) { next(err) }
        res.redirect(`/events/${eventSaved._id}`);
      })
    });
  })
  // newEvent.save((err, event) => {
  //   if (err) { next(err) }
  //   User.findByIdAndUpdate(
  //     res.locals.currentUserId,
  //     {$push: {userEvents: ObjectID(event._id)}},
  //     {safe: true, upsert: true},
  //     function(err, model) {
  //       if (err) {
  //         next(err)
  //       } else {
  //         res.redirect(`/events/${event._id}`);
  //       }
  //     }
  //   );
  // })
});

// ------------------------------------------------------------------------------
// RENDERING EVENT PAGE
// ------------------------------------------------------------------------------

router.get('/:eventId', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  var eventId = req.params.eventId;
  Event.findOne({_id: eventId })
    .populate('eventPhotos')

    .exec((err, eventObject)=>{
      if(err) { next(err)}
      console.log('eventObject', eventObject);
      res.render('event', { eventObject });
      // res.send('da')
    })
  // Event.findById(eventId, (err, eventObject) => {
  //   if (err) { return next(err); }
  //   console.log("event object: " + eventObject)
  //   res.render('event', { eventObject });
  // });


})

// ------------------------------------------------------------------------------
// UPLOADING PHOTOS
// ------------------------------------------------------------------------------



router.post('/:eventId/upload', ensureLogin.ensureLoggedIn(), upload.single('file'), function(req, res, next){

  var eventIdParam = req.params.eventId;

  const pic = {
    eventId: eventIdParam,
    description: req.body.description,
    url_path: `/uploads/${req.file.filename}`,
  };

  // Event.findById(eventIdParam, (err, event)=>{
  //   if (err) { next(err)}
  //
  //   event.eventPhotos.push()
  // })
  // const newPic = new Photo(pic);
  //
  // newPic.save((err) => {
  //     res.redirect(`/events/${eventIdParam}`);
  // });

  Event.findById(eventIdParam, (err, event)=>{
    console.log("event", event)
    const newPic = new Photo(pic);
    console.log("newPic", newPic);
    event.eventPhotos.push(newPic);
    event.save((err)=>{
      newPic.save((err, picSaved)=>{
        console.log("picSaved", picSaved);
        if (err) { next(err) }
        res.redirect(`/events/${eventIdParam}`);
      })
    });
  })

  // Event.findByIdAndUpdate(
  //   eventIdParam,
  //   {$push: {eventPhotos: newPic}},
  //   {safe: true, upsert: true},
  //   function(err, model) {
  //       console.log(err);
  //   }
  // );

});

// ------------------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------------------
//
router.post('/:eventId/delete', (req, res, next) => {
  var eventId = req.params.eventId;
  var userId = res.locals.currentUserId;
  console.log("eventId: ", eventId);
  console.log("userId: ", userId);
  // console.log(user);

  // User.findByIdAndUpdate(
  //   res.locals.currentUserId,
  //   {$pull: userEvents},
  //   {safe: true, upsert: true},
  //   function(err, model) {
  //       console.log(err);
  //   }
  // );
  // console.log("user", user);
  // console.log("id", id);


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
          console.log("my user: ", user);
          res.redirect('/events/');
        }

      }
    );
  });



  // User.findByIdAndUpdate(
  //   res.locals.currentUserId,
  //   {$pull: {'userEvents': {_id: req.params.eventId}}},
  //   function(err, model) {
  //     if(err){
  //          console.log(err);
  //          return res.send(err);
  //       }
  //       return res.redirect('/events/');
  //   }
  // );


  //
  // User.findByIdAndUpdate(user, (err, userObject) => {
  //   if (err){ return next(err); }
  //   userObject.userEvents.pull({ _id: id});
  //   console.log("what is this: " + userObject);
  // });

});

// ------------------------------------------------------------------------------
// EDIT EVENTS
// ------------------------------------------------------------------------------
router.get('/:eventId/edit', (req, res, next) => {
  var eventIdParam = req.params.eventId;

  Event.findById(eventIdParam, (err, eventObject2) => {
    console.log("here");
    if (err) { return next(err); }
    res.render('edit', {eventObject2});
  });

});

router.post('/:eventId', (req, res, next) => {
  var eventIdParam = req.params.eventId;

      let updates = {
          name: req.body.name,
          description: req.body.description,
          date: req.body.date
      };

      Event.findByIdAndUpdate(eventIdParam, updates, (err, eventObject2) => {
        console.log("found");
        if (err){ next(err); }
         return res.redirect(`/events/${eventIdParam}`);
      });
});






// ------------------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------------------
module.exports = router;
