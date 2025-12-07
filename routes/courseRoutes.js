const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// =========================================================
// ROUTE 1: GET a single course by Name and Teacher
// ENDPOINT: /api/courses/course?name=CourseName&teacher=TeacherName
// This fixes the "Course ID is missing" error.
// =========================================================
router.get("/course", async function(req, res) {
    // Extract query parameters: ?name=CourseName&teacher=TeacherName
    const { name, teacher } = req.query; 

    // Basic validation to ensure parameters are provided
    if (!name || !teacher) {
        return res.status(400).json({ success: false, msg: "Course name and teacher are required for lookup." });
    }

    try {
        // Use findOne to get a single matching course by both name and teacher
        const course = await Course.findOne({ 
            name: name, 
            teacher: teacher 
        });

        if (!course) {
            // 404 if the course isn't found (e.g., due to spelling/casing mismatch)
            return res.status(404).json({ success: false, msg: "Course not found in database. Check the course name and teacher." });
        }

        // Success: Return the single course object.
        // Frontend expects { success: true, course: { ... } }
        res.json({ success: true, course });
    } catch(err) {
        console.error("Database lookup error:", err);
        res.status(500).json({ success: false, msg: "Server error during course lookup." });
    }
});

// ---------------------------------------------------------

// =========================================================
// ROUTE 2: POST to add a new lesson to a course
// ENDPOINT: /api/courses/:courseId/lessons
// =========================================================
router.post("/:courseId/lessons", async function(req, res) {
    const courseId = req.params.courseId;
    // req.body.lesson matches the JSON sent from the frontend: 
    // body: JSON.stringify({ lesson: { title: name, number, desc, file, link } })
    const newLesson = req.body.lesson; 

    // WARNING: This is a PLACEHOLDER for your authorization logic.
    // You MUST implement middleware to verify the user role (teacher) and 
    // check if the teacher's name matches the course's instructor before production.
    if (!newLesson) { 
        return res.status(400).json({ success: false, msg: "Missing lesson data in request body." });
    }
    
    try {
        // Find the course by ID and push the new lesson object into the 'lessons' array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $push: { lessons: newLesson } },
            { new: true } // { new: true } returns the updated document
        );

        if (!updatedCourse) {
             return res.status(404).json({ success: false, msg: "Course ID not found." });
        }
        
        // Success: Return the updated course object for the frontend to re-render the list
        res.json({ success: true, msg: "Lesson added successfully.", course: updatedCourse });

    } catch(err) {
        console.error("Add Lesson Error:", err);
        res.status(500).json({ success: false, msg: "Failed to add lesson. Server/Database error." });
    }
});

// ---------------------------------------------------------

// =========================================================
// ROUTE 3: GET all courses taught by a specific teacher (existing route)
// ENDPOINT: /api/courses/teacher/:teacherName
// =========================================================
router.get("/teacher/:teacherName", async function(req, res) {
    const teacherName = req.params.teacherName;

    try {
        const courses = await Course.find({teacher: teacherName});
        res.json({success: true, courses});
    } catch(err) {
        console.error(err);
        res.status(500).json({success: false, msg: "Server error"});
    }
});

module.exports = router;