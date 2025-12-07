document.addEventListener("DOMContentLoaded", function () {
    // API ENDPOINT CONSTANTS
    const API_BASE = "http://localhost:3500/api/courses";

    // ----------------- USER SESSION & AUTHENTICATION -----------------
    const currentUserRole = sessionStorage.getItem("role");
    const currentUserName = sessionStorage.getItem("teacherName");
    const authToken = sessionStorage.getItem("token");

    // Redirect if not logged in
    if (!currentUserRole || !authToken) {
        window.location.href = "index.html";
        return;
    }

    // Update all UI elements correctly
    const navUserName = document.getElementById('navUserName');
    const navUserRole = document.getElementById('navUserRole');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const displayRoleText = currentUserRole.toUpperCase();

    if (navUserName) navUserName.textContent = currentUserName || displayRoleText;
    if (navUserRole) navUserRole.textContent = `Role: ${displayRoleText}`;
    if (userRoleDisplay) userRoleDisplay.textContent = displayRoleText;

    // ----------------- DOM ELEMENTS & STATE -----------------
    const coursePanel = document.getElementById("coursePanel");
    const courseTitleElement = document.getElementById("courseTitle");
    const courseTitleSubElement = document.getElementById("courseTitle_sub");
    const panelInstructorElement = document.getElementById("panelInstructor");
    const courseList = document.getElementById("courseList");
    const closeCoursePanel = document.getElementById("closeCoursePanel");
    const addLessonBtn = document.getElementById("addLessonBtn");
    const courseOverlay = document.getElementById("courseOverlay");

    // Form Elements (used for both Add and Edit)
    const addLessonForm = document.getElementById("addLessonForm");
    const submitLessonBtn = document.getElementById("submitLessonBtn"); // The 'Add Lesson' button
    const editSubmitBtn = document.getElementById("editSubmitBtn");     // The 'Update Lesson' button
    const cancelEditBtn = document.getElementById("cancelEditBtn");     // The 'Cancel' button

    const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

    // NEW: Reference the Bootstrap Lesson Modal object (View Modal)
    const lessonModal = new bootstrap.Modal(document.getElementById('lessonModal'));

    // ⭐️ STATE VARIABLES for Edit Functionality
    let isEditing = false;
    let currentLessonIdToEdit = null;

    if (!coursePanel) return; // Exit if the panel structure is missing

    // ----------------- LOGOUT HANDLER -----------------
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }

    // ----------------- HELPER FUNCTIONS -----------------
    function closePanel() {
        coursePanel.style.transform = "translateX(100%)";
        courseOverlay.style.display = "none";
        switchFormMode('add');
        coursePanel.dataset.courseId = "";
        coursePanel.dataset.courseTeacher = "";
    }

    async function fetchAndRenderCourse(courseId) {
        try {
            courseList.innerHTML = '<p class="text-center text-muted mt-5"><i class="fa-solid fa-spinner fa-spin me-2"></i>Updating lessons...</p>';
            const res = await fetch(`${API_BASE}/id/${courseId}`);
            const data = await res.json();

            if (data.success && data.course) {
                renderLessons(data.course.lessons || []);
            } else {
                courseList.innerHTML = `<p class="text-danger text-center mt-5">Error reloading lessons: ${data.msg || "Course not found."}</p>`;
            }
        } catch (err) {
            console.error("Reload Error:", err);
            courseList.innerHTML = '<p class="text-danger text-center mt-5">Network Error: Failed to reload course data.</p>';
        }
    }

    function switchFormMode(mode, lessonData = {}) {
        const addLessonForm = document.getElementById("addLessonForm");
        const lessonFileInput = document.getElementById("lessonFile");
        const formTitle = document.getElementById("addLessonFormTitle");
        const submitLessonBtn = document.getElementById("submitLessonBtn");

        if (!addLessonForm || !lessonFileInput || !formTitle || !submitLessonBtn) {
            console.error("Missing UI elements for lesson form. Teacher UI not fully loaded.");
            return;
        }

        if (mode === 'edit') {
            isEditing = true;

            document.getElementById("lessonName").value = lessonData.title || '';
            document.getElementById("lessonNumber").value = lessonData.number || '';
            document.getElementById("lessonDesc").value = lessonData.desc || '';
            document.getElementById("lessonLink").value = lessonData.link || '';
            document.getElementById("lessonFile").value = '';

            submitLessonBtn.style.display = 'none';
            editSubmitBtn.style.display = 'inline-block';
            cancelEditBtn.style.display = 'inline-block';

            document.getElementById("addLessonFormTitle").textContent = "Edit Lesson";
            addLessonForm.style.display = "block";

        } else {
            isEditing = false;
            currentLessonIdToEdit = null;

            document.getElementById("lessonName").value = "";
            document.getElementById("lessonNumber").value = "";
            document.getElementById("lessonDesc").value = "";
            document.getElementById("lessonFile").value = "";
            document.getElementById("lessonLink").value = "";

            submitLessonBtn.style.display = 'inline-block';
            editSubmitBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';

            document.getElementById("addLessonFormTitle").textContent = "Add New Lesson";
            addLessonForm.style.display = "none";
        }

        lessonModal.hide();
    }

    function handleLessonClick(e) {
        e.preventDefault();
        const item = e.currentTarget;

        const lessonId = item.dataset.lessonId;
        const isTeacher = currentUserRole === "teacher";
        const courseTeacher = coursePanel.dataset.courseTeacher;
        const isOwner = isTeacher && currentUserName === courseTeacher;

        document.getElementById("lessonModalTitle").textContent = item.dataset.title;
        document.getElementById("lessonModalNumber").textContent = `Index: ${item.dataset.number}`;
        document.getElementById("lessonModalDesc").textContent = item.dataset.desc;

        const actionContainer = document.getElementById("lessonModalActionContainer");
        if (actionContainer) {
            actionContainer.innerHTML = '';

            if (isOwner) {
                actionContainer.style.display = 'block';
                actionContainer.innerHTML = `
                    <button type="button" class="btn btn-warning btn-sm me-2" onclick="editLesson('${lessonId}')">
                        <i class="fa-solid fa-edit me-1"></i> Edit
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteLesson('${lessonId}')">
                        <i class="fa-solid fa-trash me-1"></i> Delete
                    </button>
                `;
            } else {
                actionContainer.style.display = 'none';
            }
        }

        const fileContainer = document.getElementById("lessonModalFileContainer");
        const filePath = item.dataset.file;
        if (filePath && filePath !== "undefined" && filePath !== "") {
            document.getElementById("lessonModalFileLink").href = `./files/${filePath}`;
            document.getElementById("lessonModalFileLink").textContent = filePath;
            fileContainer.style.display = "block";
        } else {
            fileContainer.style.display = "none";
        }

        const linkContainer = document.getElementById("lessonModalLinkContainer");
        const lessonLink = item.dataset.link;
        if (lessonLink && lessonLink !== "undefined" && lessonLink !== "") {
            document.getElementById("lessonModalExternalLink").href = lessonLink;
            document.getElementById("lessonModalExternalLink").textContent = lessonLink;
            linkContainer.style.display = "block";
        } else {
            linkContainer.style.display = "none";
        }

        lessonModal.show();
    }

    function renderLessons(lessons) {
        courseList.innerHTML = "";
        if (!lessons || lessons.length === 0) {
            courseList.innerHTML = '<p class="text-muted fst-italic mt-3">No lessons found for this course.</p>';
            return;
        }

        const isOwner = currentUserRole === "teacher" && currentUserName === coursePanel.dataset.courseTeacher;

        lessons.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
            .forEach((lesson) => {

                const lessonItem = document.createElement("div");
                lessonItem.className = "lessonItem_c mb-3 p-2 border rounded";

                lessonItem.dataset.lessonId = lesson._id;
                lessonItem.dataset.title = lesson.title;
                lessonItem.dataset.number = lesson.number;
                lessonItem.dataset.desc = lesson.desc || "No description provided.";
                lessonItem.dataset.file = lesson.file || "";
                lessonItem.dataset.link = lesson.link || "";

                // Add inline edit/delete buttons if owner
                let buttonsHTML = '';
                if (isOwner) {
                    buttonsHTML = `
    <div class="mt-1">
        <button type="button" class="btn btn-warning btn-sm me-2 editLessonBtn" onclick="event.stopPropagation(); editLesson('${lesson._id}')">
            <i class="fa-solid fa-edit me-1"></i>Edit
        </button>
        <button type="button" class="btn btn-danger btn-sm deleteLessonBtn" onclick="event.stopPropagation(); deleteLesson('${lesson._id}')">
            <i class="fa-solid fa-trash me-1"></i>Delete
        </button>
    </div>
`;

                }

                lessonItem.innerHTML = `
                 <h6 class="mb-1">${lesson.number} - ${lesson.title}</h6>
                 ${lesson.desc ? `<p class="small mb-1">${lesson.desc}</p>` : ""}
                 ${lesson.file ? `<p class="small text-info mb-1"><i class="fa-solid fa-file-pdf me-1"></i> File: ${lesson.file}</p>` : ""}
                 ${lesson.link ? `<p class="small text-primary mb-0"><i class="fa-solid fa-link me-1"></i> Link: <a href="${lesson.link}" target="_blank">${lesson.link}</a></p>` : ""}
                 ${buttonsHTML}
            `;
                courseList.appendChild(lessonItem);
            });

        document.querySelectorAll(".lessonItem_c").forEach(item => {
            item.addEventListener("click", handleLessonClick);
            item.style.cursor = 'pointer';
        });
    }

    async function initializeCourseCounts() {
        const cards = document.querySelectorAll(".card");
        for (const card of cards) {
            const titleEl = card.querySelector(".card-title");
            const teacherName = card.querySelector(".instructor_c")?.dataset.teacher;
            if (!titleEl || !teacherName) continue;

            try {
                const res = await fetch(`${API_BASE}/course?name=${encodeURIComponent(titleEl.dataset.courseFullName)}&teacher=${encodeURIComponent(teacherName)}`);
                const data = await res.json();
                if (data.success && data.course) {
                    const lessonsLabel = card.querySelector(".lessons_c");
                    lessonsLabel.textContent = `${data.course.lessons.length} lesson(s)`;
                }
            } catch (err) {
                console.error("Error fetching course for count:", err);
            }
        }
    }

    // Call this at the end of DOMContentLoaded
    initializeCourseCounts();


    // ----------------- UPDATE LESSON COUNT ON COURSE CARDS -----------------
    function updateLessonCounts() {
        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            const titleEl = card.querySelector(".card-title");
            const lessonsLabel = card.querySelector(".lessons_c");
            if (!titleEl || !lessonsLabel) return;

            const courseName = titleEl.dataset.courseFullName || titleEl.textContent.trim();
            const teacherName = card.querySelector(".instructor_c")?.dataset.teacher;

            // Find matching course panel
            const currentId = coursePanel.dataset.courseId;
            const panelName = courseTitleElement.textContent.trim();
            const panelTeacher = coursePanel.dataset.courseTeacher;

            // Only update the opened course
            if (panelName === courseName && panelTeacher === teacherName) {
                const lessonItems = courseList.querySelectorAll(".lessonItem_c");
                lessonsLabel.textContent = `${lessonItems.length} lesson(s)`;
            }
        });
    }


    // ----------------- GLOBAL ACTIONS -----------------
    window.deleteLesson = async function (lessonId) {
        if (!confirm("Are you sure you want to delete this lesson?")) return;
        const courseId = coursePanel.dataset.courseId;
        if (!courseId || !lessonId || !authToken) return alert("System Error: Missing IDs or token.");

        try {
            const res = await fetch(`${API_BASE}/${courseId}/lessons/${lessonId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${authToken}` }
            });

            const data = await res.json();
            lessonModal.hide();

            if (res.ok && data.success) {
                alert("Lesson deleted successfully!");
                await fetchAndRenderCourse(courseId);
                updateLessonCounts();
            } else {
                alert(`Deletion Failed: ${data.msg || "Server error."}`);
            }
        } catch (err) {
            console.error("Delete Network Error:", err);
            alert("Network Error: Could not connect to the server to delete the lesson.");
        }
    }

    window.editLesson = function (lessonId) {
        const courseId = coursePanel.dataset.courseId;
        if (!courseId) return alert("System Error: Course ID is missing.");

        currentLessonIdToEdit = lessonId;
        const lessonItem = document.querySelector(`.lessonItem_c[data-lesson-id="${lessonId}"]`);
        if (!lessonItem) return alert("Lesson data not found in UI.");

        const lessonData = {
            title: lessonItem.dataset.title,
            number: lessonItem.dataset.number,
            desc: lessonItem.dataset.desc,
            file: lessonItem.dataset.file,
            link: lessonItem.dataset.link,
        };

        switchFormMode('edit', lessonData);
    }

    // ----------------- EVENT LISTENERS -----------------
    document.querySelectorAll(".openCourseBtn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const card = btn.closest(".card");
            const fullCourseName = card.querySelector(".card-title").dataset.courseFullName || card.querySelector(".card-title").textContent;
            const teacherName = card.querySelector(".instructor_c").dataset.teacher;

            courseTitleElement.textContent = fullCourseName;
            panelInstructorElement.textContent = `Instructor: ${teacherName}`;
            courseTitleSubElement.textContent = fullCourseName;
            switchFormMode('add');
            courseList.innerHTML = '<p class="text-center text-muted mt-5"><i class="fa-solid fa-spinner fa-spin me-2"></i>Loading lessons...</p>';

            addLessonBtn.style.display = (currentUserRole === "teacher" && currentUserName === teacherName)
                ? "inline-block" : "none";

            coursePanel.style.transform = "translateX(0)";
            courseOverlay.style.display = "block";
            coursePanel.dataset.courseTeacher = teacherName;

            try {
                const res = await fetch(`${API_BASE}/course?name=${encodeURIComponent(fullCourseName)}&teacher=${encodeURIComponent(teacherName)}`);
                const data = await res.json();

                if (!data.success || !data.course) {
                    courseList.innerHTML = `<p class="text-danger text-center mt-5">Error loading course: ${data.msg || "Course not found."}</p>`;
                    coursePanel.dataset.courseId = "";
                    return;
                }

                coursePanel.dataset.courseId = data.course._id;
                updateLessonCounts();
                renderLessons(data.course.lessons || []);
            } catch (err) {
                console.error("Fetch Course Details Error:", err);
                courseList.innerHTML = '<p class="text-danger text-center mt-5">Network Error: Failed to load course data.</p>';
                coursePanel.dataset.courseId = "";
            }
        });
    });

    closeCoursePanel.addEventListener("click", closePanel);
    courseOverlay.addEventListener("click", closePanel);
    addLessonBtn?.addEventListener("click", () => {
        if (!isEditing) addLessonForm.style.display = addLessonForm.style.display === "none" ? "block" : "none";
    });

    submitLessonBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        if (isEditing) return alert("System Error: Cannot use 'Add Lesson' button while editing.");
        const name = document.getElementById("lessonName").value.trim();
        const number = document.getElementById("lessonNumber").value.trim();
        const courseId = coursePanel.dataset.courseId;
        if (!name || !number || !courseId || !authToken) return alert("Validation Error: Missing required data.");

        const formData = new FormData();
        formData.append('title', name);
        formData.append('number', number);
        formData.append('desc', document.getElementById("lessonDesc").value.trim());
        formData.append('link', document.getElementById("lessonLink").value.trim());
        const lessonFile = document.getElementById("lessonFile").files[0];
        if (lessonFile) formData.append('lessonFile', lessonFile);

        try {
            const res = await fetch(`${API_BASE}/${courseId}/lessons`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${authToken}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Lesson added successfully!");
                renderLessons(data.course.lessons || []);
                updateLessonCounts();
                switchFormMode('add');
            } else {
                alert(`API Error: ${data.msg || "An error occurred."}`);
            }
        } catch (err) {
            console.error("Add Lesson Network Error:", err);
            alert("Network Error: Could not connect to the server.");
        }
    });

    cancelEditBtn?.addEventListener("click", () => switchFormMode('add'));

    editSubmitBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!isEditing || !currentLessonIdToEdit) return alert("System Error: Not in a valid editing state.");

        const name = document.getElementById("lessonName").value.trim();
        const number = document.getElementById("lessonNumber").value.trim();
        const courseId = coursePanel.dataset.courseId;
        if (!name || !number || !courseId || !authToken) return alert("Validation Error: Missing required data.");

        const formData = new FormData();
        formData.append('title', name);
        formData.append('number', number);
        formData.append('desc', document.getElementById("lessonDesc").value.trim());
        formData.append('link', document.getElementById("lessonLink").value.trim());
        const lessonFile = document.getElementById("lessonFile").files[0];
        if (lessonFile) formData.append('lessonFile', lessonFile);

        try {
            const res = await fetch(`${API_BASE}/${courseId}/lessons/${currentLessonIdToEdit}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${authToken}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Lesson updated successfully!");
                switchFormMode('add');
                await fetchAndRenderCourse(courseId);
                updateLessonCounts();
            } else {
                alert(`Update Failed: ${data.msg || "Server error."}`);
            }
        } catch (err) {
            console.error("Update Lesson Network Error:", err);
            alert("Network Error: Could not connect to the server.");
        }
    });
});


// 2/12 new codes for discssion

const postInput = document.getElementById("postInput");
const postBtn = document.getElementById("postBtn");
const postsContainer = document.getElementById("postsContainer");

postBtn.addEventListener("click", () => {
    const text = postInput.value.trim();

    // Ignore empty posts silently
    if (!text) return;

    const userName = sessionStorage.getItem("teacherName") || sessionStorage.getItem("studentName") || "Unknown";

    const postHTML = `
<div class="card mb-3" data-post-id="${Date.now()}">
    <div class="card-body">
        <div class="d-flex justify-content-between">
            <h6 class="fw-bold mb-1">${userName}</h6>
            <p class="small mb-2" style="opacity:.4;">Just now</p>
        </div>
        <p class="mt-1 mb-2">${text}</p>

        <button class="btn btn-sm btn-outline-primary replyBtn">Reply</button>

        <!-- Replies Container -->
        <div class="repliesContainer mt-2"></div>
    </div>
</div>
`;
    postsContainer.insertAdjacentHTML("afterbegin", postHTML);
    postInput.value = "";
});