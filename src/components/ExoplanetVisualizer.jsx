import React, { useEffect, useState } from 'react';
import './ExoplanetVisualizer.css'; // Import CSS for styling

const ExoplanetVisualizer = ({ starData, onPlanetSelect }) => {
  const [diameter, setDiameter] = useState(6); // Default diameter
  const [characterizablePlanets, setCharacterizablePlanets] = useState([]);

  const handleSliderChange = (e) => {
    setDiameter(e.target.value);
  };

  const calculateSNR = () => {
    const results = [];
    const SNR0 = 100; 

    starData.starSystems.forEach((star) => {
      const Rstar = star.st_lum; 
      star.planets.forEach((planet) => {
        const RP = planet.radius; 
        const PS = planet.semi_major_axis; 
        const ES = star.sy_dist; 

        
        const SNR = SNR0 * Math.pow((Rstar * RP * (diameter / 6)) / ((ES / 10) * PS), 2);

        if (SNR > 5) {
          results.push({ star, planet, SNR });
        }
      });
    });

    setCharacterizablePlanets(results);
  };

  useEffect(() => {
    calculateSNR();
  }, [diameter, starData]);

return (
    <div className="exoplanet-visualizer">
        <h2>Exoplanet Visualizer</h2>
        <label>
            Telescope Diameter (m):
            <input
                type="range"
                min="5"
                max="15"
                value={diameter}
                onChange={handleSliderChange}
            />
            {diameter} m
        </label>
        <div className="results">
            <h3>Characterizable Exoplanets (SNR {'>'} 5):</h3>
            <ul className="scrollable-list">
                {characterizablePlanets.length > 0 ? (
                    characterizablePlanets.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => onPlanetSelect(item.planet.name)} 
                        >
                            {item.planet.name} orbiting {item.star.name} (SNR: {item.SNR.toFixed(2)}) 
                            - {item.planet.habitable_zone ? "Habitable" : "Not Habitable"}
                        </li>
                    ))
                ) : (
                    <li>No characterizable exoplanets found.</li>
                )}
            </ul>
        </div>
    </div>
);
};

export default ExoplanetVisualizer;
