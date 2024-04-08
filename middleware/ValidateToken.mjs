import expressAsyncHandler from "express-async-handler";

const validationToken = expressAsyncHandler(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decodedToken.userId;
    next();
  });
});
export default validationToken;