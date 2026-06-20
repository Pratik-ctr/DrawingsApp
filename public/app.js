const API = "http://localhost:4000";

let currentUser = null;

async function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        `${API}/api/auth/login`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        }
    );

    const data = await response.json();

    if (data.success) {

        currentUser = data.user;

        document.getElementById(
            "loginPage"
        ).style.display = "none";

        document.getElementById(
            "dashboardPage"
        ).style.display = "flex";

        loadDashboard();
        loadSites();
        loadDrawingSites();
        loadDrawings();

        applyRoleAccess();
        if (
            currentUser.role ===
            "ADMIN"
        ) {
            loadUsers();
            loadLogs();
        }



    }
    else {

        alert("Invalid Login");

    }

}



function logout() {

    location.reload();

}

function applyRoleAccess() {

    if (!currentUser) {
        return;
    }

    const role = currentUser.role;

    // ADMIN
    if (role === "ADMIN") {
        return;
    }

    // DESIGNER
    if (role === "DESIGNER") {

        document.getElementById("menuDashboard").style.display = "none";
        document.getElementById("menuSites").style.display = "none";
        document.getElementById("menuStructures").style.display = "none";
        document.getElementById("menuApprovals").style.display = "none";
        document.getElementById("menuUsers").style.display = "none";
        document.getElementById("menuLogs").style.display = "none";

        showSection("drawings");
    }

    // APPROVER
    if (role === "APPROVER") {

        document.getElementById("menuDashboard").style.display = "none";
        document.getElementById("menuSites").style.display = "none";
        document.getElementById("menuStructures").style.display = "none";
        document.getElementById("menuDrawings").style.display = "none";
        document.getElementById("menuNFA").style.display = "none";
        document.getElementById("menuUsers").style.display = "none";
        document.getElementById("menuLogs").style.display = "none";

        showSection("approvals");
    }

    // VIEWER
    if (role === "VIEWER") {

        document.getElementById("menuDashboard").style.display = "none";
        document.getElementById("menuSites").style.display = "none";
        document.getElementById("menuStructures").style.display = "none";
        document.getElementById("menuDrawings").style.display = "none";
        document.getElementById("menuNFA").style.display = "none";
        document.getElementById("menuApprovals").style.display = "none";
        document.getElementById("menuUsers").style.display = "none";
        document.getElementById("menuLogs").style.display = "none";
        showSection("viewer");

    }

}

function showSection(id) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.style.display = "none";

        });

    document.getElementById(
        id
    ).style.display = "block";

}

async function addSite() {

    const site_name =
        document.getElementById(
            "siteName"
        ).value;

    await fetch(
        `${API}/api/sites`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                site_name
            })
        }
    );

    loadSites();

}

async function loadSites() {

    const response =
        await fetch(
            `${API}/api/sites`
        );

    const result =
        await response.json();

    const sites =
        Array.isArray(result.data)
            ? result.data
            : [];

    let html = "";

    let options = "";

    sites.forEach(site => {

        html += `
        <p>${site.site_name}</p>
        `;

        options += `
        <option value="${site.id}">
            ${site.site_name}
        </option>
        `;

    });

    document.getElementById(
        "siteList"
    ).innerHTML = html;

    document.getElementById(
        "siteSelect"
    ).innerHTML = options;

}

async function addStructure() {

    const site_id =
        document.getElementById(
            "siteSelect"
        ).value;

    const structure_name =
        document.getElementById(
            "structureName"
        ).value;

    await fetch(
        `${API}/api/structures`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                site_id,
                structure_name
            })
        }
    );

    loadStructures();

}

async function loadStructures() {

    const site_id =
        document.getElementById(
            "siteSelect"
        ).value;

    const response =
        await fetch(
            `${API}/api/structures/${site_id}`
        );

    const result =
        await response.json();

    const structures =
        Array.isArray(result)
            ? result
            : Array.isArray(result.data)
                ? result.data
                : [];

    let html = "";

    structures.forEach(item => {

        html += `
        <p>${item.structure_name}</p>
        `;

    });

    document.getElementById(
        "structureList"
    ).innerHTML = html;

}

async function createDrawing() {
    const site_id = document.getElementById("drawingSiteId").value;
    const structure_id = document.getElementById("drawingStructureId").value;

    if (!site_id || !structure_id) {
        alert("Please enter both Site ID and Structure ID");
        return;
    }

    const response = await fetch(`${API}/api/drawings/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            site_id,
            structure_id
        })
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message || result.error || "Failed to create drawing");
        return;
    }

    alert(result.message || "Drawing Created");
}

async function createRevision() {

    const drawing_id =
        document.getElementById(
            "drawingSelect"
        ).value;

    if (!drawing_id) {
        alert("Please select a drawing");
        return;
    }

    const response =
        await fetch(
            `${API}/api/drawings/revision`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    drawing_id
                })
            }
        );

    const result =
        await response.json();

    document.getElementById(
        "revisionResult"
    ).innerHTML =
        `Revision Created : ${result.revision}`;

    loadRevisions();
    loadRevisionHistory();

}

async function uploadFiles() {

    const revision_id =
        document.getElementById(
            "revisionSelect"
        ).value;

    const files =
        document.getElementById(
            "drawingFiles"
        ).files;

    if (!revision_id) {
        alert("Please select a Revision");
        return;
    }

    if (files.length === 0) {
        alert("Please choose at least one file");
        return;
    }

    const formData = new FormData();

    formData.append(
        "revision_id",
        revision_id
    );

    for (let i = 0; i < files.length; i++) {

        formData.append(
            "files",
            files[i]
        );

    }

    const response = await fetch(
        `${API}/api/drawings/upload-files`,
        {
            method: "POST",
            body: formData
        }
    );

    const result =
        await response.json();

    alert(
        `${result.uploaded} files uploaded successfully`
    );

    loadFiles();
}

async function saveNFA() {
    const payload = {
        revision_id: document.getElementById("nfaRevisionId").value,
        nfa_no: document.getElementById("nfaNo").value,
        nfa_date: document.getElementById("nfaDate").value,
        location: document.getElementById("location").value,
        subject: document.getElementById("subject").value,
        budget_head: document.getElementById("budgetHead").value,
        recommendation: document.getElementById("recommendation").value
    };

    const response = await fetch(`${API}/api/nfa`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message || result.error || "Failed to save NFA");
        return;
    }

    alert(result.message || "NFA Saved");
}

async function approveRevision() {
    const response = await fetch(`${API}/api/approvals/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            revision_id: document.getElementById("approveRevisionId").value,
            stage_id: document.getElementById("approveStageId").value,
            approver_id: document.getElementById("approverId").value,
            comment: document.getElementById("approvalComment").value
        })
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message || result.error || "Failed to approve revision");
        return;
    }

    alert(result.message || "Revision Approved");
}

async function rejectRevision() {
    const response = await fetch(`${API}/api/approvals/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            revision_id: document.getElementById("approveRevisionId").value,
            stage_id: document.getElementById("approveStageId").value,
            approver_id: document.getElementById("approverId").value,
            comment: document.getElementById("approvalComment").value
        })
    });

    const result = await response.json();

    if (!response.ok) {
        alert(result.message || result.error || "Failed to reject revision");
        return;
    }

    alert(result.message || "Revision Rejected");
}

async function loadReleasedDrawings() {

    const response =
        await fetch(
            `${API}/api/drawings/released`
        );

    const result =
        await response.json();

    const drawings =
        Array.isArray(result)
            ? result
            : Array.isArray(result.data)
                ? result.data
                : [];

    let html = "";

    drawings.forEach(item => {

        html += `
        <div style="
            background:#f8fafc;
            padding:15px;
            margin-bottom:10px;
            border-left:5px solid green;
            border-radius:8px;
        ">

            <h3>
                ${item.drawing_name || "Unnamed Drawing"}
            </h3>

            <p>
                Revision :
                ${item.revision_no || "-"}
            </p>

            <p>
                Released :
                ${item.release_date || "-"}
            </p>

            <p>
                Status :
                ${item.approval_status || "RELEASED"}
            </p>

        </div>
        `;

    });

    document.getElementById(
        "releasedList"
    ).innerHTML =
        html || "<p>No Released Drawings</p>";

}

async function loadDrawings() {

    const response =
        await fetch(
            `${API}/api/drawings`
        );

    const result =
        await response.json();

    const drawings =
        Array.isArray(result)
            ? result
            : Array.isArray(result.data)
                ? result.data
                : [];

    let options = "";

    drawings.forEach(drawing => {

        options += `
        <option value="${drawing.id}">
            ${drawing.drawing_name}
        </option>
        `;

    });

    document.getElementById(
        "drawingSelect"
    ).innerHTML = options;

}

async function loadRevisions() {

    const drawing_id =
        document.getElementById(
            "drawingSelect"
        ).value;

    if (!drawing_id) {
        return;
    }

    const response =
        await fetch(
            `${API}/api/drawings/revisions/${drawing_id}`
        );

    const result =
        await response.json();

    const revisions =
        Array.isArray(result)
            ? result
            : Array.isArray(result.data)
                ? result.data
                : [];

    let options = "";

    revisions.forEach(revision => {

        options += `
        <option value="${revision.id}">
            ${revision.revision_no}
        </option>
        `;

    });

    document.getElementById(
        "revisionSelect"
    ).innerHTML = options;

}

async function loadDrawingStructures() {

    const site_id =
        document.getElementById(
            "drawingSite"
        ).value;

    const response =
        await fetch(
            `${API}/api/structures/${site_id}`
        );

    const result =
        await response.json();

    const structures =
        Array.isArray(result)
            ? result
            : result.data || [];

    let options = "";

    structures.forEach(item => {

        options += `
        <option value="${item.id}">
            ${item.structure_name}
        </option>
        `;

    });

    document.getElementById(
        "drawingStructure"
    ).innerHTML = options;

}

async function loadDrawingSites() {

    const response =
        await fetch(
            `${API}/api/sites`
        );

    const result =
        await response.json();

    const sites =
        Array.isArray(result)
            ? result
            : result.data || [];

    let options = "";

    sites.forEach(site => {

        options += `
        <option value="${site.id}">
            ${site.site_name}
        </option>
        `;

    });

    document.getElementById(
        "drawingSite"
    ).innerHTML = options;

    loadDrawingStructures();

}

async function loadRevisionHistory() {

    const drawing_id =
        document.getElementById(
            "drawingSelect"
        ).value;

    if (!drawing_id) {
        return;
    }

    const response =
        await fetch(
            `${API}/api/drawings/history/${drawing_id}`
        );

    const revisions =
        await response.json();

    let html = `
        <table style="width:100%">
            <tr>
                <th>Revision</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
    `;

    revisions.forEach(item => {

        html += `
        <tr>
            <td>${item.revision_no}</td>
            <td>${item.approval_status || item.status || 'IN_REVIEW'}</td>
            <td>${item.created_at || '-'}</td>
        </tr>
        `;

    });

    html += `</table>`;

    document.getElementById(
        "revisionHistory"
    ).innerHTML = html;

}

async function loadFiles() {

    const revision_id =
        document.getElementById(
            "revisionSelect"
        ).value;

    if (!revision_id) {
        return;
    }

    const response =
        await fetch(
            `${API}/api/drawings/files/${revision_id}`
        );

    const result =
        await response.json();

    const files =
        Array.isArray(result)
            ? result
            : result.data || [];

    let html = "";

    files.forEach(file => {

        html += `
        <div style="
            padding:10px;
            margin:10px 0;
            background:#f8fafc;
            border-left:4px solid #2563eb;
        ">
            <div style="
padding:10px;
margin:10px 0;
background:#f8fafc;
border-left:4px solid #2563eb;
">

<strong>${file.file_name}</strong>

<br><br>

<a
href="${API}/api/drawings/download/${file.id}"
target="_blank">

Download

</a>

</div>
        </div>
        `;

    });

    document.getElementById(
        "fileList"
    ).innerHTML =
        html || "No files found";

}

async function loadPendingApprovals() {

    const response =
        await fetch(
            `${API}/api/approvals/pending`
        );

    const approvals =
        await response.json();

    let html = "";

    approvals.forEach(item => {

        html += `
        <div style="
            background:#f8fafc;
            padding:20px;
            margin-bottom:15px;
            border-left:5px solid #2563eb;
            border-radius:8px;
        ">

            <h3>${item.drawing_name}</h3>

            <p>
                Revision:
                ${item.revision_no}
            </p>

            <p>
                Status:
                ${item.approval_status}
            </p>

            <textarea
                id="comment-${item.id}"
                placeholder="Comment">
            </textarea>

            <br><br>

            <button
            onclick="approveRevisionById(${item.id})">
                Approve
            </button>

            <button
            onclick="rejectRevisionById(${item.id})">
                Reject
            </button>

        </div>
        `;

    });

    document.getElementById(
        "pendingApprovals"
    ).innerHTML =
        html || "No pending approvals";

}

async function approveRevisionById(
    revision_id
) {

    const comment =
        document.getElementById(
            `comment-${revision_id}`
        ).value;

    const response =
        await fetch(
            `${API}/api/approvals/approve`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    revision_id,
                    stage_id: 1,
                    approver_id: currentUser.id,
                    comment
                })
            }
        );

    const result =
        await response.json();

    alert(
        result.message ||
        "Approved"
    );

    loadPendingApprovals();

}

async function rejectRevisionById(
    revision_id
) {

    const comment =
        document.getElementById(
            `comment-${revision_id}`
        ).value;

    const response =
        await fetch(
            `${API}/api/approvals/reject`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    revision_id,
                    stage_id: 1,
                    approver_id: 1,
                    comment
                })
            }
        );

    const result =
        await response.json();

    alert(
        result.message ||
        "Rejected"
    );

    loadPendingApprovals();

}

async function loadDashboard() {

    const response =
        await fetch(
            `${API}/api/dashboard`
        );

    const data =
        await response.json();

    document.getElementById(
        "dashboardCards"
    ).innerHTML = `

    <div class="cards">

        <div class="card">
            <h3>Sites</h3>
            <h1>${data.sites}</h1>
        </div>

        <div class="card">
            <h3>Structures</h3>
            <h1>${data.structures}</h1>
        </div>

        <div class="card">
            <h3>Drawings</h3>
            <h1>${data.drawings}</h1>
        </div>

        <div class="card">
            <h3>Pending</h3>
            <h1>${data.pending}</h1>
        </div>

        <div class="card">
            <h3>Released</h3>
            <h1>${data.released}</h1>
        </div>

    </div>

    `;

}

async function createUser() {

    const username =
        document.getElementById(
            "newUsername"
        ).value;

    const password =
        document.getElementById(
            "newPassword"
        ).value;

    const role =
        document.getElementById(
            "newRole"
        ).value;

    const response = await fetch(
        `${API}/api/users/create`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password,
                role
            })
        }
    );

    const result =
        await response.json();

    alert("User Created");

    loadUsers();

}

async function loadUsers() {

    const response =
        await fetch(
            `${API}/api/users`
        );

    const result =
        await response.json();

    const users =
        Array.isArray(result)
            ? result
            : [];

    let html = "";

    users.forEach(user => {

        html += `
    <div style="
        padding:10px;
        margin-bottom:10px;
        border:1px solid #ddd;
        border-radius:8px;
    ">

        <strong>
        ${user.username}
        </strong>

        <br>

        ${user.role}

        <br><br>

        <button
        onclick="deleteUser(${user.id})">
            Delete
        </button>

        <button
        onclick="resetPassword(${user.id})"
        style="margin-left:10px;">
            Reset Password
        </button>

    </div>
    `;

    });

    document.getElementById(
        "userList"
    ).innerHTML = html;

}

async function deleteUser(id) {

    const ok =
        confirm(
            "Delete this user?"
        );

    if (!ok) {
        return;
    }

    await fetch(
        `${API}/api/users/${id}`,
        {
            method: "DELETE"
        }
    );

    loadUsers();

}

async function resetPassword(id) {

    const password =
        prompt(
            "Enter New Password"
        );

    if (!password) {
        return;
    }

    const response =
        await fetch(
            `${API}/api/users/reset-password`,
            {
                method: "PUT",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    id,
                    password
                })
            }
        );

    const result =
        await response.json();

    alert(
        result.message
    );

}

async function loadLogs() {

    const response =
        await fetch(
            `${API}/api/logs`
        );

    const logs =
        await response.json();

    let html = "";

    logs.forEach(log => {

        html += `
        <div style="
            padding:10px;
            margin-bottom:10px;
            border:1px solid #ddd;
            border-radius:8px;
        ">

            <strong>
                ${log.action}
            </strong>

            <br>

            ${log.created_at}

        </div>
        `;

    });

    document.getElementById(
        "logsList"
    ).innerHTML = html;

}

function exportLogsCSV(){

    window.open(
        `${API}/api/logs/export-csv`,
        "_blank"
    );

}