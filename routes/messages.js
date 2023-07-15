const express = require("express");
const router = new express.Router();

const Message = require("../models/message");

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async function(req, res, next) {

    try {

        const message = await Message.get(req.params.id)

        console.log(message.from_user.username)
        console.log(message.to_user.username)
        console.log(req.user.username)

        if (message.from_user.username == req.user.username || message.to_user.username == req.user.username) {

            console.log("good")

            return res.json({message: message})
            
        } else {

            return next({ status: 401, message: "Unauthorized OOP" });

        }


    } catch(err) {
        return next (err);
    }

})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async function(req, res , next) {

    // try{

    //     from_username = req.body.from_username
    //     to_username = req.body.to_username
    //     body = req.body.body

    //     const message = await Message.create({from_username, to_username, body})

    //     return res.json({message : message})

    // } catch(err) {

    //     return next(err)

    // }

})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

module.exports = router;