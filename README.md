# MunchMap
Don't remember exactly the restaraunts you've been to? Or perhaps intrested in what places your friends have eaten at?  
That's where MunchMap comes in! It's almost like a social media but with food!

Features:
- Mark and see restaurants on the map, where you or your friends have been to.
- Write a review for friends to see what you thought about the place
- Find a place to eat at that fits your stomach's needs
- Review basic information about the restaurants


CURRENT STATE OF MUNCHMAP:
I've picked up speed on the making of this web app but it is still in pretty early stages. Now, there is login, registering and adding restaurant functionability. They are pretty buggy, but it is in early stage still.
For now, you can test the registering, log in and how the map works. (Also, don't forget to read the terms ;)

INSTALLATION:
#clone and locate to repository
#create a .env file in the project directory with these lines:
- DATABASE_URL=<path-to-local-database>
- SECRET_KEY=<secret-key>
#Define database schema with: 
 - psql < schema.sql

#download requirements with:
pip install -r requirements.txt

#start venv and run flask:
source venv/bin/activate
flask run

