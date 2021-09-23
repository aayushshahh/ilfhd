import React from "react";
import axios from "axios";

function Sentence() {
  const [senInput, setSenInput] = React.useState("");
  const [singleVideo, setSingleVideo] = React.useState(null);

  function handleChange(event) {
    var sentence = event.target.value;
    setSenInput(sentence);
  }

  function handleSubmit(event) {
    setSingleVideo(null);
    axios
      .post("http://localhost:5000/sentenceUpload", { sentence: senInput })
      .then((res) => {
        console.log(res);
        setSingleVideo(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    event.preventDefault();
  }

  return (
    <div className="uploadDiv" id="uploadDiv">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="videoFile" className="video_label">
          Enter the Sentence
        </label>
        <br />
        <input
          type="text"
          id="sentence"
          name="sentence"
          className="sentence-input"
          placeholder="Enter a Sentence"
          value={senInput}
          onChange={handleChange}
        ></input>
        <br />
        <button type="submit" className="btn btn-primary submit_button">
          GENERATE VIDEO
        </button>
      </form>
      <div
        className="video"
        dangerouslySetInnerHTML={{ __html: singleVideo }}
      ></div>
    </div>
  );
}

export default Sentence;
