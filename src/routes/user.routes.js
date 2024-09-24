import {Router} from "express";
import { registerUser } from "../controller/user.controller.js";
import{ upload } from "../middlewares/multer.middleware.js"


const router = Router()
//creating segregated routes file helps to maintain clean code

//CREATING REGISTER ROUTER
/*now the user when they will put url like this  http://localhost8000/api/v1/users/register  then in backend user.controller.js will run a function registerUser */ 

/*injecting middleware multer as upload*/
router.route("/register").post( //how to declate a route using router.route and post referenced in app.js
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverimage",
            maxCount:1
        }
        
    ]),
    registerUser
) 
 

export default router