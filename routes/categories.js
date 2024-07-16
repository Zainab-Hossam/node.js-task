const router = require("express").Router();
const { body,validationResult } = require("express-validator");
const conn = require("../db/connection");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const util = require("util");
const { log, Console } = require("console");
const authorized = require("../middleware/authorize");
const admin= require("../middleware/admin");


// insert categories [ADMIN]
router.post(
    "", admin,
    body("name")
    .isString()
    .withMessage(" Name should be a string "),
  
    body("user_id ")
    .isNumeric()
    .withMessage(" Enter correct id"),
  
    
    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
     
        // 3- PREPARE category object
        const categoryObject = {
          id:req.body.id,
          name :req.body.name ,
          user_id: req.body.user_id,
          
        };
    // 4 - INSERT categry INTO DB
    const query = util.promisify(conn.query).bind(conn);
    await query("insert into categories set ? ", categoryObject);
    res.status(200).json({ms:" category is created successfully !"});
      } catch (err) {
        console.log(err)
        res.status(500).json(err);
      }
    }
  );

//update category 
  router.put(
    "/:id", // params
    admin,

    body("name")
    .isString()
    .withMessage("name should be a string "),
  
    body("user_id")
    .isNumeric()
    .withMessage(" user_id should be a number"),
    
  
    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST 
        const query = util.promisify(conn.query).bind(conn);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        // 3- CHECK IF category EXISTS OR NOT
        const category = await query("select * from categories where category_id = ?", [
          req.params.id,
        ]);
        if (!category[0]) {
          return res.status(413).json({ ms: "category not found !" });
        }
        // 3- PREPARE category object
        const CategoryObject = {
          name :req.body.name ,
          user_id: req.body.user_id,
        };


  
        // 4- UPDATE category
        await query("update categories set ? where id = ?", [CategoryObject, category[0].category_id]);
  
        res.status(200).json({ms: "category updated successfully",});
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

    // DELETE category [ADMIN]
router.delete(
    "/:id", // params
    admin,
    async (req, res) => {
      try {
        // 1- CHECK IF category EXISTS OR NOT
        const query = util.promisify(conn.query).bind(conn);
        const category = await query("select * from categories where category_id = ?", [
          req.params.id,
        ]);
        if (!category[0]) {
        return  res.status(413).json({ ms: "category not found !" });
        }
        // 2- REMOVE category
        await query("delete from categories where category_id = ?", [category[0].category_id]);
        res.status(200).json({ ms: "category delete successfully"});
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

  // LIST all categories [ADMIN]  
  router.get("", admin , async (req, res) => {

    const query = util.promisify(conn.query).bind(conn);
    const categories = await query(`select * from categories`);
    
    res.status(200).json(categories);
  });

  module.exports = authorized;