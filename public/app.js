const API = "http://localhost:4000";

let currentUser = null;

function textValue(value, fallback = "") {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return String(value);
}

function setChildren(id, children, emptyText = "") {
    const element = document.getElementById(id);
    const nodes = Array.isArray(children)
        ? children
        : [children];

    if (nodes.length === 0 && emptyText) {
        element.textContent = emptyText;
        return;
    }

    element.replaceChildren(...nodes);
}

function element(tag, options = {}, children = []) {
    const node = document.createElement(tag);

    if (options.className) {
        node.className = options.className;
    }

    if (options.style) {
        node.setAttribute("style", options.style);
    }

    if (options.href) {
        node.href = options.href;
    }

    if (options.target) {
        node.target = options.target;
    }

    if (options.id) {
        node.id = options.id;
    }

    if (options.value !== undefined) {
        node.value = String(options.value);
    }

    if (options.placeholder) {
        node.placeholder = options.placeholder;
    }

    if (options.text !== undefined) {
        node.textContent = textValue(options.text);
    }

    if (options.onClick) {
        node.addEventListener("click", options.onClick);
    }

    children.forEach(child => {
        if (typeof child === "string") {
            node.appendChild(document.createTextNode(child));
            return;
        }

        node.appendChild(child);
    });

    return node;
}

function optionNode(value, label) {
    return element("option", {
        value,
        text: label
    });
}

function line(text) {
    return element("p", {
        text
    });
}

function downloadUrl(fileId) {
    return `${API}/api/drawings/download/${encodeURIComponent(fileId)}`;
}

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

    const siteItems =
        sites.map(site =>
            line(site.site_name)
        );

    const siteOptions =
        sites.map(site =>
            optionNode(site.id, site.site_name)
        );

    setChildren("siteList", siteItems);
    setChildren("siteSelect", siteOptions);

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

    setChildren(
        "structureList",
        structures.map(item =>
            line(item.structure_name)
        )
    );

}

async function createDrawing() {

    const site_id =
    document.getElementById(
        "drawingSite"
    ).value;

    const structure_id =
    document.getElementById(
        "drawingStructure"
    ).value;

    if (!site_id || !structure_id) {
        alert("Please select Site and Structure");
        return;
    }

    const response = await fetch(
        `${API}/api/drawings/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                site_id,
                structure_id
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        alert(
            result.message ||
            result.error ||
            "Failed to create drawing"
        );
        return;
    }

    alert("Drawing Created Successfully");

    loadDrawings();

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
    ).textContent =
        `Revision Created : ${textValue(result.revision)}`;

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

    const cards = drawings.map(item => {
        const card = element("div", {
            className: "card"
        }, [
            element("h4", { text: item.drawing_name }),
            line(`Revision : ${textValue(item.revision_no)}`),
            line(`Status : ${textValue(item.approval_status)}`),
            element("button", {
                text: "Download",
                onClick: () => downloadFile(item.file_id)
            }),
            element("hr")
        ]);

        return card;
    });

    setChildren(
        "releasedList",
        cards,
        "No Released Drawings"
    );

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

    setChildren(
        "drawingSelect",
        drawings.map(drawing =>
            optionNode(drawing.id, drawing.drawing_name)
        )
    );

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

    setChildren(
        "revisionSelect",
        revisions.map(revision =>
            optionNode(revision.id, revision.revision_no)
        )
    );

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

    setChildren(
        "drawingStructure",
        structures.map(item =>
            optionNode(item.id, item.structure_name)
        )
    );

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

    setChildren(
        "drawingSite",
        sites.map(site =>
            optionNode(site.id, site.site_name)
        )
    );

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

    const table = element("table", {
        style: "width:100%"
    });

    const headerRow = element("tr", {}, [
        element("th", { text: "Revision" }),
        element("th", { text: "Status" }),
        element("th", { text: "Date" })
    ]);

    table.appendChild(headerRow);

    revisions.forEach(item => {
        table.appendChild(
            element("tr", {}, [
                element("td", { text: item.revision_no }),
                element("td", {
                    text: item.approval_status || item.status || "IN_REVIEW"
                }),
                element("td", { text: item.created_at || "-" })
            ])
        );
    });

    setChildren("revisionHistory", table);

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

    const fileNodes = files.map(file =>
        element("div", {
            style: `
                padding:10px;
                margin:10px 0;
                background:#f8fafc;
                border-left:4px solid #2563eb;
            `
        }, [
            element("strong", { text: file.file_name }),
            element("br"),
            element("br"),
            element("a", {
                href: downloadUrl(file.id),
                target: "_blank",
                text: "Download"
            })
        ])
    );

    setChildren("fileList", fileNodes, "No files found");

}

async function loadPendingApprovals() {

    const response =
        await fetch(
            `${API}/api/approvals/pending`
        );

    const approvals =
        await response.json();

    const approvalNodes = approvals.map(item =>
        element("div", {
            style: `
                background:#f8fafc;
                padding:20px;
                margin-bottom:15px;
                border-left:5px solid #2563eb;
                border-radius:8px;
            `
        }, [
            element("h3", { text: item.drawing_name }),
            line(`Revision: ${textValue(item.revision_no)}`),
            line(`Status: ${textValue(item.approval_status)}`),
            element("textarea", {
                id: `comment-${item.id}`,
                placeholder: "Comment"
            }),
            element("br"),
            element("br"),
            element("button", {
                text: "Approve",
                onClick: () => approveRevisionById(item.id)
            }),
            element("button", {
                text: "Reject",
                onClick: () => rejectRevisionById(item.id)
            })
        ])
    );

    setChildren(
        "pendingApprovals",
        approvalNodes,
        "No pending approvals"
    );

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

    const cards = [
        ["Sites", data.sites],
        ["Structures", data.structures],
        ["Drawings", data.drawings],
        ["Pending", data.pending],
        ["Released", data.released]
    ].map(([label, value]) =>
        element("div", {
            className: "card"
        }, [
            element("h3", { text: label }),
            element("h1", { text: value })
        ])
    );

    setChildren(
        "dashboardCards",
        element("div", {
            className: "cards"
        }, cards)
    );

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

    const userNodes = users.map(user =>
        element("div", {
            style: `
                padding:10px;
                margin-bottom:10px;
                border:1px solid #ddd;
                border-radius:8px;
            `
        }, [
            element("strong", { text: user.username }),
            element("br"),
            textValue(user.role),
            element("br"),
            element("br"),
            element("button", {
                text: "Delete",
                onClick: () => deleteUser(user.id)
            }),
            element("button", {
                style: "margin-left:10px;",
                text: "Reset Password",
                onClick: () => resetPassword(user.id)
            })
        ])
    );

    setChildren("userList", userNodes);

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

    const logNodes = logs.map(log =>
        element("div", {
            style: `
                padding:10px;
                margin-bottom:10px;
                border:1px solid #ddd;
                border-radius:8px;
            `
        }, [
            element("strong", { text: log.action }),
            element("br"),
            textValue(log.created_at)
        ])
    );

    setChildren("logsList", logNodes);

}

function exportLogsCSV(){

    window.open(
        `${API}/api/logs/export-csv`,
        "_blank"
    );

}

function downloadFile(fileId){

    window.open(
        downloadUrl(fileId),
        "_blank"
    );

}
