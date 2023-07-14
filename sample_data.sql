DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL DEFAULT NOW(),
    last_login_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL DEFAULT NOW(),
    read_at timestamp with time zone DEFAULT NOW()
);

INSERT INTO users (username, password, first_name, last_name, phone, join_at) VALUES

('user1', 'user1pass', 'Steven', 'Pfteven', '513-123-4567', '2001-01-01 01:01:01.111'),
('user2', 'user2pass', 'Devon', 'Pftevon', '513-234-5678', '2001-01-01 01:01:01.111');

INSERT INTO messages (from_username, to_username, body) VALUES

('user1', 'user2', 'This is a sample message 1'),
('user1', 'user2', 'This is a sample message 2'),
('user2', 'user1', 'This is a sample message 3');