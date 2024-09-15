const DB = require("../src/DB");
const util = require("./util");
const FF = require("./FF");
class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
  }
  enqueue(job) {
    this.jobs.push(job);
    this.executeNext();
  }
  executeNext() {
    if (this.currentJob) return; // if we currently have a job
    this.currentJob = this.dequeue();
    if (!this.currentJob) return; // if the dequeue current job is `null` return back
    this.execute(this.currentJob);
  }
  async execute(job) {
    // FFmpeg logic
    if (job.type === "resize") {
      const { video, width, height } = job;
      const originalVideoPath = `./storage/${video.videoId}/original.${video.extension}`;
      const targetVideoPath = `./storage/${video.videoId}/${width}x${height}.${video.extension}`;
      try {
        /**
         * 1. ⭐️ Here handle muliple resize concurrently
         * 2. Therefore after resizing job done we need to find the video a gain for updating current video
         */
        await FF.resizeVideo(originalVideoPath, targetVideoPath, width, height);
        DB.update();
        const updateVideo = DB.videos.find(
          (curVideo) => curVideo.videoId === video.videoId
        );
        updateVideo.resizes[`${width}x${height}`].processing = false;
        DB.save();
        console.log(
          `Done resizing! Number of jobs remaining: ${this.jobs.length}`
        );
      } catch (error) {
        util.deleteFile(targetVideoPath);
        console.log(error);
        throw new Error(`${error.message}`);
      }
    }
    this.currentJob = null;
    this.executeNext();
  }
  dequeue(job) {
    return this.jobs.shift();
  }
}
module.exports = JobQueue;
