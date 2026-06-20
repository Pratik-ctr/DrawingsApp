const db = require("./database");

// USERS
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);
`);



// SITES
db.exec(`
CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT UNIQUE NOT NULL
);
`);

// STRUCTURES
db.exec(`
CREATE TABLE IF NOT EXISTS structures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    structure_name TEXT NOT NULL,
    FOREIGN KEY(site_id) REFERENCES sites(id)
);
`);

// DRAWINGS
db.exec(`
CREATE TABLE IF NOT EXISTS drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    structure_id INTEGER NOT NULL,
    drawing_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(site_id) REFERENCES sites(id),
    FOREIGN KEY(structure_id) REFERENCES structures(id)
);
`);

// REVISIONS
db.exec(`
CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drawing_id INTEGER NOT NULL,
    revision_no TEXT NOT NULL,
    status TEXT DEFAULT 'IN_REVIEW',
    uploaded_by INTEGER,
    release_date TEXT,

    current_stage INTEGER DEFAULT 1,
    approval_status TEXT DEFAULT 'IN_REVIEW',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(drawing_id) REFERENCES drawings(id)
);
`);

// FILES
db.exec(`
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    revision_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    FOREIGN KEY(revision_id) REFERENCES revisions(id)
);
`);

// NFA
db.exec(`
CREATE TABLE IF NOT EXISTS nfa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    revision_id INTEGER NOT NULL,

    nfa_no TEXT,
    nfa_date TEXT,

    location TEXT,
    subject TEXT,

    budget_head TEXT,

    total_budget TEXT,
    previous_approved TEXT,

    proposed_approval TEXT,
    balance_amount TEXT,

    cumulative_approved TEXT,
    facility_cumulative_amount TEXT,

    description_benefits TEXT,
    recommendation TEXT,

    approved_budget_cost TEXT,

    contractor_details TEXT,

    payment_terms TEXT,
    other_resources TEXT,

    FOREIGN KEY(revision_id) REFERENCES revisions(id)
);
`);

// WORKFLOW STAGES
db.exec(`
CREATE TABLE IF NOT EXISTS workflow_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_order INTEGER,
    stage_name TEXT
);
`);

// APPROVALS
db.exec(`
CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    revision_id INTEGER,
    stage_id INTEGER,
    approver_id INTEGER,

    status TEXT,
    comment TEXT,

    approved_at TEXT,

    FOREIGN KEY(revision_id) REFERENCES revisions(id),
    FOREIGN KEY(stage_id) REFERENCES workflow_stages(id)
);
`);

// ACTIVITY LOGS
db.exec(`
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER,
    action TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// DEFAULT WORKFLOW
const workflow = db.prepare(`
INSERT INTO workflow_stages
(stage_order, stage_name)
VALUES (?, ?)
`);

const stages = [
    [1, "AGM"],
    [2, "DGM"],
    [3, "CPO"],
    [4, "Committee"],
    [5, "JMD"],
    [6, "Release"]
];

const existingStages = db.prepare(
    "SELECT COUNT(*) AS total FROM workflow_stages"
).get();

if (existingStages.total === 0) {
    for (const stage of stages) {
        workflow.run(stage[0], stage[1]);
    }
}

// DEFAULT ADMIN
const existingAdmin = db.prepare(
    "SELECT * FROM users WHERE username = ?"
).get("admin");

if (!existingAdmin) {
    db.prepare(`
        INSERT INTO users
        (name, username, password, role)
        VALUES (?, ?, ?, ?)
    `).run(
        "Admin",
        "admin",
        "admin123",
        "Admin"
    );

    logAction(
    req.session.user.id,
    `Created User ${username}`
);
}

db.prepare(`
INSERT INTO users(
    username,
    password,
    role
)
VALUES(
    'designer',
    'designer123',
    'DESIGNER'
)
`).run();

console.log("✅ Database Initialized Successfully");