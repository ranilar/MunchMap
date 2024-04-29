from app import app
from flask import render_template, redirect, request, jsonify
from sqlalchemy import text
import users
from db import db

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
        
#Save restaurant and review data to database
@app.route("/save-restaurant", methods=["POST"])
def save_restaurant():
    data = request.json
    rname = data["restaurantName"]
    rating = data["rating"]
    review = data["review"]
    location = data["restaurantLocation"]
    lat = location["lat"]
    lng = location["lng"]
    userid = users.user_id()
    print(userid)

    # Insert into markers table and get the inserted marker_id
    insert_marker_sql = text("INSERT INTO markers (user_id, restaurantName, lat, lng) VALUES (:user_id, :restaurantName, :lat, :lng) RETURNING id")
    marker_result = db.session.execute(insert_marker_sql, {"user_id":userid, "restaurantName": rname, "lat":lat, "lng":lng})
    marker_id = marker_result.fetchone()[0]

    # Insert into reviews table
    insert_review_sql = text("INSERT INTO reviews (user_id, marker_id, review, rating) VALUES (:user_id, :marker_id, :review, :rating)")
    db.session.execute(insert_review_sql, {"user_id":userid, "marker_id":marker_id, "review":review, "rating":rating})

    db.session.commit()

    return jsonify({"message": "Restaurant data saved successfully"})


#Fetch markers to script.js to display on the map
@app.route("/fetch-markers", methods=["GET"])
def fetch_markers():
    user_id = users.user_id()  
    sql = text("SELECT lat, lng FROM markers WHERE user_id=:user_id;")
    result = db.session.execute(sql, {"user_id": user_id})
    markers = result.fetchall()
    
    if not markers:
        return jsonify({"message": "Couldn't find marker data"})
    
    marker_list = [(float(marker.lat),float(marker.lng)) for marker in markers]
    return jsonify({"markers": marker_list})
