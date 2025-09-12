// src/components/DistanceChart.js
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import io from 'socket.io-client';

// FIX: Connect to the correct port (3001 instead of 3000)
const socket = io('http://localhost:3001', { transports: ['websocket'] });

// Trading chart color scheme
const CHART_COLORS = [
  '#4cafef', '#ff7300', '#82ca9d', '#ff0048', '#aa00ff', 
  '#ffab00', '#00c853', '#ff3d00', '#2962ff', '#c51162'
];

export default function DistanceChart() {
  const [data, setData] = useState([]);
  const [busNames, setBusNames] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('📊 DistanceChart: Setting up socket connection...');
    
    socket.on('connect', () => {
      console.log('✅ Connected to server for chart data');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on("busUpdate", (buses) => {
      const timestamp = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });

      // Convert buses data into one row per bus
      const newData = { time: timestamp };
      const currentBusNames = new Set();
      
      Object.keys(buses).forEach((busId) => {
        const busName = buses[busId].name || `Bus ${busId}`;
        currentBusNames.add(busName);
        newData[busName] = parseFloat(buses[busId].distance?.toFixed(2) || 0);
      });

      setBusNames(currentBusNames);
      
      setData((prev) => {
        const updated = [...prev, newData];
        // Keep last 30 points for better performance
        return updated.slice(-30);
      });
    });

    return () => {
      console.log('📊 DistanceChart: Cleaning up socket connection');
      socket.off('connect');
      socket.off('disconnect');
      socket.off("busUpdate");
    };
  }, []);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <p style={{ 
            color: '#e2e8f0', 
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            borderBottom: '1px solid #334155',
            paddingBottom: '4px'
          }}>
            Time: {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              color: entry.color,
              margin: '2px 0',
              fontSize: '12px'
            }}>
              {entry.dataKey}: <strong>{entry.value} km</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        gap: '8px',
        marginTop: '10px',
        padding: '5px'
      }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '11px',
            padding: '2px 6px',
            backgroundColor: '#1e293b',
            borderRadius: '3px',
            border: '1px solid #334155'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: entry.color,
              marginRight: '5px',
              borderRadius: '2px'
            }}></div>
            <span style={{ color: '#94a3b8' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ 
      width: "95%", 
      height: 400, 
      margin: "20px auto",
      backgroundColor: '#0f172a',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      border: '1px solid #1e293b'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ 
          color: '#e2e8f0',
          margin: 0,
          fontSize: '16px',
          fontWeight: '600'
        }}>
          📈 Live Distance Coverage
        </h3>
        <div style={{
          padding: '4px 8px',
          backgroundColor: isConnected ? '#10b981' : '#ef4444',
          borderRadius: '4px',
          fontSize: '11px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>
      
      {data.length === 0 ? (
        <div style={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          {isConnected ? 'Waiting for bus data...' : 'Connecting to server...'}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#334155" 
              opacity={0.3}
            />
            
            <XAxis 
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              domain={[0, 'dataMax + 2']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
            
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
            
            {Array.from(busNames).map((busName, index) => (
              <Line
                key={busName}
                type="monotone"
                dataKey={busName}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: CHART_COLORS[index % CHART_COLORS.length],
                  fill: '#0f172a'
                }}
                isAnimationActive={true}
                animationDuration={300}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
      
      <div style={{
        textAlign: 'center',
        marginTop: '10px',
        color: '#64748b',
        fontSize: '11px'
      }}>
        Tracking {busNames.size} buses • {data.length} data points
      </div>
    </div>
  );
}