import expressAsyncHandler from "express-async-handler";

const validationToken = expressAsyncHandler(async (req, res, next)  => {
  const token = req.headers.authorization || req.headers.Authorization;
  if (token && token.startsWith("Bearer")) { 
    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.ACCESS_TOKEN_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("not authorized");
  }
  next();
})