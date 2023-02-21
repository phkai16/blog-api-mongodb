const router = require("express").Router();
const User = require("../models/User");
const Article = require("../models/Article");
const { verifyTokenAndAuthorization } = require("./verifyToken");

// CREATE
router.post("/", async (req, res) => {
  const newArticle = new Article(req.body);

  try {
    const savedArticle = await newArticle.save();
    return res.status(201).json(savedArticle);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    console.log("req.body: " + req.body);
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    console.log("updatedArticle: " + updatedArticle);
    return res.status(200).json(updatedArticle);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    return res.status(200).json("Article has been delete...");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    return res.status(200).json(article);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// GET ALL
router.get("/", async (req, res) => {
  const username = req.query.user;
  const categoryName = req.query.category;
  try {
    let articles;
    if (username) {
      articles = await Article.find({ username: username });
    } else if (categoryName) {
      articles = await Article.find({
        categories: {
          $in: [categoryName],
        },
      });
    } else {
      articles = await Article.find();
    }
    return res.status(200).json(articles);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
