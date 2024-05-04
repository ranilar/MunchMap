CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT
);
CREATE TABLE markers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    restaurantName TEXT,
    lat TEXT,
    lng TEXT
);
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    marker_id INT REFERENCES markers(id) ON DELETE CASCADE,
    review TEXT,
    rating INT
);
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_1 INT REFERENCES users(id) ON DELETE CASCADE,
    user_2 INT REFERENCES users(id) ON DELETE CASCADE
);