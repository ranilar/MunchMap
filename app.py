from flask import Flask
from flask import render_template, redirect, session, request
from os import getenv

app = Flask(__name__)

#Front page
@app.route("/")
def index():
    return render_template("index.html")

#login
2
@app.route("/login")
def login():
    return render_template("login.html")
