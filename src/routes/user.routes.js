import {Router} from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword } from "../controller/user.controller.js";
import{ upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


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

router.route("/login").post(loginUser)

//Secured routes 

/* now it will be a route that will execute two methods simultaneously 1. from auth.middlesre.js and other from user.controller.js 
that's why we used next() in auth.middleware.js. What next() does is it tell that my work is done move onto next*/
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(changeCurrentPassword)

export default router