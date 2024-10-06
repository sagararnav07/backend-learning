import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"

//Designing a middleare auth.js to logout the user. Miidleware are mostly used in routes so it will also be used in user.routes.js
export const verifyJWT = asyncHandler(async(req, _, next) => {

try {
    //console.log("Cookies:", req.cookies);
//console.log("Authorization Header:", req.header("Authorization"));


    //1. Retrieve a token 
        /*Whenever the user wants to access a protected route or resource, the user agent should send the JWT, typically in the Authorization header using the Bearer schema. The content of the header should look like the following:
          "Authorization: Bearer <token>""
         This can be, in certain cases, a stateless authorization mechanism. The server's protected routes will check for a valid JWT in the Authorization header, and if it's present, the user will be allowed to access protected resources. If the JWT contains the necessary data, the need to query the database for certain operations may be reduced, though this may not always be the case.
         Note that if you send JWT tokens through HTTP headers, you should try to prevent them from getting too big. Some servers don't accept more than 8 KB in headers. If you are trying to embed too much information in a JWT token, like by including all the user's permissions, you may need an alternative solution, like Auth0 Fine-Grained Authorization. */
   
   
// const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 const token = req.cookies['accessToken'] || req.cookies['accessToken:'] || req.header("Authorization")?.replace("Bearer ", "");//facing problem due to cookies so added this line instead of the upper one as there are multiple typres of access and refresh tokens printed

   // console.log("Token:", token);
         
    //2. to check if token is not avialable
        if(!token){
            throw new apiError(401, "Unauthorized Access")
        }
    
    //3. Decode token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //getting user id from database using decoded token
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    //4. If user id does not exist
        if(!user){
            //TODO: discuss about frontend
            throw new apiError(401, "Invailid Access Token")
        }
    
    //5. Add object to request
    
       req.user = user
       next()

} catch (error) {
    
    throw new apiError(401, error?.message || "Invaild Access token") 

}

})