import React, { useState } from 'react';

const InfoPanel = ({ data, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ top: '20px', left: '20px' });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - parseInt(position.left, 10),
      y: e.clientY - parseInt(position.top, 10),
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        top: `${e.clientY - offset.y}px`,
        left: `${e.clientX - offset.x}px`,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="info-panel"
      style={{ position: 'absolute', top: position.top, left: position.left }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if the mouse leaves the panel
    >
      <h2>{data.name}</h2>
      <p>Distance from Sun: {data.sy_dist} light-years</p>
      <p>Right Ascension: {data.ra}°</p>
      <p>Declination: {data.dec}°</p>
      <p>Effective Temperature: {data.st_teff} K</p>
      <p>Luminosity: {data.st_lum} L☉</p>
      {data.planets && data.planets.length > 0 && (
        <div>
          <h3>Planets:</h3>
          <ul>
            {data.planets.map((planet, index) => (
              <li key={index}>
                {planet.name}: 
                <ul>
                  <li>Semi-Major Axis: {planet.semi_major_axis} AU</li>
                  <li>Eccentricity: {planet.eccentricity}</li>
                  <li>Orbital Period: {planet.orbital_period} days</li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default InfoPanel;
