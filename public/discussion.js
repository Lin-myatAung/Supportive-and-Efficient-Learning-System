// // // POST NEW DISCUSSION
// // document.querySelector(".postBtn_c").addEventListener("click", async () => {
// //     const content = document.querySelector("textarea").value.trim();

// //     if (!content) return alert("Post cannot be empty!");

// //     try {
// //         const token = sessionStorage.getItem("token");

// //         const res = await fetch("http://localhost:3500/api/discussion/create", {
// //             method: "POST",
// //             headers: {
// //                 "Content-Type": "application/json",
// //                 "Authorization": `Bearer ${token}`
// //             },
// //             body: JSON.stringify({ content })
// //         });

// //         const data = await res.json();

// //         if (!res.ok) return alert(data.message || "Failed to post.");

// //         document.querySelector("textarea").value = "";
// //         loadPosts();
// //     } catch (err) {
// //         console.error(err);
// //         alert("Error posting!");
// //     }
// // });


// // // LOAD ALL POSTS
// // async function loadPosts() {
// //     try {
// //         const token = sessionStorage.getItem("token");

// //         const res = await fetch("http://localhost:3500/api/discussion/all", {
// //             headers: {
// //                 "Authorization": `Bearer ${token}`
// //             }
// //         });

// //         const data = await res.json();

// //         if (!res.ok) return console.log(data);

// //         const container = document.querySelector(".postsContainer");
// //         container.innerHTML = "";

// //         data.posts.forEach(post => {
// //             container.innerHTML += `
// //                 <div class="card mb-3">
// //                     <div class="card-body">
// //                         <div class="d-flex justify-content-between">
// //                             <h6 class="fw-bold mb-1">${post.author}</h6>
// //                             <p style="opacity: .4;" class="small mb-2">${timeAgo(post.createdAt)}</p>
// //                         </div>
// //                         <p class="mt-1 mb-0">${post.content}</p>
// //                     </div>
// //                 </div>
// //             `;
// //         });
// //     } catch (err) {
// //         console.error(err);
// //     }
// // }

// // // FORMAT TIME
// // function timeAgo(date) {
// //     const seconds = Math.floor((new Date() - new Date(date)) / 1000);
// //     const intervals = {
// //         year: 31536000,
// //         month: 2592000,
// //         week: 604800,
// //         day: 86400,
// //         hour: 3600,
// //         minute: 60
// //     };

// //     for (let unit in intervals) {
// //         const value = Math.floor(seconds / intervals[unit]);
// //         if (value > 0) {
// //             return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
// //         }
// //     }
// //     return "Just now";
// // }

// // // LOAD POSTS ON PAGE OPEN
// // loadPosts();









// // ============================
// // discussion.js
// // ============================

// // POST NEW DISCUSSION
// document.querySelector(".postBtn_c").addEventListener("click", async () => {
//     const content = document.querySelector("textarea").value.trim();
//     if (!content) return;

//     try {
//         const token = sessionStorage.getItem("token");
//         const userName = sessionStorage.getItem("name");
//         const userRole = sessionStorage.getItem("role");
//         const courseId = sessionStorage.getItem("courseId");

//         if (!token || !userName || !userRole || !courseId) {
//             return alert("Missing authentication or course info. Please log in again.");
//         }

//         const res = await fetch("http://localhost:3500/api/discussion/create", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({
//                 authorName: userName,
//                 authorRole: userRole,
//                 postText: content,
//                 courseId
//             })
//         });

//         const data = await res.json();

//         if (!res.ok) return alert(data.message || "Failed to post.");

//         document.querySelector("textarea").value = "";
//         loadPosts();
//     } catch (err) {
//         console.error(err);
//         alert("Error posting!");
//     }
// });

// // ============================
// // LOAD ALL POSTS
// // ============================
// async function loadPosts() {
//     try {
//         const token = sessionStorage.getItem("token");
//         const courseId = sessionStorage.getItem("courseId");

//         if (!token || !courseId) return;

//         const res = await fetch(`http://localhost:3500/api/discussion/all?courseId=${courseId}`, {
//             headers: { "Authorization": `Bearer ${token}` }
//         });

//         const data = await res.json();

//         if (!res.ok) return console.error(data);

//         const container = document.querySelector(".postsContainer");
//         container.innerHTML = "";

//         data.posts.forEach(post => {
//             container.innerHTML += `
//                 <div class="card mb-3">
//                     <div class="card-body">
//                         <div class="d-flex justify-content-between">
//                             <h6 class="fw-bold mb-1">${post.authorName}</h6>
//                             <p style="opacity: .4;" class="small mb-2">${timeAgo(post.createdAt)}</p>
//                         </div>
//                         <p class="mt-1 mb-0">${post.postText}</p>
//                     </div>
//                 </div>
//             `;
//         });
//     } catch (err) {
//         console.error(err);
//     }
// }

// // ============================
// // FORMAT TIME
// // ============================
// function timeAgo(date) {
//     const seconds = Math.floor((new Date() - new Date(date)) / 1000);
//     const intervals = {
//         year: 31536000,
//         month: 2592000,
//         week: 604800,
//         day: 86400,
//         hour: 3600,
//         minute: 60
//     };

//     for (let unit in intervals) {
//         const value = Math.floor(seconds / intervals[unit]);
//         if (value > 0) {
//             return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
//         }
//     }
//     return "Just now";
// }

// // ============================
// // LOAD POSTS ON PAGE OPEN
// // ============================
// loadPosts();

// // discussion.js
// const toggleDiscussionBtn = document.getElementById("toggleDiscussionBtn");
// const discussionPanel = document.getElementById("discussionPanel");
// const discussionOverlay = document.getElementById("discussionOverlay");
// const closeDiscussionPanel = document.getElementById("closeDiscussionPanel");

// function openDiscussionPanel() {
//     discussionPanel.style.display = "block";
//     discussionOverlay.style.display = "block";

//     // Small timeout to allow the browser to register display change
//     setTimeout(() => {
//         discussionPanel.classList.add("active"); // triggers transform: translateX(0)
//     }, 10);
// }

// function closeDiscussionPanelFunc() {
//     discussionPanel.classList.remove("active");
//     setTimeout(() => {
//         discussionPanel.style.display = "none";
//         discussionOverlay.style.display = "none";
//     }, 300); // match transition duration
// }


// toggleDiscussionBtn.addEventListener("click", openDiscussionPanel);
// closeDiscussionPanel.addEventListener("click", closeDiscussionPanelFunc);
// discussionOverlay.addEventListener("click", closeDiscussionPanelFunc);








(() => {
    // ============================
    // PANEL TOGGLE
    // ============================
    const toggleDiscussionBtn = document.getElementById("toggleDiscussionBtn");
    const discussionPanel = document.getElementById("discussionPanel");
    const discussionOverlay = document.getElementById("discussionOverlay");
    const closeDiscussionPanel = document.getElementById("closeDiscussionPanel");

    function openDiscussionPanel() {
        discussionPanel.style.display = "block";
        discussionOverlay.style.display = "block";
        setTimeout(() => discussionPanel.classList.add("active"), 10);
    }

    function closeDiscussionPanelFunc() {
        discussionPanel.classList.remove("active");
        setTimeout(() => {
            discussionPanel.style.display = "none";
            discussionOverlay.style.display = "none";
        }, 300);
    }

    toggleDiscussionBtn.addEventListener("click", openDiscussionPanel);
    closeDiscussionPanel.addEventListener("click", closeDiscussionPanelFunc);
    discussionOverlay.addEventListener("click", closeDiscussionPanelFunc);

    // ============================
    // POST NEW DISCUSSION
    // ============================
    const postInput = document.getElementById("postInput_c");
    const postBtn = document.getElementById("postBtn");
    const postsContainer = document.getElementById("postsContainer");

    postBtn.addEventListener("click", async () => {
        const content = postInput.value.trim();
        if (!content) return alert("Post cannot be empty!");

        const token = sessionStorage.getItem("token");
        const userName = sessionStorage.getItem("teacherName") || sessionStorage.getItem("studentName");
        const userRole = sessionStorage.getItem("role");

        if (!token || !userName || !userRole) {
            return alert("Missing authentication info. Please log in again.");
        }

        try {
            const res = await fetch("http://localhost:3500/api/discussion/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    authorName: userName,
                    authorRole: userRole,
                    postText: content
                })
            });

            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to post.");

            postInput.value = "";
            loadPosts(); // refresh posts
        } catch (err) {
            console.error(err);
            alert("Error posting!");
        }
    });

    // ============================
    // LOAD ALL POSTS
    // ============================
    async function loadPosts() {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:3500/api/discussion/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) return console.error(data);

            postsContainer.innerHTML = "";

            data.posts.forEach(post => {
                postsContainer.innerHTML += `
                    <div class="card mb-3" data-post-id="${post._id}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <h6 class="fw-bold mb-1">${post.authorName}</h6>
                                <p style="opacity: .4;" class="small mb-2">${timeAgo(post.createdAt)}</p>
                            </div>
                            <p class="mt-1 mb-0">${post.postText}</p>
                            <button class="btn btn-sm btn-danger deletePostBtn">Delete</button>
                        </div>
                    </div>
                `;
            });

            // DELETE POST
            document.querySelectorAll(".deletePostBtn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const postId = e.target.closest(".card").dataset.postId;
                    if (!postId) return;

                    if (!confirm("Are you sure you want to delete this post?")) return;

                    try {
                        const res = await fetch(`http://localhost:3500/api/discussion/${postId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (!res.ok) return alert(data.message || "Failed to delete.");

                        loadPosts(); // refresh after deletion
                    } catch (err) {
                        console.error(err);
                        alert("Error deleting post!");
                    }
                });
            });

        } catch (err) {
            console.error(err);
        }
    }

    // ============================
    // FORMAT TIME
    // ============================
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (let unit in intervals) {
            const value = Math.floor(seconds / intervals[unit]);
            if (value > 0) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
        }
        return "Just now";
    }

    // ============================
    // LOAD POSTS ON PAGE OPEN
    // ============================
    loadPosts();
})();




