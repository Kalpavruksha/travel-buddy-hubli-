// =======================================
// GLOBALS
// =======================================
let PLACES = [];
const API_URL = "http://127.0.0.1:5000/api/generate"; // Gemini backend


// Shortcuts
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);


// =======================================
// PAGE SWITCHING
// =======================================
function showPage(id) {
    $$(".page").forEach(p => p.classList.add("hidden"));
    $("#" + id).classList.remove("hidden");
    window.scrollTo(0, 0);
    
    // Initialize 3D view when 3D page is shown
    if (id === 'view3dPage') {
        setTimeout(initView3D, 100);
    }
}


// =======================================
// INIT APP
// =======================================
window.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    renderOverview();
    renderCategoryFilters();
    setupSearch();
});


// =======================================
// LOAD DATA.JSON
// =======================================
async function loadData() {
    try {
        const res = await fetch("data.json");
        PLACES = await res.json();
    } catch (error) {
        console.error("Error loading data:", error);
        PLACES = [];
    }
}


// =======================================
// OVERVIEW GRID
// =======================================
function renderOverview() {
    if (!PLACES || PLACES.length === 0) {
        $("#overviewGrid").innerHTML = "<p>No places data available.</p>";
        return;
    }
    
    $("#overviewGrid").innerHTML =
        PLACES.map(place => buildCard(place)).join("");
}

function buildCard(p) {
    // Use placeholder images to avoid 404 errors
    const imageSrc = p.image ? p.image : null;
    
    return `
    <div class="card" onclick="openPlaceModal(${p.id})">
        ${imageSrc ? 
          `<img src="${imageSrc}" alt="${p.name}">` :
          `<div class="card-no-image">No Image</div>`
        }
        <h3>${p.name}</h3>
        <p class="category">${p.category}</p>
        <p>${p.desc.substring(0, 100)}...</p>
    </div>
    `;
}


// =======================================
// SEARCH FUNCTION
// =======================================
function setupSearch() {
    const searchBox = $("#searchBox");
    if (searchBox) {
        searchBox.addEventListener("input", () => {
            const q = searchBox.value.toLowerCase();

            const filtered = PLACES.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.desc.toLowerCase().includes(q)
            );

            $("#overviewGrid").innerHTML =
                filtered.map(place => buildCard(place)).join("");
        });
    }
}


// =======================================
// CATEGORY FILTERS
// =======================================
function renderCategoryFilters() {
    const tabs = $("#filterTabs");
    if (!tabs) return;
    
    const categories = [...new Set(PLACES.map(p => p.category))];
    
    tabs.innerHTML = `
        <button class="tab active" onclick="filterCategory('All')">All</button>
        ${categories.map(c =>
            `<button class="tab" onclick="filterCategory('${c}')">${c}</button>`
    ).join("")}
    `;
}

function filterCategory(cat) {
    const tabsContainer = $("#filterTabs");
    if (!tabsContainer) return;
    
    $$("#filterTabs .tab").forEach(t => t.classList.remove("active"));

    const btn = [...$$("button")].find(b =>
        b.textContent === cat || (cat === "All" && b.textContent === "All"));
    if (btn) btn.classList.add("active");

    const filtered = cat === "All"
        ? PLACES
        : PLACES.filter(p => p.category === cat);

    const gridContainer = $("#overviewGridCategories");
    if (gridContainer) {
        gridContainer.innerHTML =
            filtered.map(p => buildCard(p)).join("");
    }
}


// =======================================
// MODAL
// =======================================
function openPlaceModal(id) {
    const p = PLACES.find(x => x.id === id);
    if (!p) return;

    const modalTitle = $("#modalTitle");
    const modalDesc = $("#modalDesc");
    const modalImage = $("#modalImage");
    const modalDetails = $("#modalDetails");
    const placeModal = $("#placeModal");
    
    if (modalTitle) modalTitle.textContent = p.name;
    if (modalDesc) modalDesc.textContent = p.desc;
    if (modalImage) {
        if (p.image) {
            modalImage.src = p.image;
            modalImage.alt = p.name;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }
    }

    if (modalDetails) {
        modalDetails.innerHTML = `
            <p><strong>Category:</strong> ${p.category}</p>
            <p><strong>Location:</strong> ${p.location}</p>
            <p><strong>Type:</strong> ${p.type}</p>
            <p><strong>Entry Fee:</strong> ${p.entry_fee || "Free"}</p>
        `;
    }

    if (placeModal) {
        placeModal.classList.add("open");
        setTimeout(() => loadModalMap(p), 200);
    }
}

function closePlaceModal() {
    const placeModal = $("#placeModal");
    if (placeModal) {
        placeModal.classList.remove("open");
    }
}

function loadModalMap(p) {
    const el = $("#modalMap");
    if (!el) return;

    el.innerHTML = "";

    // Check if google is available
    if (typeof google === 'undefined' || !google.maps) {
        el.innerHTML = "<p>Map loading...</p>";
        return;
    }

    try {
        const map = new google.maps.Map(el, {
            center: { lat: p.lat, lng: p.lng },
            zoom: 15,
            disableDefaultUI: true
        });

        new google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map
        });
    } catch (error) {
        console.error("Error loading modal map:", error);
        el.innerHTML = "<p>Error loading map.</p>";
    }
}


// =======================================
// MAP PAGE
// =======================================
window.initMap = function () {
    const mapContainer = $("#mapPageMap");
    if (!mapContainer) return;

    // Check if google is available
    if (typeof google === 'undefined' || !google.maps) {
        mapContainer.innerHTML = "<p>Google Maps failed to load. Please check your API key.</p>";
        return;
    }

    try {
        const map = new google.maps.Map(mapContainer, {
            center: { lat: 15.3647, lng: 75.1239 },
            zoom: 12
        });

        PLACES.forEach(p => {
            const marker = new google.maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map,
                title: p.name
            });

            const info = new google.maps.InfoWindow({
                content: `<h3>${p.name}</h3><p>${p.desc}</p>`
            });

            marker.addListener("click", () => info.open(map, marker));
        });
    } catch (error) {
        console.error("Error initializing map:", error);
        mapContainer.innerHTML = "<p>Error loading map. Please check your API key.</p>";
    }
};


// =======================================
// 3D VIEW
// =======================================
function initView3D() {
    const view3dContainer = $("#view3dContainer");
    if (!view3dContainer) return;

    // Check if A-Frame is available
    if (typeof AFRAME === 'undefined') {
        view3dContainer.innerHTML = "<p>Error loading A-Frame library. Please check your internet connection and refresh the page.</p>";
        return;
    }

    // Create A-Frame scene
    try {
        view3dContainer.innerHTML = `
            <a-scene background="color: #87CEEB">
                <!-- Camera controls -->
                <a-entity camera look-controls wasd-controls position="0 1.7 -60"></a-entity>
                
                <!-- Sky -->
                <a-sky color="#87CEEB"></a-sky>
                
                <!-- Ground/Lawn -->
                <a-plane position="0 0 0" rotation="-90 0 0" width="100" height="100" color="#7CB342"></a-plane>
                
                <!-- Side lawn patches -->
                <a-plane position="-50 0 -5" rotation="-90 0 0" width="16" height="32" color="#8BC34A"></a-plane>
                <a-plane position="50 0 -5" rotation="-90 0 0" width="16" height="32" color="#8BC34A"></a-plane>
                
                <!-- Side wings -->
                <!-- Left wing -->
                <a-box position="-28 10 13" width="12" height="20" depth="10" color="#E8E8E8"></a-box>
                <!-- Right wing -->
                <a-box position="28 10 13" width="12" height="20" depth="10" color="#E8E8E8"></a-box>
                
                <!-- Windows on wings -->
                <!-- Left wing windows -->
                <a-box position="-32 3 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-24 3 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-32 7.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-24 7.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-32 12 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-24 12 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-32 16.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="-24 16.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                
                <!-- Right wing windows -->
                <a-box position="24 3 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="32 3 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="24 7.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="32 7.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="24 12 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="32 12 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="24 16.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                <a-box position="32 16.5 8" width="2.5" height="2.5" depth="0.2" color="#4A90E2"></a-box>
                
                <!-- Central blue section -->
                <a-box position="0 14 4" width="44" height="28" depth="8" color="#1E40AF"></a-box>
                
                <!-- College name text -->
                <a-text value="A.G.M. COLLEGE OF ENGINEERING & TECHNOLOGY" position="0 22 3.5" color="#DC143C" align="center" width="20"></a-text>
                <a-text value="VARUR, HUBLI" position="0 20 3.5" color="#DC143C" align="center" width="15"></a-text>
                
                <!-- Entrance canopy with red pillars -->
                <!-- Pillars -->
                <a-box position="-11.25 5 -1" width="1.5" height="10" depth="0.2" color="#DC143C"></a-box>
                <a-box position="-5.25 5 -1" width="1.5" height="10" depth="0.2" color="#DC143C"></a-box>
                <a-box position="0.75 5 -1" width="1.5" height="10" depth="0.2" color="#DC143C"></a-box>
                <a-box position="6.75 5 -1" width="1.5" height="10" depth="0.2" color="#DC143C"></a-box>
                
                <!-- Canopy roof -->
                <a-box position="0 10.5 -1" width="30" height="1" depth="0.2" color="#E8E8E8"></a-box>
                
                <!-- Decorative domes -->
                <a-sphere position="-15 25 4" radius="2" color="#DC143C"></a-sphere>
                <a-sphere position="0 26 4" radius="2.5" color="#DC143C"></a-sphere>
                <a-sphere position="15 25 4" radius="2" color="#DC143C"></a-sphere>
                
                <!-- Trees for environment -->
                <a-cylinder position="-40 1 -10" radius="0.3" height="2" color="#4CAF50"></a-cylinder>
                <a-sphere position="-40 3 -10" radius="1.5" color="#8BC34A"></a-sphere>
                
                <a-cylinder position="40 1 -10" radius="0.3" height="2" color="#4CAF50"></a-cylinder>
                <a-sphere position="40 3 -10" radius="1.5" color="#8BC34A"></a-sphere>
                
                <a-cylinder position="-20 1 -30" radius="0.3" height="2" color="#4CAF50"></a-cylinder>
                <a-sphere position="-20 3 -30" radius="1.5" color="#8BC34A"></a-sphere>
                
                <a-cylinder position="20 1 -30" radius="0.3" height="2" color="#4CAF50"></a-cylinder>
                <a-sphere position="20 3 -30" radius="1.5" color="#8BC34A"></a-sphere>
                
                <!-- Welcome message -->
                <a-text value="Welcome to AGM College Virtual Tour" position="0 5 -50" color="#000000" align="center" width="25"></a-text>
            </a-scene>
        `;
        
        // Log success
        console.log("3D view initialized successfully");
    } catch (error) {
        console.error("Error initializing 3D view:", error);
        view3dContainer.innerHTML = "<p>Error initializing 3D view. Please refresh the page.</p>";
    }
}


// =======================================
// ITINERARY GENERATOR (AI)
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = $("#generatePlanBtn");
    if (generateBtn) {
        generateBtn.onclick = async () => {
            const daysSelect = $("#daysSelect");
            if (!daysSelect) return;
            
            const days = Number(daysSelect.value);
            const itineraryOutput = $("#itineraryOutput");
            
            if (itineraryOutput) {
                itineraryOutput.innerHTML = "⏳ Generating itinerary...";
            }

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ days })
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                if (itineraryOutput) {
                    itineraryOutput.innerHTML = `<pre>${data.result || "No itinerary generated."}</pre>`;
                }
            } catch (error) {
                console.error("Error generating itinerary:", error);
                if (itineraryOutput) {
                    itineraryOutput.innerHTML = "⚠️ Error generating itinerary. Please check if the backend server is running.";
                }
            }
        };
    }
});


// =======================================
// CHATBOT
// =======================================
async function sendMessage() {
    const userInput = $("#userInput");
    if (!userInput) return;
    
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage("user", msg);
    userInput.value = "";

    appendMessage("bot", "⏳ Thinking...");

    try {
        // First check if backend is accessible
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ chat: msg })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        updateLastBotMessage(data.result || "Sorry, I couldn't process that request.");
    } catch (error) {
        console.error("Error sending message:", error);
        updateLastBotMessage("⚠️ Error contacting AI. Please check if the backend server is running.");
    }
}

function appendMessage(sender, text) {
    const box = $("#chatbox");
    if (!box) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = sender;
    
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    messageDiv.appendChild(paragraph);
    
    box.appendChild(messageDiv);
    box.scrollTop = box.scrollHeight;
}

function updateLastBotMessage(text) {
    const box = $("#chatbox");
    if (!box) return;
    
    const msgs = box.getElementsByClassName("bot");

    if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        lastMsg.innerHTML = `<p>${text}</p>`;
        box.scrollTop = box.scrollHeight;
    }
}// update 9 - Fri Nov 28 13:22:05 IST 2025
// update 14 - Fri Nov 28 13:24:40 IST 2025
// update 24 - Fri Nov 28 13:29:48 IST 2025
// update 25 - Fri Nov 28 13:30:18 IST 2025
<- Ensured proper error handling for all external update 1 on Fri Nov 28 13:35:55 IST 2025 -->
<- Ensured proper error handling for all external update 2 on Fri Nov 28 13:36:24 IST 2025 -->
<- Ensured proper error handling for all external quick update 18 -->
