import React, { useState, useEffect } from 'react';
import Map from './Map';
import './App.css';
import io from 'socket.io-client';

function generateRandomLocation(startDate, endDate, height = 376, width = 575) {
  let diff = endDate.getTime() - startDate.getTime();
  let new_diff = diff * Math.random();
  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
    timestamp: new Date(startDate.getTime() + new_diff)
  }
}

function filterLocationByTime(userData, startTime, endTime) {
  return userData.location.filter(location => {
    if (location.timestamp >= startTime && location.timestamp <= endTime) {
      return location;
    }
    return "";
  });
}

function App() {
  const [newUser, setNewUser] = useState();

  useEffect(() => {
    const socket = io('http://localhost:3000/');
    socket.on('adduser', (data) => {
      setNewUser(data)
    });
  }, [])


  const [location, setLocation] = useState([
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 2), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3)),
    generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3))
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setLocation(location => [...location, generateRandomLocation(new Date(2019, 9, 1), new Date(2019, 9, 3))]);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.confirm("Filter the data?")) {
        setLocation(location => filterLocationByTime({ id: 1111, location: location, name: 'new user' }, new Date(2019, 9, 2), new Date(2019, 9, 3)))
      }
    }, 15000);

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="App">
      <Map trackuserdata={{ id: 1111, location: location, name: 'new user' }} adduser={newUser} />
    </div>
  );
}

export default App;
