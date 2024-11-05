const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/UserModel");
const Post = require("./models/post");
const { JsonWebTokenError } = require("jsonwebtoken");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
require('dotenv').config();
const fs = require("fs");
const { isAbsolute } = require("path");

const jwtSecret = process.env.JWT_SECRET;
const dbUri = process.env.DB_URI;

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(dbUri, {});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Generate a salt and hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create the user with the hashed password
    const userDoc = await User.create({ username, password: hashedPassword });
    res.json(userDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    //logged in
    jwt.sign({ username, id: userDoc._id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong Credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("files"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });
});

app.get("/post", async (req, res) => {
  res.json(
    await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20)
  );
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  try {
    const postDoc = await Post.findById(id).populate("author", "username");
    if (!postDoc) return res.status(404).json({ message: "Post not found" });

    // Initialize `isAuthor` as `false`
    let isAuthor = false;

    // If token exists, verify it to check if the user is the author
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userInfo) => {
        if (!err && JSON.stringify(postDoc.author._id) === JSON.stringify(userInfo.id)) {
          isAuthor = true;
        }
      });
    }

    res.json({
      post: postDoc,
      isAuthor, // Send `isAuthor` status as a boolean
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.put("/post", uploadMiddleware.single("files"), async (req, res) => {
  const { token } = req.cookies;
  let newPath = null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, jwtSecret, {}, async (err, info) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    console.log("User Info:", info); // Debug: Log user info
    console.log("Request Body:", req.body); // Debug: Log the request body

    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    if (!postDoc) return res.status(404).json({ message: "Post not found" });

    const isAuthor = JSON.stringify(postDoc.author._id) === JSON.stringify(info.id);
    if (!isAuthor) return res.status(403).json({ message: "You are not the author" });

    // Update post fields
    postDoc.title = title;
    postDoc.summary = summary;
    postDoc.content = content;
    postDoc.cover = newPath ? newPath : postDoc.cover;

    try {
      await postDoc.save();
      res.json(postDoc);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });
});


app.delete("/post/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, jwtSecret, {}, async (err, userInfo) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    try {
      const postDoc = await Post.findById(id);
      if (!postDoc) return res.status(404).json({ message: "Post not found" });

      const isAuthor = JSON.stringify(postDoc.author._id) === JSON.stringify(userInfo.id);
      if (!isAuthor) return res.status(403).json({ message: "You are not the author" });

      await Post.deleteOne({ _id: id }); // Delete the post using deleteOne
      res.status(204).send(); // No content response for successful deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});


app.listen(5000, () => console.log("Server running on 5000"));
