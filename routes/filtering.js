const router = require("express").Router();
const conn = require("../db/connection");
const { body, validationResult } = require("express-validator");
const admin = require("../middleware/admin");
const authorized = require("../middleware/authorize");
const util = require("util"); // helper 


//By Category Name
router.get(
    "/CategoryName",authorized,
    body("name")
    .isString()
    .withMessage("please enter a valid Category Name"),
    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        // 2- CHECK IF Category_Name Exists 
        const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
        const Category_NameExists = await query(
            `select * from  categories where name= ? or name LIKE '%${req.body.name}%' `,
            [req.body.name],
          );

          if ( !Category_NameExists[0]) {
            return res.status(424).json({  msg: " no match with this name !"});
          }
          //save search keyword in db
          const saveKeyword = {
               name:req.body.name ,
          };
          //display searh result
        res.status(200).json(Category_NameExists);
      }  catch (err) {
        console.log(err);
        res.status(500).json({ err: err });
      }
    }
  );

// Endpoint to filter tasks by availability (public or private)
router.get(
    "/available",
    authorized,
    async (req, res) => {
        const availability = req.query.availability; // Get availability from query parameter
        
        try {
            // Validate availability input
            if (!availability || !['public', 'private'].includes(availability)) {
                return res.status(400).json({ message: "Please provide valid availability ('public' or 'private')" });
            }

            // Query tasks based on availability
            const query = util.promisify(conn.query).bind(conn);
            const sql = `
                Select * From tasks where availability = ?`;

            const tasks = await query(sql, [availability]);

            // Check if tasks were found
            if (!tasks || tasks.length === 0) {
                return res.status(404).json({ message: `No this availability '${availability}'` });
            }

            // Respond with tasks found
            res.status(200).json(tasks);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);
module.exports = router;