
import expressAsyncHandler from 'express-async-handler'
import User from '../Models/UserModel.mjs'
import  Jwt  from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const registerUser = expressAsyncHandler(async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
      }
  
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        res.status(400);
        throw new Error("User already exists");
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
  
      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          // Exclude password for security reasons
          token: null, // Include a token if needed
        });
      } else {
        res.status(400);
        throw new Error("Invalid user data");
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
const loginUser=expressAsyncHandler( async (req,res) =>{
    const { email ,password}=req.body
    if (!email || !password ){
        res.status(400);
        throw new Error("all fields required")
    
    }
    const usertarget= await User.findOne({email}) 
    if (usertarget && (await bcrypt.compare(password,usertarget.password)  )){
        const accessToken=Jwt.sign({email:usertarget.email,id:usertarget._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1m"})
        res.status(200).json({accessToken});
       
    } else {
        res.status(401);
        throw new Error("invalid email or password")
    }})
const currentUser=expressAsyncHandler( async (req,res) =>{
    const user=await User.findById(req.user._id).select("-password")
    if (user){
        res.status(200).json(user)
    } else {
        res.status(404);
        throw new Error("user not found")
    }
 
})
export {registerUser,loginUser,currentUser}