/**
 * scheduleWebApp/app/server/server.js
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const { sessionMiddleware, requireAuthForApi, requireAuthForPage } = require("./middleware/sessionAuth");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(requireAuthForPage);

app.use('/api/auth', require('./routes/auth'));
app.use(requireAuthForApi);
app.use("/api/users", require("./routes/users"));
app.use("/api/colors", require("./routes/colors"));
app.use("/api/schedules", require("./routes/schedules"));
app.use("/api/groups", require("./routes/groups"));

app.use(express.static(path.join(__dirname, "../public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
