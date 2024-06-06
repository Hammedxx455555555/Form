const express = require("express")
const mongoose = require("mongoose")
const path = require("node:path")
const bcrypt = require("bcrypt")
const util = require("node:util")
const cors = require("cors")
const http = require("http")
const bodyParser = require("body-parser")
const port = 5000
const app = express()

//MongoDB connection
mongoose.connect("mongodb://localhost:27017/server")
.then(()=>{
    console.log("Successfully Connected")
}).catch(()=>{
    console.log("Error 500")
})

//The schema which make up a user
const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

const User = mongoose.model('sse',userSchema)
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))
app.use(express.json())

//Rendering HTML files
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/signup.html')
})
app.get("/login",(req,res)=>{
    res.sendFile(__dirname + '/login.html')
})

//Signup route endpoint
app.post('/signup',async (req,res)=>{
const data =    {
                  username:req.body.username,
                  password: req.body.password

                  
                }
//Check for existing user
const existingUser = await User.findOne({username: data.username})
if(existingUser) {
    res.json({message:"Email address already in use "})


}else{
    //hashing the password with bcrypt
    const saltRounds = 10
    const hashed = await bcrypt.hash(data.password,saltRounds)
    data.password = hashed
    const user = new User(data);
        user.save().then(()=>{
        res.redirect("http://localhost:5000/login")    
        })
}
})

//Login route endpoint
app.post("/login",async(req,res)=>{
    //Check whether user has signup
    const check = await User.findOne({email:req.body.email})
    if(!check){
        res.json({message:"Invalid email address"})
    }
    //Check if the provided password match the hashed password
    const passwordmatch = bcrypt.compare(req.body.password, check.password)
    if(passwordmatch){
        res.redirect("")
    }
    if(!passwordmatch){
        res.json({message:"Incorrect Paasword"})
    }
})

// Localhost server for accessibility on local search
http.createServer(app).listen(5000,()=>{
console.log(`Server is running on port ${port}`)
})