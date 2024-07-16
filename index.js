// ==================== INITIALIZE EXPRESS APP ====================
const express = require("express");
const app = express();

// ====================  GLOBAL MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // TO ACCESS URL FORM ENCODED
const cors = require("cors");
app.use(cors()); // ALLOW HTTP REQUESTS LOCAL HOSTS



 // ====================  Required Module ====================
 const auth = require("./routes/Auth");
 const categories = require("./routes/categories");
 const filtering = require("./routes/filtering");
 const sorting = require("./routes/sorting");
 const tasks = require("./routes/tasks");
 
// ====================  RUN THE APP  ====================
app.listen(23000, "localhost", () => {
    console.log("SERVER IS RUNNING ");
  });

  
 app.use("/Auth", auth);
 app.use("/categories",categories );
 app.use("/filtering",filtering );
 app.use("/sorting",sorting ); 
 app.use("/tasks",tasks );