import React, { useState } from 'react';
import './Sidebar.css'; // Import the CSS file for styling

const Sidebar = ({ onAction }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 1700, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: position.x + e.movementX,
        y: position.y + e.movementY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="sidebar"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging when leaving the sidebar
    >
      <h2>Menu</h2>
      <ul>
        <li onClick={() => onAction('resetCamera')}>Reset Camera</li>
        <li onClick={() => onAction('toggleStars')}>Toggle Stars</li>
        <li onClick={() => onAction('info')}>Info</li>
        <li onClick={() => onAction('settings')}>Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
