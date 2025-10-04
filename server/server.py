"""
Bactrack server
Run with: python server.py
Then open: http://{IP_ADDRESS}:8000
"""

# Suppress MediaPipe and protobuf warnings
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow warnings
os.environ['GLOG_minloglevel'] = '3'  # Suppress Google logging

import warnings
warnings.filterwarnings('ignore', category=UserWarning)

import cv2
import mediapipe as mp
import numpy as np
import math
import threading
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, HTMLResponse
import uvicorn
import asyncio
import json
import time

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose

# Key landmark indices
class Landmarks:
    NOSE = 0
    LEFT_EYE = 2
    RIGHT_EYE = 5
    LEFT_EAR = 7
    RIGHT_EAR = 8
    MOUTH_LEFT = 9
    MOUTH_RIGHT = 10
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12

# Global variables for video streaming
camera = None
pose_processor = None
current_frame = None
current_neck_length = None  # Store current neck length
baseline_neck_length = None  # Store calibrated baseline
frame_lock = threading.Lock()
# array to hold rating over time
# format: [(timestamp, rating), ...]
rating_over_time = []


# FastAPI app
app = FastAPI(title="Pose Detection API")

# helper functions
def draw_landmark(frame, landmark, color, size, label=None):
    """Draw a colored circle at a landmark position"""
    h, w, _ = frame.shape
    x = int(landmark.x * w)
    y = int(landmark.y * h)
    
    cv2.circle(frame, (x, y), size, color, -1)
    cv2.circle(frame, (x, y), size, (255, 255, 255), 2)
    
    if label:
        cv2.putText(frame, label, (x + size + 5, y + 5),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

def draw_line(frame, point1, point2, color, width):
    """Draw a line between two landmarks"""
    h, w, _ = frame.shape
    x1 = int(point1.x * w)
    y1 = int(point1.y * h)
    x2 = int(point2.x * w)
    y2 = int(point2.y * h)
    
    cv2.line(frame, (x1, y1), (x2, y2), color, width)

def calculate_distance_3d(point1, point2):
    """Calculate 3D Euclidean distance between two landmarks"""
    dx = point1.x - point2.x
    dy = point1.y - point2.y
    
    return math.sqrt(dx**2 + dy**2)

class NeckBase:
    """Simple class to hold neck base coordinates"""
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

# camera helper methods
def process_frame(frame, pose):
    """Process a single frame and draw landmarks"""
    global current_neck_length
    
    # Flip frame horizontally for mirror view
    frame = cv2.flip(frame, 1)
    
    # Convert BGR to RGB (MediaPipe uses RGB)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process the frame to detect pose
    results = pose.process(rgb_frame)
    
    # Get frame dimensions
    h, w, _ = frame.shape
    
    # Check if pose was detected
    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        
        # Define colors (BGR format in OpenCV)
        RED = (0, 0, 255)
        CYAN = (255, 220, 78)
        YELLOW = (0, 230, 255)
        GREEN = (154, 199, 22)
        DARK_RED = (0, 23, 255)
        
        # Draw head landmarks
        draw_landmark(frame, landmarks[Landmarks.NOSE], RED, 8, 'Nose')
        
        # Draw shoulder landmarks
        draw_landmark(frame, landmarks[Landmarks.LEFT_SHOULDER], GREEN, 10, 'L Shoulder')
        draw_landmark(frame, landmarks[Landmarks.RIGHT_SHOULDER], GREEN, 10, 'R Shoulder')
        
        # Calculate neck base (midpoint between shoulders)
        left_shoulder = landmarks[Landmarks.LEFT_SHOULDER]
        right_shoulder = landmarks[Landmarks.RIGHT_SHOULDER]
        nose = landmarks[Landmarks.NOSE]
        
        neck_base = NeckBase(
            (left_shoulder.x + right_shoulder.x) / 2,
            (left_shoulder.y + right_shoulder.y) / 2,
            (left_shoulder.z + right_shoulder.z) / 2
        )
        
        # Draw neck line
        draw_line(frame, nose, neck_base, RED, 3)
        draw_landmark(frame, neck_base,RED, 8)
        
        # Calculate neck length in 3D space
        neck_length = calculate_distance_3d(nose, neck_base)
        neck_length_cm = neck_length * 170
        
        # Update global current neck length
        current_neck_length = neck_length_cm
        
        # Draw shoulder line
        draw_line(frame, left_shoulder, right_shoulder, GREEN, 3)
        
        # Calculate midpoint of neck line for text placement
        mid_x = int((nose.x + neck_base.x) / 2 * w) + 15
        mid_y = int((nose.y + neck_base.y) / 2 * h)
        
        # Draw neck length label on frame
        text = f"{neck_length_cm:.1f} cm"
        cv2.putText(frame, text, (mid_x, mid_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 3)
        cv2.putText(frame, text, (mid_x, mid_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    
    return frame

def calculate_posture_rating(current_length, baseline_length):
    """
    Calculate posture rating (0-100) based on how close current neck length is to baseline
    Rating increases as current length approaches baseline
    """
    if current_length is None or baseline_length is None:
        return 0
    
    # Calculate percentage difference
    difference = abs(current_length - baseline_length)
    
    # Convert to rating (100 = perfect match, decreases with difference)
    # Using exponential decay for smoother rating
    rating = int((1.0 - (difference * 2 / baseline_length)) * 100)
    rating = max(0, min(100, rating))  # Clamp between 0 and 100

    # Append to rating history with timestamp
    rating_over_time.append((time.time(), rating))
    if len(rating_over_time) > 1000:  # Limit history size
        rating_over_time.pop(0)

        
    print("Current number of saved ratings:", len(rating_over_time))
    return int(rating)

def camera_thread():
    """Background thread to continuously process camera frames"""
    global current_frame, camera, pose_processor
    
    camera = cv2.VideoCapture(0)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    pose_processor = mp_pose.Pose(
        model_complexity=1,
        smooth_landmarks=True,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        processed_frame = process_frame(frame, pose_processor)
        
        with frame_lock:
            current_frame = processed_frame.copy()

def generate_frames():
    """Generator function to stream video frames"""
    while True:
        with frame_lock:
            if current_frame is None:
                continue
            frame = current_frame.copy()
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.1)

# display the video in the browser
@app.get("/")
async def index():
    """Serve the main HTML page"""
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Pose Detection</title>
    </head>
    <body>
        <img src="/video_feed" alt="Video Feed">
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# get the images in a video feed
@app.get("/video_feed")
async def video_feed():
    """Video streaming route"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# websocket connection
@app.websocket("/ws/")
async def websocket_calibrate(websocket: WebSocket):
    """
    WebSocket endpoint to calibrate baseline neck length
    Captures the current neck length as the baseline
    """
    global baseline_neck_length
    
    await websocket.accept()
    print("Calibration WebSocket connected")
    
    try:
        while True:
            # Wait for calibration request
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "calibrate":
                if current_neck_length is not None:
                    baseline_neck_length = current_neck_length
                    response = {
                        "status": "success",
                        "baseline": round(baseline_neck_length, 1),
                        "message": "Baseline calibrated successfully"
                    }
                    print(f"Baseline calibrated: {baseline_neck_length:.1f} cm")
                else:
                    response = {
                        "status": "error",
                        "message": "No pose detected. Please ensure you're visible to the camera."
                    }
                
                await websocket.send_text(json.dumps(response))
            
            elif message.get("action") == "reset":
                baseline_neck_length = None
                response = {
                    "status": "success",
                    "message": "Baseline reset"
                }
                await websocket.send_text(json.dumps(response))
                print("Baseline reset")
            
            elif message.get("action") == "rating":
              if baseline_neck_length is not None and current_neck_length is not None:
                rating = calculate_posture_rating(current_neck_length, baseline_neck_length)
                difference = current_neck_length - baseline_neck_length
                
                response = {
                    "rating": rating,
                    "current_length": round(current_neck_length, 1),
                    "baseline_length": round(baseline_neck_length, 1),
                    "difference": round(difference, 1),
                    "status": "good" if rating >= 80 else "moderate" if rating >= 60 else "poor"
                }
              
              else:
                response = {
                    "rating": 0,
                    "current_length": round(current_neck_length, 1) if current_neck_length else None,
                    "baseline_length": round(baseline_neck_length, 1) if baseline_neck_length else None,
                    "difference": 0,
                    "status": "not_calibrated" if baseline_neck_length is None else "no_pose"
                }
              
              await websocket.send_text(json.dumps(response))
              await asyncio.sleep(30)  # Send updates 10 times per second
            elif message.get("action") == "graph":
                response = {
                    "data": rating_over_time
                }
                await websocket.send_text(json.dumps(response))
            else:
              print("not valid",message)
    
    except WebSocketDisconnect:
        print("Calibration WebSocket disconnected")
    except Exception as e:
        print(f"Calibration WebSocket error: {e}")

@app.websocket("/ws/rating")
async def websocket_rating(websocket: WebSocket):
    """
    WebSocket endpoint to stream real-time posture rating
    Continuously sends rating based on current vs baseline neck length
    """
    await websocket.accept()
    print("Rating WebSocket connected")
    
    try:
        while True:
            if baseline_neck_length is not None and current_neck_length is not None:
                rating = calculate_posture_rating(current_neck_length, baseline_neck_length)
                difference = current_neck_length - baseline_neck_length
                
                response = {
                    "rating": rating,
                    "current_length": round(current_neck_length, 1),
                    "baseline_length": round(baseline_neck_length, 1),
                    "difference": round(difference, 1),
                    "status": "good" if rating >= 95 else "moderate" if rating >= 70 else "poor"
                }
            else:
                response = {
                    "rating": 0,
                    "current_length": round(current_neck_length, 1) if current_neck_length else None,
                    "baseline_length": round(baseline_neck_length, 1) if baseline_neck_length else None,
                    "difference": 0,
                    "status": "not_calibrated" if baseline_neck_length is None else "no_pose"
                }
            
            await websocket.send_text(json.dumps(response))
            await asyncio.sleep(1)
        
    except WebSocketDisconnect:
        print("Rating WebSocket disconnected")
    except Exception as e:
        print(f"Rating WebSocket error: {e}")

@app.on_event("startup")
async def startup_event():
    """Start the camera thread when the server starts"""
    thread = threading.Thread(target=camera_thread, daemon=True)
    thread.start()
    print("Camera thread started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup when server shuts down"""
    global camera, pose_processor
    if camera:
        camera.release()
    if pose_processor:
        pose_processor.close()

if __name__ == "__main__":
    print("Starting Pose Detection Server...")
    print("Open http://localhost:8000 in your browser")
    print("Press Ctrl+C to stop")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)