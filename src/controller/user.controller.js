import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

/* In lecture 14 we got to know that we would use refresh token so many times so everytime writing code for it
doesn't make any sense so we must write a function tu reuse it multiple times*/

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId) //as given above by the user
        //generate access and refresh token using methods from "user.models.js" and store it in a variable 
        const accessToken = user.generateAccessToken() 
        const refreshToken= user.generateRefreshToken()

        /*as we know refresh token must be also stored in database so we will write code to store refresh token in the database
        also see that user is like an object so we will save the refresh token as we do it in objects*/

        user.refreshToken = refreshToken

/*Remember when you will save mongoose models will kick in and it is written there that password must be there {password: "true"} 
/so use "{validateBeforeSave : false}" what it will do is it will not validate and just save the parameter */

        user.save({validateBeforeSave : false})
        //then return access and refresh token
        return{accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500,'Something went wrong while generating refresh and access token')
    }

}

//----------------------------------REGISTER-------------------------------------
const registerUser = asyncHandler( async (req, res) => {
//Algotithm desing of registerUser:-

    //STEP:1 get user details from frontend
    //STEP:2 validation -- not empty
    //STEP:3 check if the user already exists: username, email
    //STEP:4 check for images, avatar
    //STEP:5 if avialable upload it to cloudinary, avatar
    //STEP:6 create user object - cretae entry in db
    //STEP:7 remove password and refresh token field in response so that password doen not go to the user
    //STEP:8 return res
    
    /*STEP - 1: user details will be taken as per the "user.model.js" */
    //We don't have a frontend to we will use "POSTMAN API" to send response to the backend
    //data from "form" or "json" can be recieved by req.body
    const {fullname,email,username,password} = req.body
    console.log("email:", email)
    //goto user.routes.js to see how the coverimage and avatar is uploaded using multer
   



 /* STEP - 2: validation */
    //METHOD 1 USING IF ELSE where you have to validate each field if it is empty using if else which is redundant and also lengthy
    // if(fullName == ""){
    //     throw new apiError(400, "fullname is required")
    // }

    //METHOD 2 USING ".some()" method on array "The .some() method in JavaScript is used to test whether at least one element in an array passes a given test (provided by a function). It returns true if at least one element satisfies the condition, otherwise false."

    if([fullname,email,username,password].some((field) => field?.trim() === "")) //"field?.trim() if field exist trim it and see if it is empty or not if it is empty thrwo api error"
        {
            throw new apiError(400, "All fields are required")
        }


/* STEP - 3: to check of the user already exist */
    //We will check if the email or username entered by the user already exists in the database or not

    const existedUser = await User.findOne({ //.findOne() is a database call which used to query the database for a single document that matches the provided criteria. It returns the first document that matches the query.
        $or: [{username},{email}] //$or is mongoDb operator to perform logical OR operation here it is used to check matching parameteres
    })

    if(existedUser){
        throw new apiError(409, "User with email or username already exists")
    }

//console.log(req.files) //it will print the files taken from the user as object in the terminal

 /* STEP - 4: check for images, avatar */
    /*as we know "req.body" is a method given by express that recieves all the response data from the user same as that we have 
    "req.files" is given by multer to gives access to files uploaded but we have to chain it optionally using "?" to check file if it exists or not*/

    const avatarLocalPath = req.files?.avatar[0]?.path //here we take 1st property of the file "avatar" optionally using "?" operator if it exist then 1st property often returns an object ".path" in most cases. ".path" returns the local file path that is uploaded on cloudinary by multer. Multer takes the image and store it in the public folder with it's reference
    // 1.>  const coverimageLocalPath = req.files?.coverimage[0]?.path

    /* 2.>  In above code where we request for coverimage we don't check if the cover image is avialable or not
    or is there an array avialable to extract the path so what we do is we  check if the files are avialable
    and also it contains an array in it then we also check if it has more than 1 element and if it is there then we take path
    
    So now if you even leave the coverimage blank it won't show any error it will just show ' coverimage: "",  '*/
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalPath = req.files.coverimage[0].path
    }

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }
   



 /* STEP - 5: if avialable upload it to cloudinary, avatar */

    /* We used "async" above because many functions will take time so we use "await" here as it can take time to upload */
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverimage = await uploadOnCloudinary(coverimageLocalPath)

   if(!avatar){
        throw new apiError(400, "Avatar file is required")
   }
   

/* STEP - 6: create user object - cretae entry in db*/
    const user = await User.create({ //".create" is a database call to create an entry in database
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "", //check if any cover image exist if it exist sent it's url or if it's empty then return empty
    email: email,
    password: password,
    username: username.toLowerCase()
})


/* STEP - 7: remove password and refresh token field in response so that password does not get displayed*/
    const createdUser = await User.findById(user._id).select("-password -refreshToken") //".findById()" is a database call which  will find the user "._id" in mongodb and ".select" will select required fireld where password and refresh token will not be displayed
    
    if(!createdUser){
        throw new apiError(500, "Something went wrong by registering a user")
    }


/* STEP - 8:return response */

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
     ) 
})



//---------------------------LOGIN------------------------------------------------

const loginUser = asyncHandler(async(req, res) => {
    //Step 1. req body -> data "body se data rquest"
    //Step 2. username or email avialable
    //Step 3. find the user
    //Step 4. password check
    //Step 5. access and refresh token 
    //Step 6. send access and refresh token in cookie
    //Step 7. send response as cookie


//Step 1. req body -> data "body se data rquest"
const {email, username, password} = req.body

if(!(username || email)) {
    throw new apiError(400, "username or email is required")
}


//Step 2. Check if the username or email avialable in the database or not
const user = await User.findOne({
    $or: [{username},{email}]
})



//Step 3: if the entered username or email is not found in the database
if(!user){
    throw new apiError(400, "User does nott exist")
}


//Step 4. password check
const isPasswordValid = await user.isPasswordCorrect(password) //taken from user.model.js bcrypt

if(!isPasswordValid){
    throw new apiError(400, "Invailid user credentials")
}



//Step 5. access and refresh token 
 //function is already created above and also returned so just call the function with parameter and give your credentials to it
 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id) //remember "._id" is the mongodb database id

 //also you must not send the logged in user 'refreshToken' and 'password' so you can write code for it
 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



 //Step 6. send access and refresh token in cookie

 const options = {
    httpOnly: true, // "httpOnly: true"  ---> This ensures that the cookie is HTTP-only, which means it cannot be accessed through JavaScript (i.e., document.cookie). This enhances security by preventing client-side scripts from reading the cookie, reducing the risk of cross-site scripting (XSS) attacks.
    secure: true  //"secure: true" ----> This setting ensures that the cookie is only sent over secure HTTPS connections. It prevents the cookie from being transmitted over unencrypted HTTP, reducing the risk of eavesdropping or man-in-the-middle attacks.
 }


 //Step 7. send response as cookie

 //you can send multiple cookies by chaining ".cookie()"
 return res.status(200)
 .cookie("accessToken",accessToken, options)
 .cookie("refreshToken",refreshToken, options)
 .json(   //now it's good practice to send an external .json response so if user wants to save it externally it he can do it
    new apiResponse( //go to api response to check what you have can send 1.statuscode 2.data 3.message
        200, //statuscode
        {
            user: loggedInUser, accessToken, refreshToken //data
        },
        "User is logged in" //message
    )
 )

})


//---------------------------LOGOUT------------------------------------------------

//Steps to logout
//STEP 1:- clear cookies
//STEP 2:- reset refresh token

/* Now there is a problem that during logout how we will find the user? We can use "User.findbyid" as for logout there is no method that gives id
To solve this problem we will use an aurthentication middleware, but here we will design this middleware on our own  */
const logoutUser = asyncHandler(async(req, res) => {
    //after creating a middleware called auth.middleware.js we can access "req.user" now
 await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {  //mongodb operator to set a value
            refreshToken: undefined  //refresh token will be undefined after verifyJWT method will execute
        }
    },
    {
        new: true //new token will be assigned
    }
 )

 //cookie management 
 const options = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production' ,
    sameSite: 'strict'
 }
//clear cookies
 return res.status(200)
 .clearCookie("accessToken", options)
 .clearCookie("refreshToken", options)
 .json(new apiResponse(200, {}, "User Logged Out"))
})


//---------------------------------refreshToken--------------------

//after the accessToken is invailid we need new access token so read notes

//1. Taking token from the user
const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
//2. If did not recieve any token from the user
    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized Request")
    }

try {

    //3. decode token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    //4. find the id of the user in the database using decoded token
        const user = await User.findById(decodedToken?._id)
    
    //5. if did not find the id in the database
        if(!user){
            throw new apiError(401,"invailid refresh token")
        }
    //4. Check if the recieved token matches the refresh token in the database
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401, "refresh token is expired or used")
        }
    
    //cookie management
    const options = {
        httpOnly: true,
        secure: true
    
    }
    
    //5. generate new access token
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    return res.status(200)
    .cookie("accessToken", accessToken,options )
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new apiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token Refreshed"
        )
    )
    
}catch(error) {
    throw new apiError(401, "Invailid refresh token")
}

})

//---------------------------change password-----------------------

  
//Function for changing password of the user and it depends upon you how many fields you want to take
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    //field taken from req.body
   const {oldPassword,newPassword} = req.body

/* Now in the "auth" middleware we did "req.user = user" that means there is a user logged in so here 
we will check if there is a user conditionally then give it's id like this "req.user?._id"" */

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) //isPasswordCorrect is a function in "user.model.js" and it return true or false

    //if password enetred is not correct
    if(!isPasswordCorrect){
       throw new apiError(400, "Invailid old password")
    }
   //set new password
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    
   //response

   return res
   .status(200)
   .json(new apiResponse(200, {}, "Password changed successfully"))
})

//----------------------------- fetching current user ----------------------

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully")
})

//-------------------------------update account details ---------------------

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname,email} = req.body

    //if fullname or email is not given by the user

    if(!fullname || !email){
        throw new apiError(400,"All fields are required")
    }
    
    //if email and fullname is given
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set:{  //setting up all the values
            fullname: fullname,
            email: email 
           }
        },{new:true}).select("-password") //don't give the password field

        //response
        return res
        .status(200)
        .json(new apiResponse(200, user, "Account details successfully updated"))

})
//--------------------------update user avatar--------------------------------

const updateUserAvatar = asyncHandler(async(req, res)=> {
    const avatarLocalPath = req.file?.path //through multer middleware

    //if no file is uploaded then
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
    }

    //upload file on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    //if not uploaded
    if(!avatar.url){
        throw new apiError(400, "Error while uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },{new: true}
    ).select("-password")

    //response

    return res
    .status(200)
    .json(
        new apiResponse(200,user,"avatar uploaded succesfully")
    )
})

//--------------------------update user coverimage--------------------------------

const updateUserCoverImage = asyncHandler(async(req, res)=> {
    const coverImageLocalPath = req.file?.path //through multer middleware

    //if no file is uploaded then
    if(!coverImageLocalPath){
        throw new apiError(400,"Cover Image file is required")
    }

    //upload file on cloudinary
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)

    //if not uploaded
    if(!coverimage.url){
        throw new apiError(400, "Error while uploading coverimage on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverimage: coverimage.url
            }
        },{new: true}
    ).select("-password")


    //response

    return res
    .status(200)
    .json(
        new apiResponse(200,user,"cover image uploaded succesfully")
    )
})


export { registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage
 };
