import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
const validationToken = expressAsyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  const token = authorizationHeader.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.redirect(307, '/unauthorized');  }
});

export default validationToken;