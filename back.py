from flask import Flask, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt

app = Flask(__name__)
CORS(app)

# In-memory storage for sensor data
sensor_data = {
    "soil": 0,
    "temperature": 0,
    "humidity": 0
}

# MQTT Broker details
MQTT_BROKER = "broker.hivemq.com"  # Public MQTT broker
MQTT_PORT = 1883                   # MQTT port
MQTT_TOPIC = "plant/watering/system"  # Topic to subscribe to


# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)


def on_message(client, userdata, msg):
    global sensor_data
    try:
        payload = msg.payload.decode('utf-8')
        data = eval(payload)  # Parse JSON-like string into a dictionary
        sensor_data["soil"] = data.get("soil", 0)
        sensor_data["temperature"] = data.get("temperature", 0)
        sensor_data["humidity"] = data.get("humidity", 0)
        print(f"Received data: {sensor_data}")
    except Exception as e:
        print(f"Error processing message: {e}")


# Initialize MQTT Client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()


@app.route('/data', methods=['GET'])
def get_data():
    """
    Endpoint to fetch the latest sensor data for the React dashboard.
    """
    return jsonify(sensor_data), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)