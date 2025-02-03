import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Fetch data from the Flask API
const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/data');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [moistureLevel, setMoistureLevel] = useState(65); // Initial value
  const [temperature, setTemperature] = useState(23); // Initial value
  const [isPumpActive, setIsPumpActive] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [historicalData, setHistoricalData] = useState([]); // For historical data
  const [devices, setDevices] = useState([]); // For connected devices
  const [logs, setLogs] = useState([]); // For system logs

  // Fetch data from the Flask API every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchData();
      if (data) {
        setMoistureLevel(data.soil); // Assuming "soil" represents moisture level
        setTemperature(data.temperature);
        // Update alerts based on thresholds
        if (data.soil < 40) {
          setAlerts((prev) => [...prev, 'Low moisture level detected!']);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate historical data for demonstration purposes
  useEffect(() => {
    const simulateHistoricalData = () => {
      const newHistoricalData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        moisture: Math.floor(Math.random() * 30) + 50,
        temperature: Math.floor(Math.random() * 10) + 20,
      }));
      setHistoricalData(newHistoricalData);
    };
    simulateHistoricalData();
  }, []);

  const togglePump = () => {
    setIsPumpActive(!isPumpActive);
    if (!isPumpActive) {
      setAlerts((prev) => [...prev, 'Manual watering activated']);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <h1>Plant Watering System Dashboard</h1>
      <button onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Real-Time Monitoring */}
        <div>
          <h2>Real-Time Monitoring</h2>
          <div>
            <strong>Soil Moisture:</strong> {moistureLevel.toFixed(1)}%
          </div>
          <div>
            <strong>Temperature:</strong> {temperature.toFixed(1)}°C
          </div>
          <div>
            <strong>Pump Status:</strong> {isPumpActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Control Panel */}
        <div>
          <h2>Control Panel</h2>
          <button onClick={togglePump}>
            {isPumpActive ? 'Stop Watering' : 'Start Watering'}
          </button>
          <div>
            <label>
              Moisture Threshold:
              <input
                type="number"
                value={40}
                onChange={(e) => console.log(e.target.value)}
                style={{ width: '100%' }}
              />
            </label>
            40%
          </div>
          <div>
            <label>
              Temperature Threshold:
              <input
                type="number"
                value={25}
                onChange={(e) => console.log(e.target.value)}
                style={{ width: '100%' }}
              />
            </label>
            25°C
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h2>System Alerts</h2>
          <ul>
            {alerts.slice(-3).map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>

        {/* Historical Data */}
        <div>
          <h2>Historical Data</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="moisture" stroke="#8884d8" />
              <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}