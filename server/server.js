// server.js
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'https://facebook-graph-api-insights-frontend.onrender.com', // Or use '*' for all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

function connection() {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
}

connection();


const UserSchema = new mongoose.Schema({
    facebookId: String,
    name: String,
    email: String,
});
const User = mongoose.model('User', UserSchema);


// app.use(
//     cookieSession({
//         maxAge: 24 * 60 * 60 * 1000,
//         keys: [process.env.COOKIE_SECRET || 'your_cookie_secret'],
//     })
// );


app.post('/api/auth/facebook', async (req, res) => {
    const { accessToken } = req.body;

    try {
        const userResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture.width(180).height(180)&access_token=${accessToken}`);
        const { id, name, email, picture } = userResponse.data;

        let user = await User.findOne({ facebookId: id });
        if (!user) {
            user = await new User({ facebookId: id, name, email }).save();
        }

        // req.session.userId = user._id;
        console.log("user data requested")
        res.send({ id, name, email, picture: picture.data.url });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error logging in with Facebook');
    }
});


app.post('/api/auth/logout', (req, res) => {
    req.session = null; 
    res.send({ message: 'Logged out successfully' });
});

// app.get('/api/auth/status',(req,res)=>{
//     if(req.session.userId){
//         res.send({loggedIn:true,userId:req.session.userId})
//     }
//     else{
//         res.send({loggedIn:false})
//     }
// })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
