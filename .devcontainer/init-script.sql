CREATE DATABASE IF NOT EXISTS tutorial;
USE tutorial;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS posts (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS likes (
  id INT NOT NULL AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
INSERT INTO users (name, email) VALUES ('Paul', 'paul@example.com');
INSERT INTO users (name, email) VALUES ('Mary', 'mary@example.com');

INSERT INTO posts (title, body, user_id) VALUES ('John\'s Post', 'This is John\'s post', 1);
INSERT INTO posts (title, body, user_id) VALUES ('Paul\'s Post', 'This is Paul\'s post', 2);
INSERT INTO posts (title, body, user_id) VALUES ('Mary\'s Post', 'This is Mary\'s post', 3);
INSERT INTO posts (title, body, user_id) VALUES ('John\'s Second Post', 'This is John\'s second post', 1);

INSERT INTO likes (post_id, user_id) VALUES (1, 2);
INSERT INTO likes (post_id, user_id) VALUES (2, 1);
INSERT INTO likes (post_id, user_id) VALUES (3, 2);
INSERT INTO likes (post_id, user_id) VALUES (4, 3);