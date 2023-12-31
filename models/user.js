/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt")

const {BCRYPT_WORK_FACTOR, SECRET_KEY} = require("../config");
// const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth")

/** User of the site. */

class User {

  /** Constructs a new User
   * 
  */

  constructor({username, first_name, last_name, phone, join_at, last_login_at}) {

    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    this.join_at = join_at;
    this.last_login_at = last_login_at;

  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {

    const timeStamp = new Date
    const join_at = timeStamp
    const last_login_at = join_at;
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone, join_at, last_login_at]);
    
    return results.rows[0]

  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const results = await db.query(
      `SELECT username, password 
       FROM users
       WHERE username = $1`,
      [username]);

    if (results.rows.length === 0) {

      throw new ExpressError("Incorrect username or password", 400)

    }

    const user = results.rows[0];

    const resp = bcrypt.compare(password, user.password)

    return resp

  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const timeStamp = new Date

    await db.query(
      `UPDATE users SET last_login_at = $2
      WHERE username = $1`,
      [username, timeStamp]
      )

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {

    const result = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users;`
    )

    if (!result.rows[0]) {
      throw new ExpressError(`No users`, 404)
    }

    return result.rows;

  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const result = await db.query(

      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1;`,
      [username]

    );

    // console.log(result.rows[0])

    const user = new User(result.rows[0]);

    if (!user) {
      throw new ExpressError(`No user with username: ${username}`, 404);
    }

    return(user);

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const results = await db.query(
      `SELECT m.id, m.to_username, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
      FROM messages as m
      JOIN users as u
      ON m.to_username = u.username
      WHERE from_username = $1;`,
      [username]
    )

    const resultsSorted = results.rows.map(r => {
      return { id: r.id, to_user: {username: r.username, first_name: r.first_name, last_name: r.last_name, phone: r.phone}, body: r.body, sent_at: r.sent_at, read_at: r.read_at }
    })

    return resultsSorted

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const results = await db.query(
      `SELECT m.id, m.from_username, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
      FROM messages as m
      JOIN users as u
      ON m.from_username = u.username
      WHERE to_username = $1;`,
      [username]
    )

    const resultsSorted = results.rows.map(r => {
      return { id: r.id, from_user: {username: r.username, first_name: r.first_name, last_name: r.last_name, phone: r.phone}, body: r.body, sent_at: r.sent_at, read_at: r.read_at }
    })

    return resultsSorted

  }
}


module.exports = User;