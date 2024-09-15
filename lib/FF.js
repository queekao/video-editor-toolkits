const { spawn } = require("child_process");

const makeThumbnail = (fullPath, thumbnailPath) => {
  // Command to make thumbnail -> ffmpeg -i original.mp4 -ss 5 -vframes 1 thumbnail.jpg
  const args = [
    "-i",
    fullPath,
    "-ss",
    "5", // Start processing at 5 seconds
    "-vframes",
    "1", // Capture just one frame
    // "-vf",
    //   "scale=-1:480", // Scale the image to 480p height with proportional width
    thumbnailPath,
  ];
  const ffmpeg = spawn("ffmpeg", args);
  return new Promise((resolve, reject) => {
    ffmpeg.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    ffmpeg.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });
    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject({ message: `ffmpeg process exited with code ${code}` });
      } else {
        resolve({ message: "Thumbnail created successfully" });
      }
    });
  });
};
const getDimensions = (fullPath) => {
  // Command to get dimesion -> ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 original.mp4
  const args = [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0",
    fullPath,
  ];
  const ffprobe = spawn("ffprobe", args);
  let output = "";
  return new Promise((resolve, reject) => {
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`stdout: ${data}`);
    });
    ffprobe.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });
    ffprobe.on("close", (code) => {
      if (code !== 0) {
        reject({ message: `ffprobe process exited with code ${code}` });
      } else {
        console.log("Dimensions get successfully");
        const width = parseInt(output.split(",")[0]);
        const height = parseInt(output.split(",")[1]);
        return resolve({
          width,
          height,
        });
      }
    });
  });
};
const extractAudio = (originalVideoPath, targetAudioPath) => {
  // ffmpeg -i input_video.mp4 -vn -c:a copy output_audio.aac
  const args = [
    "-i",
    originalVideoPath,
    "-vn",
    "-acodec",
    "copy",
    targetAudioPath,
  ];
  const ffmpeg = spawn("ffmpeg", args);
  return new Promise((resolve, reject) => {
    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        // TODO: Frontend should handle the no audio case
        reject({ message: `ffmpeg process exited with code ${code}` });
      } else {
        resolve({ message: "Audio extracted successfully" });
      }
    });
  });
};
const resizeVideo = (originalVideoPath, targetVideoPath) => {
  // ffmpeg -i video.mp4 -vf scale=320:240 -c:a copy video-320x240.mp4
  const args = [
    "-i",
    originalVideoPath,
    "-vf",
    "scale=320:240",
    "-c:a",
    "copy",
    // NOTE: ⭐️ Does not resume a previous operation
    "-y", // this for always overwriting the file
    targetVideoPath,
  ];
  const ffmpeg = spawn("ffmpeg", args);
  return new Promise((resolve, reject) => {
    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        // TODO: Frontend should handle the no audio case
        reject({ message: `ffmpeg process exited with code ${code}` });
      } else {
        resolve({ message: "Video resized successfully" });
      }
    });
  });
};

module.exports = { makeThumbnail, getDimensions, extractAudio, resizeVideo };
