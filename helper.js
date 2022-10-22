const AdmZip = require("adm-zip");
const fs = require('fs');
const _ = require('lodash');
const isPDF = require("is-pdf-valid");
const pdfParse = require('pdf-parse');
const storagefolder = __dirname + '/uploads';
const regx = /ABKNG_\w+/;
const invoiceno = /ABKNG-\w+-\w+/;
const invoicedate = /Invoice Date: \n \w+\-\w+\-\w+/;
const netpaybleamoount = /NET PAYABLE: INR \w+/;
const path = require('path');
const moment = require('moment');
const monthMapper = {
  "jan":'01',
  "bef":'02',
  "mar":'03',
  "apr":'04',
  "may":'05',
  "jun":'06',
  "jul":'07',
  "aug":'08',
  "sep":'09',
  "oct":'10',
  "nov":'11',
  "dec":'12'
}


const fileupload = function (file) {
  //console.log("Uploading file");
  return new Promise(function (resolve, reject) {
    if(!file){
        reject('error in file upload');
    }else{
        resolve(file);
    }
  });
};

const fileextract = function(filename, path) {
    return new Promise(function (resolve, reject) {
        if(!fs.existsSync(path)){
            reject('zip not found in the folder');
        }else{
            try {
                const zip = new AdmZip(path);
                zip.extractAllTo(storagefolder, true);
                // Delete the zip file.
                //fs.remove(path);
                fs.unlink(path, function(err) {
                    if(err && err.code == 'ENOENT') {
                        // file doens't exist
                        reject("File doesn't exist, won't remove it.");
                    } else if (err) {
                        // other errors, e.g. maybe we don't have enough permission
                        reject("Error occurred while trying to remove file");
                    } else {
                        resolve(`removed`);
                    }
                });
              } catch (e) {
                reject('unable to extract the file');
              }
        }
      });
};

const readfiles = function () {
  return new Promise(function (resolve, reject) {
    fs.readdir(storagefolder, (err, files) => {
      if (err) {
        reject("unable to read the folder");
      }
      //resolve(files);
      //files object contains all files names
      //log them on console
      //console.log("type of variable===", _.isArray(files));
      if (!_.isUndefined(files) && !_.isEmpty(files) && _.isArray(files)) {
        files = _.filter(
          files,
          (file) => path.extname(file).toLowerCase() === ".pdf"
        );
        resolve(files || []);
        // files.forEach((file) => {
        //   console.log(file);
        // });
      } else {
        reject("Folder is empty");
      }
    });
  });
};

const cleanfolder = function () {
  return new Promise(function (resolve, reject) {
    // fs.readdir(storagefolder, (err, files) => {
    //   if (err) reject('Unable to read while cleaning the folder1');

      
    //   for (const file of files) {
    //     console.log("files===",file);
    //     fs.unlink(path.join(storagefolder, file), (err) => {
    //       if (err) resolve('Unable to read while cleaning the folder2');
    //     });
    //   }
    // });
    let res = deleteFolderRecursive(storagefolder);
    resolve(res);
  });
};

const deleteFolderRecursive = function (directoryPath) {
  if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file, index) => {
        const curPath = path.join(directoryPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
         // recurse
          deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      //fs.rmdirSync(directoryPath);
    }
  };

const getPDF = async (filename) => {
  //return new Promise(function (resolve, reject) {
    let file = storagefolder+'/'+filename;
    let readFileSync = fs.readFileSync(file);
    try {
        let pdfExtract = await pdfParse(readFileSync);
        let applicationId = pdfExtract.text.match(regx)[0].replace(/\r?\n|\r/, "").trim();
        let invoiceNo = pdfExtract.text.match(invoiceno)[0].replace(/\r?\n|\r/, "").trim();
        let invoiceDate = pdfExtract.text.match(invoicedate)[0].replace(/\r?\n\s|\r/, "").replace(/\s/g, '').split(":")[1];
        let netpayble = pdfExtract.text.match(netpaybleamoount)[0].replace(/\r?\n\s|\r/, "").trim().split(":")[1].replace(/\s/g, '').substring(3);
        
        // console.log("applicationId====",applicationId);
        // console.log("applicationId====",invoiceNo);
        // console.log("invoice date====",invoiceDate);
        // console.log("netpayble====",netpayble);
        //console.log("all text==",pdfExtract.text);
        //return pdfExtract.text.match(regx)[0];
        return{
          applicationId,
          invoiceNo,
          invoiceDate,
          netpayble
        };
      } catch (error) {
        return 'Unable to read the id from pdf';
      }
  //});
};
//monthMapper
const formatDate = async (dtstr) => {
  //console.log("new date format===",moment(dtstr).format('DD-MMM-YYYY'));
  const apltdate = dtstr.split("-");
  return `${apltdate[2]}-${monthMapper[apltdate[1].toLowerCase()]}-${
    apltdate[0]
  }`;
};
//formatDate('21-Mar-2022');
//getPDF('ABKNG-22-I085060.pdf');

module.exports = {
    fileupload,
    fileextract,
    readfiles,
    cleanfolder,
    getPDF,
    formatDate
};