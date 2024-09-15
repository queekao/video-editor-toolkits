const fs = require("node:fs");

const usersPath = "./data/users";
const sessionsPath = "./data/sessions";
const videosPath = "./data/videos";

class DB {
  constructor() {
    /*
     A sample object in this sessions array would look like:
     {"id":0,"videoId":"3b1e6cf6","name":"relax phone 2","extension":"mov","userId":1,"extractedAudio":false,"dimensions":{"width":1920,"height":1080},"thumbnail":"./storage/3b1e6cf6/thumbnail.jpg","resizes":{"400x400":{"processing":false},"600x600":{"processing":false},"500x500":{"processing":false},"300x300":{"processing":false}}}
    */
    this.videos = JSON.parse(fs.readFileSync(videosPath, "utf8"));

    /*
     A sample object in this users array would look like:
     { id: 1, name: "Liam Brown", username: "liam23", password: "string" }
    */
    this.users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

    /*
     A sample object in this sessions array would look like:
     { userId: 1, token: 23423423 }
    */
    this.sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  }

  update() {
    this.users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    this.videos = JSON.parse(fs.readFileSync(videosPath, "utf8"));
    this.sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  }

  save() {
    fs.writeFileSync(usersPath, JSON.stringify(this.users));
    fs.writeFileSync(videosPath, JSON.stringify(this.videos));
    fs.writeFileSync(sessionsPath, JSON.stringify(this.sessions));
  }
}

const db = new DB();

module.exports = db;
