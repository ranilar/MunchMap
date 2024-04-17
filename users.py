from db import db
from flask import session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import text

def login(username, password):
    sql = text("SELECT id, password FROM users WHERE username=:username")
    result = db.session.execute(sql, {"username":username})
    user = result.fetchone()
    if not user:
        return False
    else:
        if check_password_hash(user.password, password):
            session["user_id"] = user.id
            return True
        else:
            return False


def register(email, username, password):
    hash_value = generate_password_hash(password)
    try:
        print("here")
        sql = "INSERT INTO users (email,username,password) VALUES (:email,:username,:password)"
        print("here1")
        try:
            db.session.execute(sql, {"email":email, "username":username, "password":hash_value})
            print("here2")
            db.session.commit()
        except: print("doesnt work")   
    except:
        print("nogood")
        return False
    return login(username, password)

def user_id():
    return session.get("user_id",0)

def logout():
    del session["user_id"]