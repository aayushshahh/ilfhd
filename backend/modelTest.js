const tf = require("@tensorflow/tfjs");
const tfnode = require("@tensorflow/tfjs-node");
const nmtModel = require("./NMT_model.json");

async function predictText(string) {
  const handler = tfnode.io.fileSystem("./NMT_model.json");
  const model = await tfnode.loadLayersModel(handler);
  const prediction = model.predict(string);
  console.log(prediction);
}

var string = "How are you";
predictText(string);
