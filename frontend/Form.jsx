import React from "react";
import axios from "axios";

function Form() {
  const [videoFile, setVideoFile] = React.useState(null);
  const [subFile, setSubFile] = React.useState(null);
  const [videoPlayback, setVideoPlayback] = React.useState(null);

  function updateVideoFile(event) {
    let file = event.target.files[0];
    setVideoFile(file);
  }

  function updateSubFile(event) {
    let file = event.target.files[0];
    setSubFile(file);
  }

  function handleSubmit(event) {
    console.log(videoFile);
    console.log(subFile);
    setVideoPlayback(null);

    let formData = new FormData();
    formData.append("videoFile", videoFile);
    formData.append("subFile", subFile);

    axios({
      url: "http://localhost:5000/noSubUpload",
      method: "POST",
      data: formData,
    })
      .then((res) => {
        console.log(res);
        setVideoPlayback(res.data);
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
          Upload the Video
        </label>
        <input
          type="file"
          id="videoFile"
          name="video"
          className="video_input"
          accept="video/mp4"
          onChange={updateVideoFile}
        ></input>
        <br />
        <label htmlFor="subfile" className="sub_label">
          Upload the subtitle file (.srt)
        </label>
        <input
          type="file"
          id="subFile"
          name="sub"
          className="sub_input"
          accept=".srt"
          onChange={updateSubFile}
        ></input>
        <br />
        <button type="submit" className="btn btn-primary submit_button">
          GENERATE VIDEO WITH SIGN CAPTIONS
        </button>
      </form>
      <div
        className="video"
        dangerouslySetInnerHTML={{ __html: videoPlayback }}
      ></div>
    </div>
  );
}

export default Form;
