
const image = new Image();
image.src = "assets/restaurant.png"

const HELSINKI_BOUNDS = {
    north: 60.18465226856481,
    south: 60.14527133440431,
    west: 24.89884796729411,
    east: 24.984081906188273
  };

const mapCenter = {lat: 60.16697266828053, lng: 24.943136300431043}



async function initMap(){

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
      "marker",
    );

    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 60.16697266828053, lng: 24.943136300431043},
        disableDefaultUI: true,
        streetViewControl: false,
        zoomControl: true,
        keyboardShortcuts: false,
        restriction: {
            latLngBounds: HELSINKI_BOUNDS,
            strictBounds: false,
        },
        zoom: 16,
        mapId:"7d132948a44ae00a"
    });

    // Create the DIV to hold the control.
    const addRestaurantDiv = document.createElement("div");
    // Append the control to the DIV.
    initCenterControl(addRestaurantDiv, map);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(addRestaurantDiv);
 }

function initCenterControl(addRestaurantDiv, map) {
    const addRestaurant = createCenterControl(map);
    addRestaurantDiv.appendChild(addRestaurant);
}

function createCenterControl(map) {
    const controlButton = document.createElement("button");
  
    // Set CSS for the control.
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

    // Setup the click event listeners
    controlButton.addEventListener("click", () => {
      // Change cursor to indicate marker placement mode
      map.setOptions({ draggableCursor: 'crosshair' });

      // Add event listener for click on map to place marker
      const clickListener = map.addListener('click', (e) => {
          placeMarkerAt(e.latLng);
          // Remove the click listener after placing the marker
          google.maps.event.removeListener(clickListener);
          // Restore default cursor
          map.setOptions({ draggableCursor: null });
      });
    });

    return controlButton;
}

// Append the control to the map
function placeMarkerAt(latLng) {
    new google.maps.Marker({
        position: latLng,
        map: map
    });
}
