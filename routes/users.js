const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { verifyTokenAndAuthorization, verifyToken } = require("./verifyToken");
const jwt = require("jsonwebtoken");

// UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    const saltRounds = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
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
});

// DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json("User not found!");
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json("User has been delete...");
  } catch (err) {
    return res.status(500).json(err);
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

//  CHECK ACCESS TOKEN
router.post("/validatetoken", verifyToken, async (req, res) => {
  try {
    const accessToken = jwt.sign(
      {
        id: req.user.id,
        isAdmin: req.user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    const user = await User.findById(req.user.id);
    const { password, ...others } = user._doc;
    return res.status(200).json({ ...others, accessToken });
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
