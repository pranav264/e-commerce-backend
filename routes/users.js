const router = require('express').Router();
const { client } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Users } = require('../models');
require('dotenv').config();

router.post('/signUp', async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
  
      await client.connect();
      const user = await Users.findOne({ username: username });
  
      if (user === null) {
       const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
  
        await Users.insertOne({ username: username, password: hashPassword, cart: [] });
  
        res.status(res.statusCode).json({ message: 'Sign up successful' });
      } else {
        res.status(res.statusCode).json({ message: 'User already exists' });
      }
    } catch (error) {
      res.status(res.statusCode).json({ message: 'Please Try Again', error: error });
    } finally {
     await client.close();
    }
});


router.post('/login', async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
  
      await client.connect();
      const user = await Users.findOne({ username: username });
      if (user !== null) {
        if (bcrypt.compareSync(password, user.password)) {
          const jwt_secret_key = process.env.JWT_SECRET;
          const token = jwt.sign({ username: username }, jwt_secret_key);
  
          res
            .status(res.statusCode)
            .json({ message: 'Login successful', username: username, token: token });
        } else {
          res.status(res.statusCode).json({ message: 'Incorrect password' });
        }
      } else {
        res.status(res.statusCode).json({ message: 'Incorrect username' });
      }
    } catch (error) {
      res
        .status(res.statusCode)
        .json({ message: 'Please Try Again', error: error });
    } finally {
      await client.close();
    }
});

module.exports = router;