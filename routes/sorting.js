const router = require("express").Router();
const conn = require("../db/connection");
const { body, validationResult } = require("express-validator");
const admin = require("../middleware/admin");
const authorized = require("../middleware/authorize");
const util = require("util"); // helper 


//sorting depend on cateegory's name
router.get(
    "/categoriesName",
    authorized,
    async (req, res) => {
        try {
            // Validate request parameters (if any)

            // Query  sort by name
            const query = util.promisify(conn.query).bind(conn);
            const sql = `
                Select *
                from categories
                order by name ASC`; 
            const categories = await query(sql);

            // Check if categories were found
            if (!categories || categories.length === 0) {
                return res.status(404).json({ message: "No categories found" });
            }

            // Respond with categories sorted by name
            res.status(200).json(categories);
        }   
         catch (err) {
            console.log(err);
            res.status(500).json({ err: err });
        }
    }
);

//By task shared option (Public/Private)
router.get(
    "",authorized,
    body("availabilty")
   // .isIn([shared , private])
   // .withMessage("please enter public or private")
   ,
    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(404).json({ errors: errors.array() });
        }
        // 2- CHECK IF availabilty Exists 
        const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
        const Available = await query(`Select * from tasks where availability = ?`,
            [req.body.availability]
        );


          if (!available || available.length === 0) {
            return res.status(404).json({ message: "No tasks found with this availability" });
        }

        Available.sort((share,private) => {
            if (share.availability === 'public' && private.availability === 'private') {
                return -1;
            } else if (share.availability === 'private' && private.availability === 'public') {
                return 1;
            } else {
                return 0;
            }
        });     

          //save availabilty" in db
          const FilteringAvailabilty = {
               availabilty:req.body.availabilty,
          };
          //display searh result
          res.status(200).json(available);
        } 
         catch (err) {
            console.log(err);
            res.status(500).json({ err: err });
      }
    }
  );

  module.exports = router;