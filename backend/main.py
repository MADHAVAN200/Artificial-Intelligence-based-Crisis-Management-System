import random
import base64
from io import BytesIO
import numpy as np
from datetime import datetime, timedelta
import re
import nltk
from nltk.corpus import stopwords
import networkx as nx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict, Any
from PIL import Image, ImageDraw

# Initialize NLTK
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except Exception as e:
    print(f"Warning: NLTK download failed: {e}")

app = FastAPI(title="Crisis Management System API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Structures ---

class SatelliteRequest(BaseModel):
    source: str
    date: Optional[str] = None
    location: str

class DamageRequest(BaseModel):
    image: str # Base64 encoded image
    scenario: str

class RouteRequest(BaseModel):
    scenario: str

class EvacuationRequest(BaseModel):
    user_lat: float
    user_lon: float
    scenario: str

# --- Core Logic & Simulation ---

# Global Data (Simulated)
random.seed(42)

def fetch_cap_alerts(scenario):
    """Fetch Common Alerting Protocol (CAP) simulated alerts"""
    simulated_alerts = [
        {
            "identifier": "CAP-1234567890",
            "sender": "NDMA.GOV.IN",
            "sent": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+05:30"),
            "status": "Actual",
            "msgType": "Alert",
            "scope": "Public",
            "info": {
                "category": "Met",
                "event": "Flood",
                "urgency": "Immediate",
                "severity": "Severe",
                "certainty": "Observed",
                "headline": "Severe Flooding in Lucknow District",
                "description": "Heavy rainfall has caused severe flooding in parts of Lucknow district. Rivers are above danger level.",
                "instruction": "Evacuate low-lying areas immediately. Move to designated shelters.",
                "area": {
                    "areaDesc": "Lucknow District",
                    "polygon": [[26.7,80.8], [26.7,81.1], [27.0,81.1], [27.0,80.8], [26.7,80.8]],
                    "geocode": {"valueName": "HASC", "value": "IN.UP.LU"}
                }
            }
        },
        {
            "identifier": "CAP-0987654321",
            "sender": "IMD.GOV.IN",
            "sent": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+05:30"),
            "status": "Actual",
            "msgType": "Alert",
            "scope": "Public",
            "info": {
                "category": "Met",
                "event": "Heavy Rainfall",
                "urgency": "Expected",
                "severity": "Moderate",
                "certainty": "Likely",
                "headline": "Heavy Rainfall Warning for Lucknow",
                "description": "Heavy rainfall (7-11 cm) expected in the next 24 hours in Lucknow and surrounding areas.",
                "instruction": "Avoid unnecessary travel. Stay away from flood-prone areas.",
                "area": {
                    "areaDesc": "Lucknow and surrounding districts",
                    "polygon": [[26.6,80.7],[26.6,81.2],[27.1,81.2],[27.1,80.7],[26.6,80.7]],
                    "geocode": {"valueName": "HASC","value": "IN.UP"}
                }
            }
        }
    ]
    
    # Add scenario specific alerts
    if scenario == "Simulated Earthquake":
        simulated_alerts.append({
            "identifier": "CAP-EQ-123",
            "sender": "NCS.GOV.IN",
            "sent": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+05:30"),
            "status": "Actual",
            "msgType": "Alert", 
            "scope": "Public",
            "info": {
                "category": "Geo",
                "event": "Earthquake",
                "urgency": "Immediate",
                "severity": "Extreme",
                "certainty": "Observed",
                "headline": "Magnitude 6.5 Earthquake",
                "description": "Major earthquake detected near Lucknow. Structural damage expected.",
                "instruction": "Drop, Cover, and Hold On. Move to open areas if safe.",
                "area": {
                    "areaDesc": "Lucknow and adjacent regions",
                    "circle": [[26.85, 80.95], 50.0]
                }
            }
        })
        
    return simulated_alerts

def get_satellite_imagery_logic(source, date, location_str):
    try:
        lat, lon = map(float, location_str.split(','))
    except:
        lat, lon = 26.85, 80.95

    width, height = 500, 500
    img_array = np.zeros((height, width, 3), dtype=np.uint8)

    if source == "Sentinel-2":
        img_array[:, :, 0] = np.random.randint(0, 100, (height, width))
        img_array[:, :, 1] = np.random.randint(50, 150, (height, width))
        img_array[:, :, 2] = np.random.randint(100, 200, (height, width))
    elif source == "NASA GIBS":
        img_array[:, :, 0] = np.random.randint(50, 200, (height, width))
        img_array[:, :, 1] = np.random.randint(50, 200, (height, width))
        img_array[:, :, 2] = np.random.randint(50, 200, (height, width))
    elif source == "Maxar Open Data":
        img_array[:, :, 0] = np.random.randint(100, 200, (height, width))
        img_array[:, :, 1] = np.random.randint(100, 200, (height, width))
        img_array[:, :, 2] = np.random.randint(100, 200, (height, width))
    
    # Add simulated features (simplified)
    for i in range(10):
        x, y = np.random.randint(0, width), np.random.randint(0, height)
        size = np.random.randint(10, 50)
        img_array[max(0, y-size):min(height, y+size), max(0, x-size):min(width, x+size), :] = [0, 0, 150]

    img = Image.fromarray(img_array)
    return img, [lat-0.1, lon-0.1, lat+0.1, lon+0.1]

def detect_damage_logic(image: Image.Image, scenario_type):
    img_array = np.array(image.convert("RGB"))
    height, width = img_array.shape[:2]
    damage_mask = np.zeros((height, width), dtype=np.uint8)
    
    details = {}
    
    if scenario_type == "Simulated Flood":
        for i in range(8):
            x, y = np.random.randint(0, width), np.random.randint(0, height)
            size = np.random.randint(30, 150)
            damage_mask[max(0, y-size):min(height, y+size), max(0, x-size):min(width, x+size)] = 1
            
        details = {
            "Flooded Houses": str(random.randint(120, 450)),
            "Blocked Roads": f"{random.randint(5, 20)} Locations",
            "Water Level": f"{random.uniform(1.5, 4.2):.1f}m",
            "Affected Area": f"{random.randint(15, 40)} sq km"
        }
            
    elif scenario_type == "Simulated Earthquake":
        for i in range(25):
             x, y = np.random.randint(0, width), np.random.randint(0, height)
             size = np.random.randint(10, 60)
             damage_mask[max(0, y-size):min(height, y+size), max(0, x-size):min(width, x+size)] = 1
             
        details = {
            "Collapsed Structures": str(random.randint(40, 150)),
            "Cracked Buildings": str(random.randint(200, 500)),
            "Road Fissures": f"{random.randint(10, 30)} Locations",
            "Power Outages": f"{random.randint(5000, 20000)} Households"
        }
             
    damage_percentage = (np.sum(damage_mask) / (height * width)) * 100
    
    damage_vis = np.zeros((height, width, 4), dtype=np.uint8)
    if scenario_type == "Simulated Flood":
        damage_vis[damage_mask == 1] = [0, 0, 255, 150]
    else:
        damage_vis[damage_mask == 1] = [255, 0, 0, 150]
        
    overlay = Image.fromarray(damage_vis)
    return overlay, damage_percentage, details

def analyze_social_media_logic(scenario_type):
    pool_flood = [
        "Water is rising quickly in #Lucknow near Gandhi Bridge. Need rescue ASAP! #SOSFlood",
        "Our building is surrounded by water, no way to get out. Location: Indira Nagar, Lucknow",
        "Roads completely flooded in Gomti Nagar. No electricity for 24 hours. Need drinking water and food.",
        "#Emergency Flood waters entered ground floor. Family of 5 on roof. Hazratganj area.",
        "Can't reach emergency services. Water level rising. We're at Aliganj sector K. #Lucknow #FloodHelp",
        "School building flooded with 30+ children trapped. Urgent help needed at City Montessori School.",
        "Elderly parents stranded at home in Vikas Nagar. Need medical assistance and evacuation.",
        "Bridge collapsed near river bank. Multiple vehicles affected. Coordinates: 26.83, 80.92",
        "No clean water available in Jankipuram Extension. Children getting sick. #FloodRelief",
        "Hospital generator failing. Critical patients at risk. Sanjay Gandhi Hospital needs immediate help.",
        "Trapped in car near Polytechnic Chauraha. Water level neck deep. Save us!",
        "Food supplies running out in Mahanagar area. 50 families impacted.",
        "Need boat rescue at Ashiyana. Wheelchair user stranded.",
        "River overflowing at Kudia Ghat. Embankment breached!",
        "Lost contact with family in Charbagh. Please check if safe.",
        "Electricity pole fell in water near Aminabad. Very dangerous situation.",
        "Need milk for babies. Shelter at Husainabad running low.",
        "Ground floor submerged in Chowk area. Moving to terrace.",
        "Panic in Telibagh due to sudden water surge.",
        "Volunteers needed for food distribution at Patrakarpuram."
    ]
    
    pool_earthquake = [
        "Building collapsed in central Lucknow. People trapped under debris. #EarthquakeEmergency",
        "We're stuck on 4th floor, building has cracks. Scared to move. Location: Kapoorthala, Lucknow",
        "Gas leak after earthquake in Indira Nagar. Strong smell. Evacuated but others might be affected.",
        "#SOS Multiple buildings damaged in Gomti Nagar. Need search and rescue teams urgently.",
        "Can't contact family in Aliganj sector G. Phone lines down. Anyone with info please help.",
        "School wall collapsed during class hours. Injuries reported. Butler Palace colony.",
        "Need medical help - many injured at Charbagh Railway Station after earthquake.",
        "Road blocked by debris near High Court. Emergency vehicles can't get through. Coordinates: 26.86, 80.94",
        "No electricity or water in Jankipuram. Several houses damaged. Need tents and supplies.",
        "Hospital evacuated due to structural damage. Patients in parking lot. KGMU Hospital needs support.",
        "Large fissure appeared on University Road. Traffic halted.",
        "Old city area has narrow lanes blocked by fallen debris. Ambulance stuck.",
        "Aftershocks felt in Rajajipuram. People sleeping in parks.",
        "Water tank collapsed on house in Nirala Nagar. Rescue needed.",
        "Metro service stopped. People stranded at stations.",
        "Fire reported in Hazratganj multi-story building after quake.",
        "My house tilts to one side in Ashiyana. Fearful.",
        "Need tarpaulins and blankets in Chinhat. Cold night.",
        "Looting reported in damaged shops at Aminabad.",
        "Need heavy machinery to clear debris at Hussainganj."
    ]
    
    if scenario_type == "Simulated Flood":
        sample_posts = pool_flood
    else: 
        sample_posts = pool_earthquake
    
    selected_posts = random.sample(sample_posts, min(10, len(sample_posts)))
    
    results = []
    for post in selected_posts:
        # Regex extraction
        location_patterns = [
            r"in ([A-Za-z\s]+), Lucknow",
            r"in ([A-Za-z\s]+)",
            r"at ([A-Za-z\s]+)",
            r"near ([A-Za-z\s]+)",
            r"Location: ([A-Za-z\s]+)",
            r"([A-Za-z\s]+) area",
            r"Coordinates: ([0-9.]+), ([0-9.]+)"
        ]
        
        location = "Unknown"
        for pattern in location_patterns:
            match = re.search(pattern, post)
            if match:
                if pattern == r"Coordinates: ([0-9.]+), ([0-9.]+)" and len(match.groups()) == 2:
                    location = f"{match.group(1)}, {match.group(2)}"
                else:
                    location = match.group(1)
                break
        
        # Simple keyword need extraction
        need = "General Assistance"
        lower_post = post.lower()
        if "water" in lower_post: need = "Drinking Water"
        elif "food" in lower_post or "milk" in lower_post: need = "Food Supplies"
        elif "medical" in lower_post or "injured" in lower_post: need = "Medical Assistance"
        elif "rescue" in lower_post or "trapped" in lower_post or "boat" in lower_post: need = "Search & Rescue"
        elif "shelter" in lower_post or "tents" in lower_post: need = "Temporary Shelter"
        
        results.append({
            "text": post,
            "location": location,
            "need": need,
            "timestamp": datetime.now().strftime("%H:%M")
        })
        
    return results

def get_shelter_data():
    return [
        {
            "id": 1,
            "name": "City Hall Shelter",
            "location": [26.87, 80.92],
            "capacity": 500,
            "occupancy": 320,
            "resources": {"food": "Adequate", "water": "Adequate", "medical": "Limited"},
            "status": "Open",
            "contact": "+91-9876543210"
        },
        {
            "id": 2,
            "name": "School Complex Shelter",
            "location": [26.83, 80.97],
            "capacity": 800,
            "occupancy": 450,
            "resources": {"food": "Limited", "water": "Adequate", "medical": "Adequate"},
            "status": "Open",
            "contact": "+91-9876543211"
        },
        {
            "id": 3,
            "name": "Sports Stadium Camp",
            "location": [26.81, 80.93],
            "capacity": 1200,
            "occupancy": 890,
            "resources": {"food": "Adequate", "water": "Limited", "medical": "Adequate"},
            "status": "Crowded",
            "contact": "+91-9876543212"
        },
        {
            "id": 4,
            "name": "Community Center",
            "location": [26.88, 80.96],
            "capacity": 300,
            "occupancy": 120,
            "resources": {"food": "Limited", "water": "Limited", "medical": "Limited"},
            "status": "Open",
            "contact": "+91-9876543213"
        }
    ]

# --- Endpoints ---

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/scenarios")
def get_scenarios():
    return ["Simulated Flood", "Simulated Earthquake"]

@app.get("/api/satellite-sources")
def get_sources():
    return ["Upload Custom", "Sentinel-2", "NASA GIBS", "Maxar Open Data"]

@app.post("/api/satellite-imagery")
def get_satellite_imagery_endpoint(req: SatelliteRequest):
    img, bounds = get_satellite_imagery_logic(req.source, req.date, req.location)
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "image": f"data:image/png;base64,{img_b64}",
        "bounds": bounds
    }

@app.post("/api/upload-satellite")
async def upload_satellite(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(BytesIO(contents))
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "image": f"data:image/png;base64,{img_b64}",
        "bounds": [26.80, 80.90, 26.95, 81.05]
    }

@app.post("/api/detect-damage")
def detect_damage_endpoint(req: DamageRequest):
    try:
        header, encoded = req.image.split(",", 1)
        data = base64.b64decode(encoded)
        img = Image.open(BytesIO(data))
    except:
        raise HTTPException(status_code=400, detail="Invalid image data")

    damage_overlay, percentage = detect_damage_logic(img, req.scenario)
    
    buffered = BytesIO()
    damage_overlay.save(buffered, format="PNG")
    overlay_b64 = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "overlay": f"data:image/png;base64,{overlay_b64}",
        "percentage": round(percentage, 2)
    }

@app.get("/api/social-media")
def get_social_media(scenario: str):
    return analyze_social_media_logic(scenario)

@app.get("/api/sms-fallback")
def get_sms_messages(scenario: str):
    # Simulated SMS logic
    if scenario == "Simulated Flood":
        messages = [
            "SOS. Flood in village Manaknagar. 20 families on rooftops.",
            "No food or water since yesterday. Village Arjunganj completely flooded.",
            "Bridge broken at Bijnor road. Cannot leave area. Need help.",
            "Medical emergency. Elderly person needs insulin. Mohanlalganj area.",
            "Children trapped in school. Water rising. Bakshi Ka Talab area.",
            "Urgent: Levee breached at Gomti. Evacuate downstream immediately.",
            "Need boat for dialysis patient in Triveni Nagar.",
            "Electric shock incidents reported in flooded streets of Chowk.",
            "Snake bite victim in flooded home. Need anti-venom at Balaganj.",
            "Ration shop looted in chaos. Police needed at Alambagh.",
            "Water entered first floor. 5 people stranded. Rajajipuram.",
            "Need drinking water packets airdropped in Chinhat.",
            "Heavy rain causing landslide near Kukrail. Roads blocked.",
            "Pregnant woman needs transport to hospital. Ashiyana sector M.",
            "Generator fuel running low at emergency clinic. Aliganj."
        ]
    else:
        messages = [
            "Houses collapsed in Kakori village. Many trapped. Urgent help needed.",
            "No shelter after earthquake. 15 families sleeping outside. Malihabad.",
            "Road to hospital blocked. Injured people waiting. Sarojini Nagar.",
            "School building unsafe after quake. Need tents for classes. Itaunja.",
            "Water pipeline broken. No clean water. Chinhat area needs water tankers.",
            "Gas leak smell strong in Gosainganj. Warning issued.",
            "Fire triggered by short circuit in Aminabad market. Fire brigade stuck.",
            "Looting reported in evacuated areas of Kaiserbagh.",
            "Building tilted at dangerous angle in Hazratganj. Evacuation needed.",
            "Bridge cracked on Kanpur Road. Traffic halted.",
            "Debris blocking ambulance at Charbagh station entrance.",
            "Need crane to lift slab. People voices heard underneath. Hussainganj.",
            "Panic at weekly market due to aftershock. Several injured in stampede.",
            "Old building collapsed in Chowk. Narrow lanes inaccessible.",
            "Crack in water tank. Flooding nearby houses. Vikas Nagar."
        ]
    
    results = []
    # Return more SMS messages
    for msg in random.sample(messages, 8):
        results.append({
            "message": msg,
            "timestamp": datetime.now().strftime("%H:%M"),
            "location": "Unknown Area", 
            "priority": "High"
        })
    return {
        "messages": results,
        "stats": {
            "active_towers": f"{random.randint(15,22)}/{random.randint(25,30)}",
            "processing_rate": f"{random.randint(85,98)}%"
        }
    }

@app.get("/api/cap-alerts")
def get_cap_alerts(scenario: str):
    return fetch_cap_alerts(scenario)

@app.post("/api/routes")
def get_routes(req: RouteRequest):
    # Simulated routing graph logic
    routes = []
    center_lat, center_lon = 26.85, 80.95
    
    # Generate more routes for "more data"
    for i in range(5):
        start_lat = center_lat + random.uniform(-0.05, 0.05)
        start_lon = center_lon + random.uniform(-0.05, 0.05)
        end_lat = center_lat + random.uniform(-0.05, 0.05)
        end_lon = center_lon + random.uniform(-0.05, 0.05)
        
        path = [[start_lat, start_lon]]
        steps = 10
        for j in range(1, steps):
            t = j / steps
            # Add curve
            lat = start_lat + (end_lat - start_lat) * t + random.uniform(-0.01, 0.01)
            lon = start_lon + (end_lon - start_lon) * t + random.uniform(-0.01, 0.01)
            path.append([lat, lon])
        path.append([end_lat, end_lon])
        
        routes.append({
            "id": f"Route-{i+101}",
            "start": f"Sector {random.choice(['A','B','C'])} Hub",
            "end": f"Zone {i+1}",
            "distance": f"{random.uniform(5, 20):.1f} km",
            "time": f"{random.randint(15, 60)} min",
            "status": "Clear" if random.random() > 0.4 else "Congested",
            "path": path 
        })
    return routes

@app.post("/api/evacuation")
def get_evacuation(req: EvacuationRequest):
    shelters = get_shelter_data()
    routes = []
    
    # Calculate simple distance-based routes for simulation
    # In real world, use GraphHopper or OSRM
    for s in shelters:
        s_lat, s_lon = s["location"]
        path = [[req.user_lat, req.user_lon]]
        
        # simulated waypoints to avoid hazards
        mid_lat = (req.user_lat + s_lat) / 2 + random.uniform(-0.005, 0.005)
        mid_lon = (req.user_lon + s_lon) / 2 + random.uniform(-0.005, 0.005)
        
        path.append([mid_lat, mid_lon])
        path.append([s_lat, s_lon])
        
        routes.append({
            "shelter_id": s["id"],
            "shelter_name": s["name"],
            "path": path,
            "length": round(random.uniform(2, 8), 1),
            "capacity_status": f"{s['occupancy']}/{s['capacity']}"
        })
        
    return {
        "routes": routes,
        "shelters": [s["location"] for s in shelters],
        "hazards": [
            [26.86, 80.93, 0.02], # lat, lon, radius
            [26.84, 80.96, 0.015]
        ]
    }

@app.get("/api/shelters")
def get_shelters_endpoint():
    return get_shelter_data()

@app.get("/api/ai-explanations")
def get_ai_explanations(scenario: str):
    """Generate explanations for AI decisions"""
    return {
        "damage_assessment": {
            "severity": "High damage concentration in northern districts",
            "reasoning": "Satellite spectral analysis detects 45% structural change in Sector 4.",
            "confidence": "87%"
        },
        "resource_allocation": {
            "priority": "Medical & Water",
            "reasoning": f"Social media signal analysis indicates 'Water' and 'Medical' as top keywords ({random.randint(200,500)} mentions).",
            "action": "Deploying 3 mobile water units to Indira Nagar."
        },
        "routing": {
            "status": "Dynamic Re-routing Active",
            "reasoning": "Flood waters detected on Main Highway. Route A-4 diverted via Old Bridge.",
            "impact": "+12 mins estimated delay"
        },
        "prediction": {
            "next_24h": "Water levels expected to rise by 15cm" if scenario == "Simulated Flood" else "Aftershock probability: 35%",
            "affected_population": "Approx. 15,000"
        }
    }
