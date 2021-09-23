const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const sw = require("stopword");
const { exec } = require("child_process");
const ff = require("ffmpeg");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const { IamAuthenticator } = require("ibm-watson/auth");
const moment = require("moment");
require("moment-duration-format");
const ffmpeg = require("ffmpeg-concat");

//Opening an srt file and parsing
// var fileContent = fs.readFileSync("../body.srt", "utf-8");
// var options = { verbose: true };
// var captions = sub.parse(fileContent, options);

//Base and Absolute Paths
let uselessWords = [
  "is",
  "the",
  "are",
  "am",
  "a",
  "it",
  "was",
  "where",
  "an",
  "to",
  "will",
  "and",
  "do",
  "oh",
  "mr",
  "about",
  "there",
  "let",
  "tell",
  "part",
  "did",
  "just",
  "saved",
];
var path = "../../Signs/";
var relPath = "../";
let abPath = "/Volumes/Shareable/WC/FYP/Signs/";

//Cloudinary Config Setting and Authentication
cloudinary.config({
  cloud_name: "improvedlearning",
  api_key: "299317385827573",
  api_secret: "r1o94kqE9mUyYxBWBYP5LIxr19U",
});

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: "_DlFtiGfOuR3XdYuzAiy577pv8aqP7lAUgHj5b1BB106",
  }),
  serviceUrl:
    "https://api.kr-seo.speech-to-text.watson.cloud.ibm.com/instances/42e897e4-6438-4a6d-9531-db7b8f252209",
});

//String Transformation to remove useless words and remove casing
function predictText(string) {
  punctuationLessString = string.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
  var lowerCaseString = punctuationLessString.toLowerCase();
  var wordArray = lowerCaseString.split(" ");
  var finalArray = sw.removeStopwords(wordArray, uselessWords);
  return finalArray;
}

function concatFileUploadTwo(id) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      relPath + "ConcatVideos/output" + id + ".mp4",
      {
        resource_type: "video",
        public_id: id,
        overwrite: true,
      },
      function (error, result) {
        console.log(result, error);
        resolve(result);
      }
    );
  });
}

function sourceUpload(fileName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      relPath + "js/uploads/" + fileName,
      {
        resource_type: "video",
        public_id: "ogVideo",
        overwrite: true,
      },
      function (error, result) {
        if (!error) {
          console.log(result, error);
          resolve(result);
        }
      }
    );
  });
}

//Creating concat file of the videos to upload
function createVideoFile(stringArray) {
  const data = fs.writeFileSync("vidlist.txt", "");
  stringArray.forEach((word) => {
    const data = fs.appendFileSync(
      "vidlist.txt",
      "file " + abPath + word + ".mp4\n",
      (err) => {}
    );
  });
}

function createVideoFileTwo(stringArray) {
  const data = fs.writeFileSync("vidlist.txt", "");
  stringArray.forEach((word) => {
    if (fs.existsSync("../../Signs/" + word + ".mp4")) {
      const data = fs.appendFileSync(
        "vidlist.txt",
        "file " + abPath + word + ".mp4\n",
        (err) => {}
      );
    } else {
      var alphabets = [...word];
      // console.log(alphabets);
      alphabets.forEach((alphabet) => {
        const data = fs.appendFileSync(
          "vidlist.txt",
          "file " + abPath + "Alphabets/" + alphabet + ".mp4\n",
          (err) => {}
        );
      });
    }
  });
}

function createSingleVideoFile(stringArray) {
  stringArray.forEach((word) => {
    const data = fs.appendFileSync(
      "vidlist.txt",
      "file " + abPath + word + ".mp4\n",
      (err) => {}
    );
  });
}

function generateConcatVideo(id) {
  return new Promise((resolve, reject) => {
    let concatCommand =
      "ffmpeg -f concat -safe 0 -i vidList.txt -c copy ../ConcatVideos/output" +
      id +
      ".mp4 -y";
    exec(concatCommand, function (std, stdout, stderr) {
      if (stderr) {
        console.log(stderr);
        resolve();
      } else {
        console.log("Done!");
        resolve();
      }
    });
  });
}

function singelConcatVideo() {
  let concatCommand =
    "ffmpeg -f concat -safe 0 -i vidList.txt -c copy ../ConcatVideos/output.mp4 -y";
  exec(concatCommand, function (std, stdout, stderr) {
    if (stderr) {
      console.log(stderr);
    } else {
      console.log("Done!");
    }
  });
}

//Extracting audio from a video file
function extractAudio(videoFile, callback) {
  try {
    let process = new ff(videoFile);
    process.then(function (video) {
      video.fnExtractSoundToMP3(videoFile + ".mp3", function (error, file) {
        if (!error) {
          // console.log('Audio File: ' + file);
          callback(null, file);
        }
      });
    }),
      function (err) {
        console.log("Error: " + err);
        callback(err);
      };
  } catch (e) {
    console.log(e.code);
    console.log(e.message);
    callback(e);
  }
}

//Generating and formatting subtitles
function generateSubtitles(audioFile, callback) {
  var params = {
    audio: fs.createReadStream(audioFile),
    contentType: "audio/mp3",
    model: "en-GB_BroadbandModel",
    timestamps: true,
    continuous: true,
    max_alternatives: 1,
    smart_formatting: false,
  };

  speechToText
    .recognize(params)
    .then((speechRecognitionResults) => {
      // console.log(JSON.stringify(speechRecognitionResults, null, 2))
      callback(null, speechRecognitionResults);
    })
    .catch((err) => {
      console.log("Error: " + err);
      callback(err);
    });
}

function countWords(s) {
  s = s.replace(/\n/g, " "); // newlines to space
  s = s.replace(/(^\s*)|(\s*$)/gi, ""); // remove spaces from start + end
  s = s.replace(/[ ]{2,}/gi, " "); // 2 or more spaces to 1
  return s.split(" ").length;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatSubtitles(resultsArray) {
  var srtJSON = [];
  var speechEvents = [];

  for (var i = 0; i < resultsArray.length; ++i) {
    var alternatives = resultsArray[i].alternatives;
    var timeStamps = alternatives[0].timestamps;
    var textItem = alternatives[0].transcript;
    var confidence = alternatives[0].confidence;

    if (confidence > 0.0) {
      // This is used to record the raw speech events
      var event = {
        id: 0,
        text: "",
        words: [],
      };

      // This used for the subtitles
      var subtitle = {
        id: "0",
        startTime: "",
        endTime: "",
        text: "",
      };

      event.id = String(i + 1);
      event.text = textItem;
      subtitle.text = textItem;

      /* 
            We need to do a special check to see if there are multiple words in any of
            the timeStamps. We break them up into multiple words. 
            */

      var correctedTimeStamps = [];

      for (j = 0; j < timeStamps.length; ++j) {
        if (countWords(timeStamps[j][0]) == 1) {
          correctedTimeStamps.push(timeStamps[j]);
        } else {
          // grab each word and create a separate entry
          var start = timeStamps[j][1];
          var end = timeStamps[j][2];

          var words = timeStamps[j][0].split(" ");
          for (k = 0; k < words.length; ++k) {
            correctedTimeStamps.push([words[k], start, end]);
          }
        }
      }

      event.words = correctedTimeStamps;

      subtitle.id = String(i + 1);

      // The timestamps entry is an array of 3 items ['word', 'start time', 'end time']

      // Get the start time for when the first word is spoken in the segment
      subtitle.startTime = moment
        .duration(timeStamps[0][1], "seconds")
        .format("hh:mm:ss,SSS", {
          trim: false,
        });
      // Get the end time for when the last word is spoken in the segment
      subtitle.endTime = moment
        .duration(timeStamps[timeStamps.length - 1][2], "seconds")
        .format("hh:mm:ss,SSS", {
          trim: false,
        });

      srtJSON.push(subtitle);
      speechEvents.push(event);
    }
  }
  return {
    subtitles: srtJSON,
    events: speechEvents,
  };
}

module.exports = {
  predictText,
  createVideoFile,
  generateConcatVideo,
  extractAudio,
  generateSubtitles,
  formatSubtitles,
  singelConcatVideo,
  createSingleVideoFile,
  concatFileUploadTwo,
  sourceUpload,
  createVideoFileTwo,
};
