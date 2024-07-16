const router = require("express").Router();
const { body,validationResult } = require("express-validator");
const conn = require("../db/connection");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const util = require("util");
const { log, Console } = require("console");
const authorized = require("../middleware/authorize");
const admin= require("../middleware/admin");
const { type } = require("os");

// insert tasks [ADMIN]
router.post(
    "", admin,
    body("type")
    // .isIN([text,list])
    // .withMessage(" type should be a text oe list ")
    ,

    body("availability ")
    // .isIN([shared,private])
    // .withMessage(" availability  should be a shared or private ")
    ,
    body("category_id" )
    .isNumeric()
    .withMessage(" Enter correct category_id "),


    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
     
        // 3- PREPARE Tasks object
        const TaskObject = {
          type:req.body.type,
          availability:req.body.availability ,
          category_id: req.body. category_id,
          
        };
    // 4 - INSERT tasks INTO DB
    const query = util.promisify(conn.query).bind(conn);
    await query("insert into tasks set ? ", TaskObject );
    res.status(200).json({ms:" tasks is created successfully !"});
      } catch (err) {
        console.log(err)
        res.status(500).json(err);
      }
    }
  );

//update tasks
  router.put(
    "/:id", // params
    admin,
    body("type")
    // .isIN([text,list])
    // .withMessage(" type should be a text oe list ")
    ,

    body("availability ")
    // .isIN([shared,private])
    // .withMessage(" availability  should be a shared or private ")
    ,

    body("category_id" )
    .isNumeric()
    .withMessage(" Enter correct category_id "),
  
    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST 
        const query = util.promisify(conn.query).bind(conn);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        // 3- CHECK IF task EXISTS OR NOT
        const tasks = await query("select * from tasks where task_id = ?", [
          req.params.id,
        ]);
        if (!tasks[0]) {
          return res.status(413).json({ ms: "tasks not found !" });
        }
        // 3- PREPARE task object
        const TaskObject = {
          type :req.body.type ,
          availability:req.body.availability,
          category_id: req.body.category_id,
        };
  
        // 4- UPDATE tasks
        await query("update tasks set ? where id = ?", [TaskObject, tasks[0].id]);
  
        res.status(200).json({ms: "Taks updated successfully",});
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

    // DELETE tasks [ADMIN]
router.delete(
    "/:id", // params
    admin,
    async (req, res) => {
      try {
        // 1- CHECK IF task EXISTS OR NOT
        const query = util.promisify(conn.query).bind(conn);
        const task = await query("select * from tasks where id = ?", [
          req.params.id,
        ]);
        if (!task[0]) {
        return  res.status(413).json({ ms: "task not found !" });
        }
        // 2- REMOVE task 
        await query("delete from tasks where task_id = ?", [task[0].task_id]);
        res.status(200).json({ ms: "task delete successfully"});
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

  // LIST all tasks [ADMIN]  
  router.get("", admin , async (req, res) => {

    const query = util.promisify(conn.query).bind(conn);
    const task= await query(`select * from tasks`);
    
    res.status(200).json(task);
  });


  module.exports = router;
  