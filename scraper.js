"use strict";

var fs = require("fs"); // Require fs module

var Xray = require('x-ray'); // Require x-ray module
var x = Xray();

var json2csv = require('json2csv'); // Require json2csv module

var date = new Date();

// Construct function to create data folder and save csv file
function saveData(result, file, folder) {
  //check data folder if already existed
  if(!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
    // Write the result to data folder
    fs.writeFile(folder + "/" + file, result, function(error) {
      if(error) printError(error, date);
      console.log("File saved.");
    });

}

// Construct the function to print error message
var printError = function(error, timestamp) {
  var errText = timestamp + "\n";
  errText += "Error: " + error;
  fs.appendFile("scraper-error.log", errText, function(error) {
    if(error) console.error(error);
    console.log(errText);
  });
};

// Using x-ray to scrap content from http://www.shirts4mike.com site
x("http://www.shirts4mike.com/",
  x(".shirts a@href",
    x(".products li", [{
      Title: "a img@alt",
      Price: x("a@href", ".shirt-details h1 span"),
      ImageURL: x("a@href", ".shirt-picture img@src"),
      URL: "a@href"
    }])
  )
)(function(err, obj) {
  // If can not log in the site, print error, Otherwise deal with the data

  if(err) {
    var errText1 = "Sorry, failed to log in www.shirts4mike.com website.";
    printError(errText1, date);
  } else {
    var data = obj;

    // Add "Time" property to data
    data.forEach(function(data) {
      data["Time"] = date.toString();
    });

    // Get csv file name
    var csvFileName = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    // If no error existed, use json2csv to create csv file and store in data folder
    // Otherwise print the error
    if(!err) {
      // Create csv file
      var fileds = ["Title", "Price", "ImageURL", "URL", "Time"], result;

      try {
        result = json2csv({data: data, fileds: fileds});
      } catch (error) {
        errText2 = "Sorry, failed to create csv file.";
        printError(errText2, date); // If failed to create file, print error message
      }

      // Save file to data folder
      saveData(result, csvFileName + ".csv", "./data");
    }
  }
});
