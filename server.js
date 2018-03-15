var express = require("express");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var axios = require("axios");
var bodyParser = require("body-parser");
var logger = require("morgan");

// Require all models
var db = require("./models");

var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/MongoScraper", {
  useMongoClient: true
});


app.get("/scrape", function(req, res) {

	axios.get("http://www.nytimes.com").then(function(response) {
		var $ = cheerio.load(response.data);

		$("h2.story-heading").each(function(i, element) {
			var result = {};

			// Add the text and href of every link, and save them as properties of the result object
	      	result.title = $(this)
		        .children("a")
		        .text();
	      	result.link = $(this)
		        .children("a")
		        .attr("href");

			// Create a new Article using the `result` object built from scraping
      		db.Article.create(result)
        		.then(function(dbArticle) {
          			// View the added result in the console
          			console.log(dbArticle);
       			})
        		.catch(function(err) {
          			// If an error occurred, send it to the client
          			return res.json(err);
        		});
    	});    
		res.send("Scrape Complete");
	});
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
















app.listen(8080, function() {
  console.log("App running on port 8080!");
});
