import {Router} from "express";
import { registerUser } from "../controller/user.controller.js";


const router = Router()
//creating segregated routes file helps to maintain clean code

//CREATING REGISTER ROUTER
//how to declate a route using router.route and post referenced in app.js
/*now the user when they will put url like this  http://localhost8000/api/v1/users/register  then in backend user.controller.js will run a function registerUser */ 
router.route("/register").post(registerUser) 
 

export default router