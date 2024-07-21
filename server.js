const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB=require("./config/db");
var cors = require('cors')
// dotenv config
dotenv.config();
const path= require('path')


// mongoose connection

connectDB();

// create Express app
const app = express();
app.use(cors());

// middlewares
app.use(express.json());
app.use(morgan('dev'));

// Router
app.use("/api/v1/user" ,require("./routes/userRouters"));
app.use("/api/v1/admin" ,require("./routes/adminRoutes"));
app.use("/api/v1/doctor",require("./routes/doctorRoutes"));

// static files

app.use(express.static(path.join(__dirname,'./client/build')));

app.get("*",function(req,res){
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});





const port = process.env.PORT || 8080;


// listen to port
app.listen(port, () => {
    console.log(`Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
        .bgCyan.white
    );

});


