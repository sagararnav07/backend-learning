import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express() //configure app with express

//In Express.js, app.use() is a method used to add middleware functions to your Express application. Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle. Middleware functions can perform tasks such as modifying the request, sending a response, or passing control to the next middleware.

//app.use() in express

//LIST OF MAJOR EXPRESS CONFIGURATIONS 

app.use(cors({ //.use is used to set middlewares and configure packages after import
    origin: process.env.CORS_ORIGIN,//origin is one of the settings among many in cors that gives you to decide wich frontend is allowed to talk to this backend
    credentials: true
})) 

app.use(express.json({ //app.use(express.json()) is middleware in Express.js that parses incoming requests with JSON payloads. It is especially useful when dealing with APIs where the client sends data in the request body in JSON format. This middleware makes the JSON data available in req.body.
        limit: "20kb"
    })) 

app.use(express.urlencoded({extended: true, limit: '16kb'})) //app.use(express.urlencoded()) is middleware in Express.js used to parse incoming requests with URL-encoded payloads, such as form data

app.use(express.static('public')) //public assets for recieved images files etc

app.use(cookieParser()) //server to perform CRUD operation on user's browser and save and read secured cookies in user's browser


//routes import 

import userRoutes from './routes/user.routes.js'

//routes declaration

//.use is a middleware and if we use it instead of .get wjen we configure a route. It will take the user to user.routes.js
app.use('api/v1/users', userRoutes) //'api/v1/users' is industrial practice 

//url declaration will be like this
//  http://localhost:8000/api/v1/users/register


export {app} //app is exported