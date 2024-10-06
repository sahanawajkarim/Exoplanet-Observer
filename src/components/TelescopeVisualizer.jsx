import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './TelescopeVisualizer.css';

const TelescopeVisualizer = ({ starData, onPlanetSelect }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [minTelescopeDiameter, setMinTelescopeDiameter] = useState(null);
  const canvasRef = useRef(null); // Reference for the canvas element
  const sceneRef = useRef(null); // Reference for the Three.js scene

  const handlePlanetSelect = (e) => {
    const planetName = e.target.value;
    if (planetName) {
      const [starName, planetNameOnly] = planetName.split('_');
      const selectedStar = starData.starSystems.find(star => star.name === starName);
      const selectedPlanet = selectedStar.planets.find(planet => planet.name === planetNameOnly);

      calculateMinTelescopeDiameter(selectedStar, selectedPlanet);
      setSelectedPlanet(selectedPlanet);

      // Trigger zoom to the selected planet
      onPlanetSelect(planetNameOnly);
    } else {
      setSelectedPlanet(null);
      setMinTelescopeDiameter(null);
    }
  };

  const calculateMinTelescopeDiameter = (star, planet) => {
    const ESmax = star.sy_dist; // Distance to the planetary system in parsecs
    const PS = planet.semi_major_axis; // Planet-star distance in AU

    // Rearranged formula to calculate minimum telescope diameter (D):
    const minDiameter = (ESmax * PS * 6) / 15;
    setMinTelescopeDiameter(minDiameter.toFixed(2)); // Round to two decimal places
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(canvas.width, canvas.height);
    camera.position.set(0, 0, 3); // Set camera distance from planet

    sceneRef.current = scene;

    const renderPlanet = () => {
      if (selectedPlanet && canvas) {
        // Clear previous objects
        while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
        }

        const radius = 0.5; // Radius of the displayed planet
        const geometry = new THREE.SphereGeometry(radius, 32, 32);

        // Load texture if available
        if (selectedPlanet.texture) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(`assets/textures/${selectedPlanet.texture}`, (texture) => {
            // Create material using the loaded texture
            const material = new THREE.MeshStandardMaterial({ map: texture });
            const planetMesh = new THREE.Mesh(geometry, material);
            scene.add(planetMesh);
          }, undefined, (error) => {
            console.error('An error occurred while loading the texture:', error);
          });
        } else {
          // Default color if no texture
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Use a default color, e.g., green
          const planetMesh = new THREE.Mesh(geometry, material);
          scene.add(planetMesh);
        }

        // Render loop
        const animate = () => {
          requestAnimationFrame(animate);
          const planetMesh = scene.children[0]; // Reference the planet mesh
          if (planetMesh) {
            planetMesh.rotation.y += 0.01; // Rotate planet for better visualization
          }
          renderer.render(scene, camera);
        };

        animate();
      }
    };

    renderPlanet(); // Initial render of the selected planet

    return () => {
      // Cleanup
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [selectedPlanet]); // Re-run when the selected planet changes

  return (
    <div className="telescope-visualizer">
      <h2>Telescope Visualizer</h2>

      <label>Select a Planet:</label>
      <select onChange={handlePlanetSelect} defaultValue="">
        <option value="" disabled>Select a planet...</option>
        {starData.starSystems.map((star) =>
          star.planets.map((planet) => (
            <option key={`${star.name}_${planet.name}`} value={`${star.name}_${planet.name}`}>
              {planet.name} orbiting {star.name}
            </option>
          ))
        )}
      </select>

      {selectedPlanet && (
        <div className="planet-details">
          <h3>Planet: {selectedPlanet.name}</h3>
          <p><strong>Semi-major axis (PS):</strong> {selectedPlanet.semi_major_axis} AU</p>
          <p><strong>Distance to planetary system (ES):</strong> {selectedPlanet.sy_dist} pc</p>
          <p><strong>Minimum telescope diameter required:</strong> {minTelescopeDiameter} m</p>
        </div>
      )}

      {/* Small square canvas for displaying the selected planet */}
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{ border: '1px solid #ccc', marginTop: '20px' }}
      />
    </div>
  );
};

export default TelescopeVisualizer;
