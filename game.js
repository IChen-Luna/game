let map;
let userMarker;
let treasureMarker;
let currentUser = null;
const treasureLocation = { lat: 24.8015011, lng: 121.0013607 }; // 新竹市東區公道五路二段250號

// 初始化
function initApp() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    showGame();
  } else {
    document.getElementById("login-form").style.display = "block";
  }

  document.getElementById("login").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;

    currentUser = { username, treasuresFound: 0 };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showGame();
  });
}

// 顯示遊戲介面
function showGame() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  updateStats();
  initMap();
}

// 更新用戶資料
function updateStats() {
  document.getElementById("user-stats").innerText = `
    Name: ${currentUser.username}
    Treasures Found: ${currentUser.treasuresFound}
  `;
}

// 初始化地圖
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: treasureLocation,
    zoom: 18,
  });

  // 寶藏標記
  treasureMarker = new google.maps.Marker({
    position: { lat: 24.8015011, lng: 121.0013607 },
    map: map,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    },
    visible: false, // 初始隱藏
  });

  // 獲取用戶位置
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // 更新用戶位置
        if (!userMarker) {
          userMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
            title: "Your Location",
          });
          map.setCenter(userLocation);
        } else {
          userMarker.setPosition(userLocation);
        }

        // 檢查是否接近寶藏
        checkTreasureProximity(userLocation);
      },
      (error) => {
        console.error("Error retrieving location", error);
        alert("Unable to access your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// 計算兩點距離 (米)
function getDistance(point1, point2) {
  const R = 6371000; // 地球半徑 (米)
  const lat1 = point1.lat * (Math.PI / 180);
  const lat2 = point2.lat * (Math.PI / 180);
  const deltaLat = lat2 - lat1;
  const deltaLng = (point2.lng - point1.lng) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 檢查是否接近寶藏
function checkTreasureProximity(userLocation) {
  const distance = getDistance(userLocation, treasureLocation);

  if (distance < 50) {
    document.getElementById("info").innerText =
      "You are very close! Treasure found!";
    treasureMarker.setVisible(true);

    // 更新用戶資料
    if (!currentUser.treasureCollected) {
      currentUser.treasuresFound += 1;
      currentUser.treasureCollected = true;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      updateStats();
    }
  } else {
    document.getElementById("info").innerText = `Keep moving! You are ${Math.round(
      distance
    )} meters away.`;
    treasureMarker.setVisible(false);
  }
}

// 啟動應用
window.onload = initApp;
