const fs = require("fs");
const { readFile, writeFile } = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const ejs = require('ejs');
const {formidable} = require('formidable');

const controller = {
  getFormPage: async (request, response) => {
  const database = await readFile("database/data.json", "utf8");
  const arr = JSON.parse(database);
  // const foundUser = arr.find(user => user.username === username)
  // const data = {
  //   username: foundUser.username,
  // }
  // const data = {
  //   users: arr.map(obj => obj.username)
  // }
  const data = {
    users: arr
  }

    const folderPath = path.join(__dirname, "..", "src", "views", "form.ejs");
    ejs.renderFile(folderPath, data, {}, function(err, newHtml) {
    response.writeHead(200, DEFAULT_HEADER);
    response.end(newHtml);
    });
    },
  getFeed: async (request, response) => {
    // username is the user from the url
    const username = (request.url.split("?")[1]).split("=")[1]; // sandra123

    // These two steps are getting array from data.json
    const database = await readFile("database/data.json");
    const arr = JSON.parse(database);

    const foundUser = arr.find(user => user.username === username)
    
    const folderPath = path.join(__dirname, "..", "src", "views", "feed.ejs");
    const data = {
        username: foundUser.username,
        followers: foundUser.stats.followers,
        following: foundUser.stats.following,
        posts: foundUser.stats.posts,
        feedPhotos: foundUser.photos,
        profile: foundUser.profile,
        descript: foundUser.description
    }
    ejs.renderFile(folderPath, data, {}, function(err, newHtml){
        response.end(newHtml);
    });
  },
  uploadImages: async (request, response) => {
    const username = (request.url.split("?")[1]).split("=")[1]; 
    const form = formidable({keepExtensions: true});
    form.uploadDir = path.join(__dirname, "..", "src", "photos", username);
    let fields;
    let files;
    [fields, files] = await form.parse(request);
    const filename = files.image[0].newFilename;
    console.log(filename);
    const getData = await readFile("database/data.json", "utf8");
      const database = JSON.parse(getData);
      console.log(database);
      const profiles = database.find(data => data.username === username);
      profiles.photos.push(filename)
      await writeFile("database/data.json", JSON.stringify(database))
      // const updateProfile = profiles.photos[profiles.photos.length] = filename; //photos에 사진 이름 업뎃
      // const obj = { updateProfile };

      // console.log(obj);
      // database.forEach(data => {
      //   if(data !== username) {
      //     obj.push(data);
      //   }
      // });
    // MOVE THE FILE HERE
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ fields, files }, null, 2));
    return;
  },
};

module.exports = controller;
