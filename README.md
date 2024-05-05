# MunchMap

Tired of forgetting the great restaurants you've visited? Interested in exploring where your friends have dined? That's where MunchMap comes in! It's like social media, but with a focus on food!

## Features

- Mark and view restaurants on the map, both your own and those visited by your friends.
- Share reviews with your friends to let them know what you thought about a particular place.
- Discover dining options that match your cravings.

## CURRENT STATE OF MUNCHMAP (class final version)
Currently, MunchMap  has:
- restaurant marking, reviewing and rating
- befriending functionality

And doesn't have:
- a working profile
- a bug free version


So, the current version is still buggy and is missing features, but still has the most important ones.
Feel fre to test the features out!

## Installation

1. Clone the repository and navigate to its directory.
2. Create a ".env" file in the project directory with the following lines:

    "DATABASE_URL= "path-to-local-database-here"
    
    SECRET_KEY= "secret-key"
3. Define the database using:
    "psql < schema.sql"
4. Install the required dependencies with:
    "pip install -r requirements.txt"
5. Activate the virtual environment and run Flask:
    source venv/bin/activate
    flask run