import React, { useState } from 'react';
import starData from '../data/exoplanets.json'; // Your JSON data
import './LagrangeSelector.css'; // Optional for styling

const LagrangeSelector = ({ onLagrangePointSelect }) => {
  const [body1, setBody1] = useState('');
  const [body2, setBody2] = useState('');
  const [lagrangePoints, setLagrangePoints] = useState([]);

  const bodies = starData.starSystems.map(system => system.name);

  const handleFindLagrangePoints = () => {
    if (body1 && body2) {
      const body1Data = starData.starSystems.find(system => system.name === body1);
      const body2Data = starData.starSystems.find(system => system.name === body2);

      if (body1Data && body2Data) {
        const points = calculateLagrangePoints(body1Data, body2Data);
        setLagrangePoints(points);
      }
    }
  };

  const calculateLagrangePoints = (body1, body2) => {
    const points = [];
    // Assuming the distances are in some unit (e.g., AU)
    const d1 = body1.sy_dist * 10; // Adjust scale factor if needed
    const d2 = body2.sy_dist * 10; // Adjust scale factor if needed

    // Simple calculation of Lagrange points
    points.push({ name: 'L1', position: [(d1 + d2) / 2, 0, 0] });
    points.push({ name: 'L2', position: [(d1 + d2) / 2 + 1, 0, 0] });
    points.push({ name: 'L3', position: [(d1 + d2) / 2 - 1, 0, 0] });
    points.push({ name: 'L4', position: [d1, d2, 0] });
    points.push({ name: 'L5', position: [d1, -d2, 0] });

    return points;
  };

  return (
    <div className="lagrange-selector">
      <h2>Select Bodies</h2>
      <select value={body1} onChange={(e) => setBody1(e.target.value)}>
        <option value="">Select Body 1</option>
        {bodies.map((body, index) => (
          <option key={index} value={body}>{body}</option>
        ))}
      </select>
      <select value={body2} onChange={(e) => setBody2(e.target.value)}>
        <option value="">Select Body 2</option>
        {bodies
          .filter(body => body !== body1) // Exclude the previously chosen object
          .map((body, index) => (
            <option key={index} value={body}>{body}</option>
          ))}
      </select>
      <button onClick={handleFindLagrangePoints}>Find Lagrange Points</button>
      <div className="lagrange-points">
        {lagrangePoints.map((point, index) => (
          <button key={index} onClick={() => onLagrangePointSelect(point.position)}>
            {point.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LagrangeSelector;
