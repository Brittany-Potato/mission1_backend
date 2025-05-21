//~~~~~~~~~~~~Variables and imports~~~~~~~~~~~~~
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const port = 4000;
require("dotenv").config();


// Enviroment Variables and loads the API key and endpoint URL
const apikey = process.env.KEY;
const path = require("path");

const endpoint = process.env.CUSTOM_VISION_ENDPOINT
if (!endpoint || !apikey) {
    console.error("missing Azure endpoint or key in enviroment variables.");
}; //Logs an error if the Endpoint and Key are missing.

//~~~~~~~~~~MiddleWare~~~~~~~~~~~
app.use(cors());
app.use(express.json());

//~~~~~~~~~~~Basic route and starting the server~~~~~~~~
app.get("/", (req, res) => {
  res.send("Hello World!");
}); //Test string to make sure the servers responding

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
}); //Starting the server on the port provided which is stored as an enviromental variable

//Configuring Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); //Uploads folder and creates one if it doesn't exsist
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Unique file name
  },
}); //Making sure files get put into an /uploads folder and get given unique names based on the timestamp

const upload = multer({ storage: storage });

//Upload file


const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
} //Making sure there is an upload folder, also creates one if it doesn't exist.

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "no file uploaded" });
    } //Defining the route and what file to expect i.e. "file"
      //Validating the file upload and responding witha 404 error if there is no file.

      //Sending the file to Azure/Custom vision.
        const predictionUrl = `https://eastus.api.cognitive.microsoft.com/customvision/v3.0/Prediction/318a4251-3b8a-42ac-aca4-b63ec1b4cc0b/classify/iterations/Mission%20One/image`;

    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const imageData = fs.readFileSync(filePath); //Server reads the file as a binary buffer.

    const response = await axios.post(predictionUrl, imageData, {
        headers: {
            "Content-Type": "application/octet-stream",
            "prediction-Key": process.env.KEY,
        },
    }); //Sends the image to the Custom Vision AI model using a POST request with binary data.
    console.log("prediction response", response.data);
    res.status(200).json({prediction: response.data}); //Logs and returns the prediction result.
  } catch (err) {
    console.error("prediction error::", err.response?.data || err.message);
    res.status(500).json({ error: "Error sending image to Azure" });
  }
}); 
