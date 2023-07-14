
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {

    try {

        if (!req.body.username || !req.body.password) {

            throw new ExpressError("Bad request body. Must be formatted - {username, password}", 400)
        }

        const {username, password} = req.body

        const authenticatedUser = await User.authenticate(username, password)

        if (authenticatedUser) {

            const token = jwt.sign({username}, SECRET_KEY);
            return res.json({message: "User Logged In", token})

        } else {

            throw new ExpressError("Incorrect username or password", 400)

        }

    } catch(e){

        return next(e)

    }

})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {

    try {

        if (!req.body.username || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.phone) {

            throw new ExpressError("Bad request body. Must be formatted - {username, password, first_name, last_name, phone}", 400);
    
        }

        const {username, password, first_name, last_name, phone} = req.body;

        const registrant = await User.register(req.body);

        const token = jwt.sign({username:registrant.username}, SECRET_KEY);

        return res.json({message: "User Created", token})

    } catch(e) {

        if (e.code === '23505') {
            return next(new ExpressError("Username taken. Please pick another!", 400));
        }

        return next(e)

    }

})

module.exports = router;