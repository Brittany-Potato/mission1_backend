//Variables
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const port = 4000;


const apikey = process.env.KEY;
const path = require("path");

const endpoint = process.env.CUSTOM_VISION_ENDPOINT
if (!endpoint || !apikey) {
    console.error("missing Azure endpoint or key in enviroment variables.");
};

//MiddleWare
app.use(cors());
app.use(express.json());

//code
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.post(endpoint, (req, res) => {
  const data = req.body;
  console.log(data);
  res.send("Data has been recieved");
});

//Configuring Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); //Uploads folder and creates one if it doesn't exsist
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Unique file name
  },
});

const upload = multer({ storage: storage });

//Upload file


const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ errpr: "no file uploaded" });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", err => console.error("File read error", err));

    const predictionUrl = `${process.env.CUSTOM_VISION_ENDPOINT}/customvision/v3.0/Prediction/318a4251-3b8a-42ac-aca4-b63ec1b4cc0b/classify/iterations/MissionOne/image`;
    const response = await axios.post(predictionUrl, fileStream, {
        headers: {
            "Content-Type": "application/octet-stream",
            "prediction-Key": process.env.KEY,
        },
    });
    console.log("prediction response", response.data);
    res.status(200).json({prediction: response.data});
  } catch (err) {
    console.error("prediction error::", err.response?.data || err.message);
    res.status(500).json({ error: "Error sending image to Azure" });
  }
});
