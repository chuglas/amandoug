module.exports = {
  setCurrentUser: (req, res, next) => {
    if (req.session.passport) {
      res.locals.currentUserId = req.session.passport.user._id;
      res.locals.currentUser = req.session.passport.user;
      res.locals.isUserLoggedIn = true;
    } else {
      res.locals.isUserLoggedIn = false;
    }
    next();
  },

  protectProfile: (routeToGo) => {
    return (req, res, next) => {
      var userParam = req.params.username;
      var currentUserId = req.user.username;
      if (req.user.username === req.params.username) {
        next();
      } else {
        res.redirect(routeToGo);
      }
    };
  }
}
