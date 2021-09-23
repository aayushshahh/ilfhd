const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const sub = require("subsrt");
const subParser = require("subtitles-parser-vtt");
const { stringify } = require("querystring");
const func = require("./functions");
const chalk = require("chalk");
const { concat } = require("@tensorflow/tfjs-core");
const { resolve } = require("path");
const cloudinary = require("cloudinary").v2;

var string = ["hello", "i", "aayush"];
func.createVideoFileTwo(string);
func.generateConcatVideo(1);
