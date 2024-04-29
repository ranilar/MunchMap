CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT
);
CREATE TABLE markers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    restaurantName TEXT,
    lat TEXT,
    lng TEXT
);
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    marker_id INT REFERENCES markers(id),
    review TEXT,
    rating INT
);