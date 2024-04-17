from app import app
from flask import render_template, redirect, request, session
import users

#Map / Front page
@app.route("/home")
def home():
    return render_template("front.html")

#Log in
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        
        if users.login(username, password):
            return redirect("/home")
        else: return render_template("error.html", message="Incorrect username or password")

#Log out
@app.route("/logout")
def logout():
    users.logout()
    return redirect("/")

#Register
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET": 
        return render_template("register.html")
    
    if request.method == "POST": 
        username = request.form["username"]
        email = request.form["email"]    
        password = request.form["password"]
        password2 = request.form["password2"]
        
        if password != password2:
            return render_template("error.html", message="Passwords don't match")
        if users.register(email, username, password):
            return redirect("/")
        else:
            return render_template("error.html", message="Incorrect input")


