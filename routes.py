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
        
#Profile page
@app.route("/profile/<int:id>")
def profile(id):
    allow = False
    if users.user_id() == id:
        allow = True
    elif users.user_id():
        sql = text("SELECT * FROM friends WHERE user_1=:user1 AND user_2=:user2")
        result = db.session.execute(sql, {"user1":users.user_id(), "user2":id})
        if result.fetchone():
            allow = True
    if not allow:
        return render_template("error.html", error="Not validated to see page")
    return render_template("profile.html")

#MARKERS AND RESTAURANTS

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

    insert_marker_sql = text("INSERT INTO markers (user_id, restaurantName, lat, lng) VALUES (:user_id, :restaurantName, :lat, :lng) RETURNING id")
    marker_result = db.session.execute(insert_marker_sql, {"user_id":userid, "restaurantName": rname, "lat":lat, "lng":lng})
    marker_id = marker_result.fetchone()[0]

    insert_review_sql = text("INSERT INTO reviews (user_id, marker_id, review, rating) VALUES (:user_id, :marker_id, :review, :rating)")
    db.session.execute(insert_review_sql, {"user_id":userid, "marker_id":marker_id, "review":review, "rating":rating})

    db.session.commit()

    return jsonify({"message": "Restaurant data saved successfully"})

#Fetch marker data to front
@app.route("/fetch-markers", methods=["GET"])
def fetch_markers():
    user_id = users.user_id()
    sql_markers = text("SELECT m.lat, m.lng, m.id, m.restaurantName, r.review, r.rating FROM markers m LEFT JOIN reviews r ON r.marker_id = m.id WHERE m.user_id=:user_id;")
    markers_result = db.session.execute(sql_markers, {"user_id": user_id})
    markers_and_reviews = markers_result.fetchall()
    if not markers_and_reviews:
        return jsonify({"message": "Couldn't find marker data"})

    combined_data = [{
        "lat": float(marker[0]),
        "lng": float(marker[1]),
        "id": marker[2],
        "restaurantName": marker[3],
        "review": marker[4],
        "rating": marker[5]
    } for marker in markers_and_reviews]
    return jsonify({"markersAndReviews": combined_data})

#Delete a marker
@app.route("/delete-marker", methods=["POST"])
def delete_marker():
    try:
        data = request.json
        sql = text("DELETE FROM markers WHERE id=:markerid")
        db.session.execute(sql,{"markerid": data})
        db.session.commit()
        return jsonify({"message": "marker deleted"})
    except: return  jsonify({"message": "couldn't delete marker"})

#FRIEND REQUESTS 

#Send friend request
@app.route("/send-friend-request", methods=["POST"])
def send_friend_request():
    userid = users.user_id()  
    data = request.json
    username = data["username"]
    
    sql = text("SELECT id FROM users WHERE username=:username;")
    result = db.session.execute(sql, {"username": username})
    receiver_id = result.fetchone()
    if not receiver_id:
        return jsonify({"error": "User not found"})
    
    sql = text("SELECT * FROM friendRequest WHERE receiver_id=:receiver_id AND sender_id=:sender_id;")
    result = db.session.execute(sql, {"receiver_id": receiver_id[0], "sender_id": userid})
    x = result.fetchone()
    if x:
        return jsonify({"error": "Friend request already sent"})

    sql = text("INSERT INTO friendRequest (sender_id, receiver_id, status) VALUES (:sender_id, :receiver_id, :status)")
    db.session.execute(sql, {"sender_id": userid, "receiver_id": receiver_id[0], "status": "pending"})
    db.session.commit()
    return jsonify({"success": "Friend request sent"})

#Get received friend requests
@app.route("/get-received-requests")
def get_received_requests():
    current_user_id = users.user_id()
    sql = text("SELECT f.sender_id, u.username FROM friendRequest f LEFT JOIN users u ON f.status=:status AND u.id=f.sender_id AND f.receiver_id=:receiver_id")
    result = db.session.execute(sql, {"status": "pending", "receiver_id": current_user_id})
    requests = result.fetchall()
    
    request_data = [{
        "sender_id": request[0],
        "sender_username": request[1],
    } for request in requests]
    return jsonify({"request_data": request_data})

#Update status of friend request
@app.route("/accept-reject-request", methods=["POST"])
def accept_reject_request():
    current_user_id = users.user_id()
    
    request_data = request.get_json()
    sender_username = request_data.get("sender_username")
    sql = text("SELECT id FROM users WHERE username=:username")
    result = db.session.execute(sql, {"username": sender_username})
    sender_id = result.fetchone()
    sender_id = sender_id[0]
    status = request_data.get("status")
    
    
    if status == "accepted":
        sql = text ("INSERT INTO friends (user_1, user_2) VALUES (:user_1, :user_2)")
        db.session.execute(sql, {"user_1": sender_id, "user_2": current_user_id})
        db.session.commit()
        sql = text("UPDATE friendRequest SET status=:status WHERE sender_id=:sender_id AND receiver_id=:receiver_id")
        db.session.execute(sql, {"status": "accepted", "sender_id": sender_id, "receiver_id": current_user_id})
        db.session.commit()
        
    if status == "rejected":
        sql = text("UPDATE friendRequest SET status=:status WHERE sender_id=:sender_id AND receiver_id=:receiver_id")
        db.session.execute(sql, {"status": "rejected", "sender_id": sender_id, "receiver_id": current_user_id})
        db.session.commit()

    return jsonify({"message": "Friend request accepted"})

#Get user friends to display on front
@app.route("/get-friends", methods=["GET"])
def get_friends():
    userid = users.user_id()
    if not userid:
        return jsonify({"message": "User not authenticated"})
    
    friendlist = []
    
    sql_friends = text("SELECT u.username, u.id FROM users u JOIN friends f ON u.id = f.user_2 WHERE f.user_1 = :user_id;")
    result = db.session.execute(sql_friends, {"user_id": userid})
    friends = result.fetchall()
    
    sql_friends = text("SELECT u.username, u.id FROM users u JOIN friends f ON u.id = f.user_1 WHERE f.user_2 = :user_id;")
    result = db.session.execute(sql_friends, {"user_id": userid})
    friends2 = result.fetchall()
    
    if not friends and not friends2:
        return jsonify({"message": "No friends found"})
    
    if friends:
        for friend in friends:
            if (friend[0], friend[1]) not in friendlist:
                friendlist.append((friend[0], friend[1]))
    
    if friends2:
        for friend in friends2:
            if (friend[0], friend[1]) not in friendlist:
                friendlist.append((friend[0], friend[1]))

    friendlist = [{
        "username": friend[0],
        "id": friend[1],
    } for friend in friendlist]
    print(friendlist)
    return jsonify({"friends": friendlist})



