import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"


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

export { registerUser };
