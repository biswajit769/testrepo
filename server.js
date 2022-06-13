const express = require("express");
const bodyParser = require("body-parser");
const createGTT = require('./createGTT');
const cors = require("cors");
const dotenv = require("dotenv");
const _ = require("underscore");
dotenv.config();
const app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/",(req, res) => {
    res.send("success");
});

app.post("/setgtt", (req, res) => {
    let { user, quantity, company, GTTPrice } = req.body;
    //console.log(user, quantity, company, GTTPrice);
    //let { userid, pass, pin } = JSON.parse(process.env.USER_LIST)[user];
    //console.log(JSON.parse(process.env.USER_LIST)[user]);
    if(!_.isEmpty(req.body) && !_.isEmpty(JSON.parse(process.env.USER_LIST)[user])){
        createGTT(req.body, JSON.parse(process.env.USER_LIST)[user]).then(response => {
            res.send(response); 
        })
    }else{
        res.send("fail"); 
    }
});
app.listen(process.env.PORT, () =>
  console.log(`GTT app listening on port ${process.env.PORT}!`)
);