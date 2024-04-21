const HELSINKI_BOUNDS = {
    north: 60.18465226856481,
    south: 60.14527133440431,
    west: 24.89884796729411,
    east: 24.984081906188273
};

const mapCenter = { lat: 60.16697266828053, lng: 24.943136300431043 };
let autocomplete;
let isFormOpen = false;

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
            <button type="submit">Submit</button>
            <button type="button" onclick="closeReviewForm()">Cancel</button>
        </form>
    `;
    formDiv.innerHTML = formContent;

    document.body.appendChild(formDiv);

    map.setOptions({ draggable: false, clickableIcons: false });

    const restaurantNameInput = document.getElementById("restaurantName");
    autocomplete = new google.maps.places.Autocomplete(
        restaurantNameInput,
        {
            types: ["establishment"],
            bounds: HELSINKI_BOUNDS,
            strictBounds: true
        });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            restaurantNameInput.value = place.name;
        }
    });
}


function closeReviewForm() {
    const formDiv = document.getElementById("reviewFormDiv");
    if (formDiv) {
        formDiv.remove();
        map.setOptions({ draggable: true, clickableIcons: true });
        isFormOpen = false;
    }
}

function submitForm(event) {
    event.preventDefault();
    const restaurantName = document.getElementById("restaurantName").value;
    const rating = document.getElementById("rating").value;
    const review = document.getElementById("review").value;

    console.log("Rating:", rating);
    console.log("Review:", review);

    closeReviewForm();
}

