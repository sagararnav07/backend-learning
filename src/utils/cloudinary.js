//file handling

import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; // importing file system; it is by default available in Node.js

/* We should not upload a file directly to Cloudinary. First, we should upload it on our local server,
   then it should be uploaded on Cloudinary as it reduces the risk of errors, and we can reuse the function. 
   
   1. Copy the following configuration in your .env file 
   2. Assign the variables in the .env file 
   3. Give the address to config in this file
*/

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Creating a separate general reusable function to upload a file to Cloudinary

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Check if the file path is provided

        // To upload the file to Cloudinary, we will use async/await as it is a tedious, long process
        // cloudinary.uploader.upload has many more features, check the documentation for more options
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detect file type
        });
        
        // If the file has been uploaded successfully
        console.log("File has been uploaded on Cloudinary:", response.url); // response.url gives the uploaded file URL
        return response; // Return all response to the user

    } catch (error) {
        // If an error occurs, remove the locally saved temporary file as the upload operation failed
        //You need to provide a callback function to handle the result of the file deletion operation:
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            }
        });
        console.error("Error uploading file:", error);
        return null;  // Return null to indicate failure
    }
};

export { uploadOnCloudinary };
