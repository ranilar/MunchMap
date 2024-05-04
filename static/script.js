const HELSINKI_BOUNDS = {
    north: 60.18465226856481,
    south: 60.14527133440431,
    west: 24.89884796729411,
    east: 24.984081906188273
};

const mapCenter = { lat: 60.16697266828053, lng: 24.943136300431043 };
let autocomplete;
let isFormOpen = false;
var restaurantLocation;

async function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 60.16697266828053, lng: 24.943136300431043 },
        disableDefaultUI: true,
        streetViewControl: false,
        zoomControl: true,
        keyboardShortcuts: false,
        restriction: {
            latLngBounds: HELSINKI_BOUNDS,
            strictBounds: false,
        },
        zoom: 16,
        mapId: "7d132948a44ae00a"
    });

    fetchMarkers();

    const addRestaurantDiv = document.createElement("div");
    initCenterControl(addRestaurantDiv, map);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(addRestaurantDiv);
}

function initCenterControl(addRestaurantDiv, map) {
    const addRestaurant = createCenterControl(map);
    addRestaurantDiv.appendChild(addRestaurant);
}

function createCenterControl(map) {
    const controlButton = document.createElement("button");

    controlButton.style.display = "block";
    controlButton.style.backgroundColor = "white";
    controlButton.style.border = "3px solid black";
    controlButton.style.borderRadius = "3px";
    controlButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlButton.style.color = "black";
    controlButton.style.cursor = "pointer";
    controlButton.style.fontFamily = "Roboto, Arial, sans-serif";
    controlButton.style.fontSize = "20px";
    controlButton.style.fontWeight = "500";
    controlButton.style.lineHeight = "38px";
    controlButton.style.margin = "10px";
    controlButton.style.padding = "10px";
    controlButton.style.textAlign = "center";
    controlButton.textContent = "Add restaurant";
    controlButton.title = "Click to add restaurant";
    controlButton.type = "button";

    controlButton.addEventListener("click", () => {
        if (!isFormOpen) {
            showReviewForm(map);
            isFormOpen = true;
        }
    });
    return controlButton;
}

function showReviewForm(map) {
    const formDiv = document.createElement("div");
    formDiv.id = "reviewFormDiv";
    formDiv.style.position = "absolute";
    formDiv.style.height = "350px"
    formDiv.style.width = "350px"
    formDiv.style.top = "50%";
    formDiv.style.left = "50%";
    formDiv.style.transform = "translate(-50%, -50%)";
    formDiv.style.backgroundColor = "white";
    formDiv.style.padding = "20px";
    formDiv.style.border = "1px solid black";
    formDiv.style.zIndex = "1000";

    const formContent = `
        <h3>Add Restaurant</h3>
        <form id="restaurantForm">
            <label for="restaurantName">Restaurant Name:</label>
            <input type="text" id="restaurantName" name="restaurantName" required>
            <br>
            <label for="rating">Rating:</label>
            <input type="number" id="rating" name="rating" min="1" max="5" required>
            <br>
            <label for="review">Review:</label><br>
            <textarea id="review" name="review" rows="6" cols="50"></textarea>
            <br>
            <button type="submit" onclick="submitForm(event)">Submit</button>
            <button type="button" onclick="closeReviewForm()">Cancel</button>
        </form>
    `;
    formDiv.innerHTML = formContent;

    document.body.appendChild(formDiv);

    document.getElementById("restaurantForm").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });

    map.setOptions({ draggable: false, clickableIcons: false });

    const restaurantNameInput = document.getElementById("restaurantName");
    autocomplete = new google.maps.places.Autocomplete(
        restaurantNameInput,
        {
            types: ["restaurant"],
            bounds: HELSINKI_BOUNDS,
            strictBounds: true
        });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            restaurantNameInput.value = place.name;
            restaurantLocation = place.geometry.location;
        } 

    });
}


function closeReviewForm() {
    const formDiv = document.getElementById("reviewFormDiv");
    if (formDiv) {
        formDiv.remove();
        map.setOptions({ draggable: true, clickableIcons: true });
        isFormOpen = false;    }
}

function submitForm(event) {
    event.preventDefault();
    const restaurantName = document.getElementById("restaurantName").value;
    const rating = document.getElementById("rating").value;
    const review = document.getElementById("review").value;
    const data = {
        restaurantName,
        rating,
        review,
        restaurantLocation
    };
    fetch("/save-restaurant", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
        closeReviewForm();
        initMap();
}

function fetchMarkers() {
    let currentInfoWindow = null;
    const image = {
        url: "https://cdn-icons-png.flaticon.com/128/4668/4668400.png",
        scaledSize: new google.maps.Size(60, 60), // scaled size
    }
    fetch("/fetch-markers")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch marker data");
        }
        return response.json();
    })
    .then(data => {
        console.log(data)
        if (data.markersAndReviews.length === 0) {
            console.log("No markers found");
            return;
        }
        data.markersAndReviews.forEach(function(markerInfo) {
            const marker = new google.maps.Marker({
                position: {lat: markerInfo.lat, lng: markerInfo.lng},
                map,
                title: "Hello!",
                icon: image,
                id: markerInfo.id
            });

            marker.addListener("click", function() {
                if (currentInfoWindow) {
                    currentInfoWindow.close();
                }
                const content = `
                    <div>
                        <h1>${markerInfo.restaurantName}</h1>
                        <h3>Review</h3>
                        <p>${markerInfo.review}</p>
                        <h3>Rating</h3>
                        <p>${markerInfo.rating}</p>
                        <br>
                        <button class="removeMarkerBtn">Remove Marker</button>
                    </div>
                `;
                const infoWindow = new google.maps.InfoWindow({
                    content: content,
                });
                infoWindow.open(map, marker);
                currentInfoWindow = infoWindow;

                // Attach event listener for the "Remove Marker" button
                infoWindow.addListener('domready', () => {
                    document.querySelector('.removeMarkerBtn').addEventListener('click', function() {
                        fetch("/delete-marker", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(markerInfo.id),
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Success:", data);
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });
                        currentInfoWindow.close();
                        initMap();
                    });
                });
            });
        });
    });
}
