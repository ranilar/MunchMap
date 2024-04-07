from flask import Flask
from flask import render_template, redirect, session, request
from os import getenv
import googlemaps

app = Flask(__name__)

#Front page
@app.route("/")
def index():
    return render_template("index.html")

#login
2
@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/map")
def maps():
    return render_template("map.html")

