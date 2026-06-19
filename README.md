# DrawingsApp

## Overview

DrawingsApp is a Drawing Management System developed using Node.js, Express.js, SQLite, HTML, CSS, and JavaScript.

The application helps organizations manage engineering drawings, revisions, approvals, file uploads, and release workflows through a role-based access control system.

---

## Features

### Authentication
- User Login
- Session Management
- Role-Based Access Control

### Dashboard
- Total Sites
- Total Structures
- Total Drawings
- Pending Approvals
- Released Drawings

### Site Management
- Create Site
- View Sites

### Structure Management
- Create Structure
- View Structures

### Drawing Management
- Create Drawings
- Create Revisions
- Revision History

### File Management
- Upload Multiple Files
- View Uploaded Files

### NFA Management
- Create NFA Records
- Store Approval Information

### Approval Workflow
- Approve Revision
- Reject Revision
- Status Tracking

### Viewer Module
- View Released Drawings

---

## User Roles

### Admin
- Full Access
- Manage Sites
- Manage Structures
- View Dashboard
- Manage Workflow

### Designer
- Create Drawings
- Create Revisions
- Upload Files
- Create NFA

### Approver
- Approve Drawings
- Reject Drawings

### Viewer
- View Released Drawings

---

## Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite

### Other Libraries
- Express Session
- Multer

---

## Project Structure

```txt
DrawingsApp
│
├── data
│   ├── database.js
│   └── initDB.js
│
├── middleware
│   └── roles.js
│
├── routes
│   ├── auth.js
│   ├── sites.js
│   ├── structures.js
│   ├── drawings.js
│   ├── approvals.js
│   └── dashboard.js
│
├── public
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── package.json
├── server.js
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Move Into Project

```bash
cd DrawingsApp
```

### Install Dependencies

```bash
npm install
```

### Start Server

```bash
node server.js
```

### Open Browser

```txt
http://localhost:4000
```

---

## Workflow

```txt
Site
↓
Structure
↓
Drawing
↓
Revision
↓
File Upload
↓
NFA
↓
Approval
↓
Released Drawing
```

---

## Future Enhancements

- Activity Logs
- Email Notifications
- PDF Generation
- Workflow Configuration
- Advanced Search
- User Management Panel

---

## Developed By

Pratik Patil

B.Tech Computer Science & Engineering