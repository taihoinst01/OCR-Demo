var express = require('express');
var router = express.Router();
var multer = require("multer");
var jimp = require('jimp');

//upload file setting
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        //callback(null, "../uploads"); //Azure
        callback(null, "./uploads"); //Local
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({ storage: storage }).single("uploadFile");

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.post('/upload', function (req, res) {
    upload(req, res, function (err) { 
        if (err) {
            console.log('upload error :' + err);
            return res.send("error uploading file.");
        }
        var filePath = req.headers.origin + "/uploads/" + req.file.filename;

        if (req.body.rotation != '') {
            jimp.read("./uploads/" + req.file.filename).then(function (image) {
                image.rotate(Number(req.body.rotation));
                image.write('./uploads/' + req.file.filename);
                res.send(filePath);
            }).catch(function (error) {
                console.log("jimp error : " + error);
            });
        } else {
            res.send(filePath);
        }      
        //var filePath = req.headers.origin + "/uploads/" + req.file.filename;
        //res.send(filePath);
    });
});

module.exports = router;