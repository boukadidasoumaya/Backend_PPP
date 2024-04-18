import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
const validationToken = expressAsyncHandler(async (req, res, next) => {
  console.log('req.headers:', req.headers.authorization);
  //const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  const token = req.headers.authorization ;
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