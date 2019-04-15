const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const url = require("url");
const dns = require("dns");

const app = express();

// Use body Parse
app.use(bodyParser.urlencoded({ extended: true }));
// Accept JSON POST payload
app.use(bodyParser.json());

// Save to this variable each POST request to /api/shortuls/id to create
// shorter urls
let urls = [
  {
    id: 0,
    original_url: "https://freecodecamp.com"
  }
];

app.get("/api", (req, res) => {
  res.send("UMM");
});

app.post("/api/shorturl", (req, res) => {
  const { original_url } = req.body;
  const properUrlRe = /^https?:\/\/www\.\w+\.\w+(\/[a-zA-Z0-?=]+)+\/?$/;

  // Check for a valid url format
  if (!properUrlRe.test(original_url)) {
    res.json({
      error: "invalid URL"
    });
  } else {
    // Check if this domain exists
    const domain = url.parse(original_url).hostname;
    dns.lookup(domain, (err, addresses) => {
      if (err) {
        res.json({
          error: "invalid URL: This url does not exist."
        });
      } else {
        // Add new url to the urls array and send a json response.
        const lastId = urls[urls.length - 1].id;
        const newUrl = {
          id: lastId + 1,
          original_url
        };
        urls.push(newUrl);
        res.json(newUrl);
      }
    });
  }
});

app.get("/api/shorturl/:id", (req, res) => {
  const { id } = req.params;
  const url = urls.find(u => u.id === Number.parseInt(id));
  if (url) {
    res.redirect(url.original_url);
  }
  res.json({
    error: "invalid URL"
  });
});

exports.app = functions.https.onRequest(app);
