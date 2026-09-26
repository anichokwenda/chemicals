const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "You do not have access, please login via /login" });
  }
  next();
};
module.exports = { isAuthenticated };