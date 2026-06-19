const express = require("express");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const siteRoutes = require("./routes/sites");
const structureRoutes = require("./routes/structures");
const drawingRoutes = require("./routes/drawings");
const nfaRoutes = require("./routes/nfa");
const logRoutes = require("./routes/logs");
const approvalRoutes = require("./routes/approvals");
const dashboardRoutes = require("./routes/dashboard");



const app = express();

app.use(express.json());

app.use(
  session({
    secret: "drawingsapp-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

/*
====================================
ROUTES
====================================
*/

app.use("/api/auth", authRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/structures", structureRoutes);
app.use("/api/drawings", drawingRoutes);
app.use("/api/nfa", nfaRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/dashboard", dashboardRoutes);



/*
====================================
HOME
====================================
*/

const path = require("path");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/*
====================================
SERVER
====================================
*/

app.listen(4000, () => {
  console.log("Server running on port 4000");
});