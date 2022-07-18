-- DATABASE
-- CREATE DATABASE newsapp;

-- NEWS TABLE
CREATE TABLE news(
   newsId SERIAL PRIMARY KEY,
   title VARCHAR(255),
   headline VARCHAR(5000),
   description VARCHAR(10000),
   date VARCHAR(50),
   userId INTEGER NOT NULL,
   category VARCHAR(255),
   img VARCHAR(500)
);

-- USER TABLE
CREATE TABLE users(
   userId SERIAL PRIMARY KEY,
   profilePic VARCHAR(500),
   firstName VARCHAR(255),
   lastName VARCHAR(255),
   username VARCHAR(255),
   email VARCHAR(255),
   phone VARCHAR(20),
   address VARCHAR(500),
   password VARCHAR(500),
   isAdmin BOOLEAN NOT NULL DEFAULT FALSE
);

-- CATEGORY TABLE
CREATE TABLE category(
   categoryid SERIAL PRIMARY KEY,
   title VARCHAR(255)
);
