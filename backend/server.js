const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const multer = require("multer");
const fs = require("fs");
const sub = require("subsrt");
const subParser = require("subtitles-parser-vtt");
const { stringify } = require("querystring");
const func = require("./functions");
const chalk = require("chalk");
const { concat, scatter_util } = require("@tensorflow/tfjs-core");
const { resolve } = require("path");
const cloudinary = require("cloudinary").v2;
const hbs = require("hbs");
// const nx = require("@jswork/next-clock2time");

const app = express();

//Config Cloudinary
cloudinary.config({
  cloud_name: "improvedlearning",
  api_key: "299317385827573",
  api_secret: "r1o94kqE9mUyYxBWBYP5LIxr19U",
});

var srtCaptions = [];
var videoFile;

//Multer Setup
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

var upload = multer({ storage: storage });
var fUpload = upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "subFile", maxCount: 1 },
]);

//Path Variables
const viewsPath = path.join(__dirname, "/templates/views");
const partialsPath = path.join(__dirname, "/templates/partials");
const publicPath = path.join(__dirname, "/public");

//Set up Handlebars as View Engine
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicPath));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Local Functions
function generateVideo(textArray, id) {
  return new Promise(async (resolve, reject) => {
    func.createVideoFile(textArray);
    await func.generateConcatVideo(id);
    resolve();
  });
}

function generateVideoTwo(textArray, id) {
  return new Promise(async (resolve, reject) => {
    func.createVideoFileTwo(textArray);
    await func.generateConcatVideo(id);
    resolve();
  });
}

const seqGeneration = async (captions) => {
  var flag = 0;
  for (const caption of captions) {
    if (flag < 11) {
      var textArray = func.predictText(caption.text);
      console.log(chalk.bgGrey(textArray));
      await generateVideo(textArray, caption.id);
      await func.concatFileUploadTwo(caption.id);
    } else {
      console.log(chalk.red("Exceeded for now"));
    }
    flag++;
  }
};

function timeConverter(srtTime) {
  var SPLIT_RE = /[.:,]/;
  var res = srtTime.split(SPLIT_RE);
  var hour, minute, second, micro;
  var length = res.length;

  if (length === 3) {
    hour = 0;
    minute = parseInt(res[0]);
    second = parseInt(res[1]);
    micro = parseInt(res[2]);
  }

  if (length === 4) {
    hour = parseInt(res[0]);
    minute = parseInt(res[1]);
    second = parseInt(res[2]);
    micro = parseInt(res[3]);
  }

  return length > 2
    ? 36 * 1e5 * minute + 6 * 1e4 * minute + 1e3 * second + micro
    : null;
}

//Home Page Route
app.get("", (req, res) => {
  res.render("index");
});

function Overlay(overlay, height, effect, start_offset, end_offset, gravity) {
  this.overlay = overlay;
  this.height = height;
  this.effect = effect;
  this.start_offset = start_offset;
  this.end_offset = end_offset;
  this.gravity = gravity;
}

var transformationArray = [];
var cloud;
var singleVideo;
var singleVideoID = 292;

function createSingleVideoURL(id) {
  var size = [{ height: 600, crop: "scale" }];
  singleVideo = cloudinary.video("" + id, {
    secyre: true,
    controls: true,
    transformation: size,
  });
  console.log(chalk.bgMagenta(singleVideo));
}

function createVideoURL(captions) {
  transformationArray = [];
  var size = [{ height: 600, crop: "scale" }];
  captions.forEach((caption) => {
    var startMil = timeConverter(caption.startTime);
    var endMil = timeConverter(caption.endTime);
    var start = startMil / 1000;
    var end = endMil / 1000;

    //   // transformationArray.push(
    //   //   new Overlay(
    //   //     "video:" + caption.id,
    //   //     200,
    //   //     "accelerate: 100",
    //   //     start,
    //   //     end,
    //   //     "south_east"
    //   //   )
    //   // );
    var overlayObject = {
      overlay: "video:" + caption.id,
      height: 300,
      effect: "accelerate:60",
      start_offset: start,
      end_offset: end,
      gravity: "south_east",
    };
    transformationArray.push(overlayObject);
  });
  var finalArray = size.concat(transformationArray);
  cloud = cloudinary.video("ogVideo", {
    secure: true,
    controls: true,
    transformation: finalArray,
  });
  console.log(chalk.bgMagenta(cloud));
}

app.post("/noSubUpload", fUpload, (req, res) => {
  if (!req.files.subFile) {
    console.log(req.files.videoFile);
    var pathToVideo = "./" + req.files.videoFile[0].path;
    func.extractAudio(pathToVideo, (err, file) => {
      func.generateSubtitles(file, (err, response) => {
        var subtitleFile = func.formatSubtitles(response.result.results);
        console.log(subtitleFile);
        var sourceResult = func
          .sourceUpload(req.files.videoFile[0].filename)
          .then((result) => {
            console.log("Source upload done");
          });
        videoFile = req.files.videoFile[0].filename;
        console.log(sourceResult);
        var captions = subtitleFile.subtitles;
        srtCaptions = captions;
        seqGeneration(captions).then(() => {
          console.log("Done!");
          createVideoURL(captions);
          res.send(cloud);
        });
      });
    });
  } else {
    var fileContent = fs.readFileSync(
      "./" + req.files.subFile[0].path,
      "utf-8"
    );
    var pathToVideo = "./" + req.files.videoFile[0].path;
    console.log(req.files.videoFile);
    var sourceResult = func
      .sourceUpload(req.files.videoFile[0].filename)
      .then((result) => {
        console.log("Source upload done");
      });
    videoFile = req.files.videoFile[0].filename;
    console.log(sourceResult);
    var captions = subParser.fromSrt(fileContent, false);
    srtCaptions = captions;
    seqGeneration(captions).then(() => {
      console.log("Done!");
      createVideoURL(captions);
      res.send(cloud);
    });
  }
});

app.post("/fileUpload", fUpload, (req, res) => {
  var fileContent = fs.readFileSync("./" + req.files.subFile[0].path, "utf-8");
  var pathToVideo = "./" + req.files.videoFile[0].path;
  console.log(req.files.videoFile);
  var sourceResult = func
    .sourceUpload(req.files.videoFile[0].filename)
    .then((result) => {
      console.log("Source upload done");
    });
  videoFile = req.files.videoFile[0].filename;
  console.log(sourceResult);
  var captions = subParser.fromSrt(fileContent, false);
  srtCaptions = captions;
  seqGeneration(captions).then(() => {
    console.log("Done!");
    createVideoURL(captions);
    res.send(cloud);
  });
  // res.redirect("/video");

  // func.concatFileUploadTwo("caption");
});

app.post("/sentenceUpload", async (req, res) => {
  // console.log(req.body);
  // res.send(req.body);
  var sentence = req.body.sentence;
  var textArray = func.predictText(sentence);
  console.log(chalk.bgGrey(textArray));
  await generateVideoTwo(textArray, singleVideoID);
  await func.concatFileUploadTwo(singleVideoID);
  createSingleVideoURL(singleVideoID);
  singleVideoID++;
  res.send(singleVideo);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Server is Running and Healthy on port " + port);
});
