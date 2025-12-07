// const express = require("express");
// const Discussion = require("../models/Discussion");

// const router = express.Router();

// // CREATE POST
// router.post("/create", async (req, res) => {
//     try {
//         const { authorName, authorRole, postText, courseId } = req.body;

//         if (!postText || !authorName || !authorRole || !courseId) {
//             return res.status(400).json({ message: "Missing required fields." });
//         }

//         const newPost = new Discussion({
//             authorName,
//             authorRole,
//             postText,
//             courseId
//         });

//         const saved = await newPost.save();
//         res.json(saved);

//     } catch (err) {
//         res.status(500).json({ message: "Server error", error: err });
//     }
// });

// module.exports = router;





const express = require("express");
const Discussion = require("../models/Discussion");

const router = express.Router();

// CREATE POST
router.post("/create", async (req, res) => {
    try {
        const { authorName, authorRole, postText } = req.body;

        if (!postText || !authorName || !authorRole) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const newPost = new Discussion({ authorName, authorRole, postText });
        const saved = await newPost.save();
        res.json(saved);

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});

// GET ALL POSTS
router.get("/all", async (req, res) => {
    try {
        const posts = await Discussion.find().sort({ createdAt: -1 });
        res.json({ posts });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});

// DELETE POST BY ID
router.delete("/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        if (!postId) return res.status(400).json({ message: "Post ID is required." });

        const deleted = await Discussion.findByIdAndDelete(postId);
        if (!deleted) return res.status(404).json({ message: "Post not found." });

        res.json({ success: true, message: "Post deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
});

module.exports = router;
