import express  from "express";
import  {registerUser,loginUser,currentUser} from "../controllers/UserController.mjs";
const routerUser =express.Router();
routerUser.route('/signup').post(registerUser)
routerUser.post('/login',loginUser)
routerUser.get('/current',currentUser)
export default routerUser;