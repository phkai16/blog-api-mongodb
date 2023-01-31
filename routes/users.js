const router = require("express").Router();
const User = require("../models/User");
const Article = require("../models/Article");
const bcrypt = require("bcrypt");
const { verifyTokenAndAuthorization } = require("./verifyToken");

// UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const saltRounds = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    }
    try {
      const updatedUser = await User.findOneAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedUser);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can update only your account!");
  }
});

// DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.userId === req.params.id) {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json("User not found!");
    }
    try {
      await Article.deleteMany({ username: user.username });
      await User.findOneAndDelete(req.params.id);
      return res.status(200).json("User has been delete...");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("You can delete only your account!");
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
