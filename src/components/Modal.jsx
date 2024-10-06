import React from 'react';
import './Modal.css'; // Optional: add styling for the modal

const Modal = ({ planet, onClose }) => {
  if (!planet) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{planet.name}</h2>
        <p><strong>Semi-Major Axis:</strong> {planet.semi_major_axis} AU</p>
        <p><strong>Eccentricity:</strong> {planet.eccentricity}</p>
        <p><strong>Orbital Period:</strong> {planet.orbital_period} days</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
