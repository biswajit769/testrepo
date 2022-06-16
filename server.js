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
    req.body['user'] = parseInt(user);
    req.body['quantity'] = parseInt(quantity);
    console.log("request landed on API"," and user is===",user," and quantity==",quantity," and company=",company," and GTTPrice==",GTTPrice);
    console.log("request body===",JSON.stringify(req.body));
    //console.log(user, quantity, company, GTTPrice);
    //let { userid, pass, pin } = JSON.parse(process.env.USER_LIST)[user];
    //console.log(JSON.parse(process.env.USER_LIST)[user]);
    console.log("check condition1===",!_.isEmpty(req.body));
    console.log("check condition2===",!_.isEmpty(JSON.parse(process.env.USER_LIST)[user]));
    console.log("user list===",JSON.parse(process.env.USER_LIST)[user]);
    if(!_.isEmpty(req.body) && !_.isEmpty(JSON.parse(process.env.USER_LIST)[user])){
        console.log("GTT execution will be triggered");
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