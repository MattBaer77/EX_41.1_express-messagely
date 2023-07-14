
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

    const {username, password} = req.body;

    if (!username || !password) {

        throw new ExpressError("Bad request body. Must be formatted - {username, password}", 400);

    }

    try {

        const authenticatedUser = await User.authenticate(username, password)

        if (authenticatedUser) {

            const token = jwt.sign(username, SECRET_KEY);
            return res.json({message: "User Logged In", token})

        }

        throw new ExpressError("Incorrect username or password", 400)

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

    const {username, password, first_name, last_name, phone} = req.body;

    if (!username || !password || !first_name || !last_name || !phone) {

        throw new ExpressError("Bad request body. Must be formatted - {username, password, first_name, last_name, phone}", 400);

    }

    try {

        const registrant = await User.register(req.body);

        const token = jwt.sign(registrant.username, SECRET_KEY);

        return res.json({message: "User Created", token})

    } catch(e) {

        if (e.code === '23505') {
            return next(new ExpressError("Username taken. Please pick another!", 400));
        }

        return next(e)

    }

})

module.exports = router;