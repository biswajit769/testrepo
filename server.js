// Require all packages installed
const express = require('express')
const multer = require('multer');
const fs = require('fs');
const dotenv = require("dotenv");
const cors = require("cors");
const uploadinvoice = require('./uploadinvoice');
//const createInvoice = require('./createInvoice');
const cluster = require("cluster");
const bodyParser = require('body-parser');
//const cors = require('cors');
const totalCPUs = require("os").cpus().length;
const _ = require("underscore");
const {fileupload, fileextract, readfiles, cleanfolder, getPDF} = require('./helper');
dotenv.config();
//app.use(cors());

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
      //console.log("file details===",file);
      cb(null, file.fieldname + '-' + Date.now()+'.zip')
  }
})

var upload = multer({ storage: storage });

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);
 
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
 
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(bodyParser.json({limit: "50mb"}));
  app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  app.post('/uploadfile', upload.single('myFile'), async(req, res, next) => {
    //const cleanfolderres = await cleanfolder();
    let consolidateResp = [];
    var filetouploadList = [];
    try {
      
      const fileuploadres = await fileupload(req.file);
      const fileextractres = await fileextract(
        fileuploadres.filename,
        fileuploadres.path
      );
      const filelist = await readfiles();
      console.log("all files====",filelist);
      for (const file of filelist) {
        const contents = await getPDF(file);
        filetouploadList.push({
          "contents":contents,
          "file":file,
        })
        //const uploadinv = await uploadinvoice(contents, JSON.parse(process.env.USER_DETAIL), file);
        //console.log("file==",file,"upload details====",uploadinv);
        //consolidateResp.push({'status':uploadinv,'file':file});
      }
      //const uploadinv = await uploadinvoice(filetouploadList, JSON.parse(process.env.USER_DETAIL));
      //console.log("file content list===",uploadinv);
      //const cleanfolderres = await cleanfolder();
      //console.log("clean result====",cleanfolderres);
      let jsonData = JSON.stringify(filetouploadList);
      fs.writeFile("uploadfilelist.json", jsonData, (err) => {
        if (err)
        res.status(200).json({"listofupload":null});
        else {
          res.status(200).json({"listofupload":Object.keys(filetouploadList).length});
        }
      });
    } catch (error) {
      console.log(error);
    }
    // const file = req.file
    // if (!file) {
    //     const error = new Error('Please upload a file')
    //     error.httpStatusCode = 400
    //     return next(error)
    // }
    // res.send(file)
})

app.get('/process', async (req, res) => {
  let rawdata = fs.readFileSync('uploadfilelist.json');
  let filetouploadList = JSON.parse(rawdata);
  console.log("processing file=",filetouploadList);
  //const uploadinv = await uploadinvoice(filetouploadList, JSON.parse(process.env.USER_DETAIL));
  //console.log("file content list===",uploadinv);
  return res.send('Received a POST HTTP method');
});

app.post("/processinvoice", (req, res) => {
  let { contents, file } = req.body;
  console.log("contents==",contents);
  console.log("file==",file);
  if(!_.isEmpty(req.body) && !_.isEmpty(JSON.parse(process.env.USER_DETAIL))){
    console.log("GTT execution will be triggered");
    uploadinvoice(req.body, JSON.parse(process.env.USER_DETAIL), res);
  }else{
    //res.send("fail"); 
  }
});


  app.listen(process.env.PORT, () => {
    console.log('Server started on port',process.env.PORT);
  });
}