const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ 
                message: "Please provide a name, username, and password." 
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ 
                message: "username is already taken." 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username },
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );


        res.status(201).json({
            message: "Registration successful",
            token
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            message: "Internal Server Error. Could not create pilot license." 
        });
    }
}

const loginUser = async(req, res)=>{
    try{
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({message : "Username and passwords are required"});
        }
        
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "credentials don't match."});
        }

        const token  = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'super_secret_fallback_key', 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Logged in successfully!",
            token: token,
            user: {
                _id: user._id,
                username: user.username,
                avgWPM: user.avgWPM,
                wins: user.wins
            }
        });

    } catch(err){
        console.error("Login error : ",err);
        res.status(500).json({message: 'Server error'});
    }
}


module.exports = {
    registerUser,
    loginUser
};
