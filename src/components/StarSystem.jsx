import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import starData from '../data/exoplanets.json'; // Your updated JSON data
import Modal from './Modal'; // Import the Modal component
import LagrangeSelector from './LagrangeSelector'; // Import the Lagrange Selector

const StarSystem = () => {
  const mountRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null); // State for selected planet or star
  const cameraRef = useRef(null); // Ref for the camera

  // Define the maximum planet size relative to the Sun's size
  const SUN_RADIUS = 10; // Fixed size for the Sun
  const MAX_PLANET_RADIUS = SUN_RADIUS / 10; // Maximum planet size

  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(100, 100, 500);
    cameraRef.current = camera; // Store camera in ref

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);

    // Add a light source (for star brightness)
    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 0, 0); // Light from the Sun
    scene.add(light);

    // Create the Sun at the center with a fixed size
    const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 32, 32); // Sun fixed size
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow Sun
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunMesh);

    // Array to hold planet objects for animation
    const planets = [];

    // Function to create stars and their planets
    const createStar = (star) => {
      const geometry = new THREE.SphereGeometry(2, 16, 16); // Adjust size based on luminosity
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White for stars
      const starMesh = new THREE.Mesh(geometry, material);

      // Convert RA, Dec, and distance to Cartesian coordinates
      const ra = THREE.MathUtils.degToRad(star.ra); // Right Ascension in radians
      const dec = THREE.MathUtils.degToRad(star.dec); // Declination in radians
      const dist = star.sy_dist * 10; // Adjust scale factor if needed (e.g., to fit the scene)

      // Calculate the star's position in 3D space
      starMesh.position.set(
        dist * Math.cos(dec) * Math.cos(ra), // x
        dist * Math.cos(dec) * Math.sin(ra), // y
        dist * Math.sin(dec) // z
      );

      scene.add(starMesh);

      // Store star data in userData
      starMesh.userData = star; // Store star data

      // Add click event to the star
      starMesh.callback = () => handleClick(star); // Show modal with star data on click

      // Event listener for click
      renderer.domElement.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Create a Raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Check for intersection with stars
        const intersects = raycaster.intersectObjects(scene.children.filter(child => child instanceof THREE.Mesh));
        if (intersects.length > 0 && intersects[0].object.userData.st_spectype) {
          const clickedStar = intersects[0].object.userData; // Get the star data
          handleClick(clickedStar); // Show the modal with star data
        }
      });

      // Optional: Create orbits for planets if needed
      if (star.planets) {
        star.planets.forEach(planet => {
          createOrbit(starMesh.position, planet);
          createPlanet(starMesh.position, planet);
        });
      }
    };

    // Function to create a dotted orbit for each planet
    const createOrbit = (starPosition, planet) => {
      const orbitRadius = planet.semi_major_axis * 100; // Scale semi-major axis for visualization

      // Convert inclination from degrees to radians
      const inclination = THREE.MathUtils.degToRad(planet.inclination || 0);

      // Create orbit points
      const orbitPoints = [];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * 2 * Math.PI; // Angle for the orbit
        const x = starPosition.x + orbitRadius * Math.cos(angle); // X position
        const y = starPosition.y + orbitRadius * Math.sin(angle) * Math.cos(inclination); // Y position
        const z = orbitRadius * Math.sin(inclination); // Z position based on inclination

        orbitPoints.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

      const material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        dashSize: 3,
        gapSize: 1,
        linewidth: 2,
      });

      const orbit = new THREE.Line(geometry, material);
      orbit.computeLineDistances(); // Required for dashed lines
      scene.add(orbit);
    };

    // Function to create a planet
    const createPlanet = (starPosition, planetData) => {
      // Ensure the planet's radius does not exceed the maximum size
      const planetRadius = Math.min(planetData.radius || 1, MAX_PLANET_RADIUS); // Use planet data or default to 1, capped by max size

      const planetGeometry = new THREE.SphereGeometry(planetRadius, 16, 16); // Small planet scaled by its radius
      const planetMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green for planets
      const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

      // Set initial position
      const orbitRadius = planetData.semi_major_axis * 100;
      const eccentricity = planetData.eccentricity || 0;
      planetMesh.position.set(
        starPosition.x + orbitRadius * (1 + eccentricity),
        starPosition.y,
        starPosition.z
      );

      // Add click event to the planet
      planetMesh.userData = planetData; // Store planet data in userData
      planetMesh.callback = () => handleClick(planetData); // Show modal with planet data on click
      scene.add(planetMesh);
      planets.push({ planetMesh, planetData, starPosition });

      // Add event listener for click
      renderer.domElement.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Create a Raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Check for intersection with planets
        const intersects = raycaster.intersectObjects(planets.map(p => p.planetMesh));
        if (intersects.length > 0) {
          const clickedPlanet = intersects[0].object.userData; // Get the planet data
          handleClick(clickedPlanet); // Show the modal with planet data
        }
      });
    };

    // Function to handle clicks on planets and stars
    const handleClick = (object) => {
      setSelectedObject(object); // Show the modal with object data
      zoomToObject(object); // Zoom to the clicked object
    };

    // Function to zoom to the clicked object
    const zoomToObject = (object) => {
      const targetPosition = new THREE.Vector3().copy(object.position);
      const distance = camera.position.distanceTo(targetPosition);
      const zoomFactor = 2; // Adjust zoom factor as needed
      const newCameraPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, distance / zoomFactor));

      // Animate camera movement to the new position
      const duration = 1; // Duration of zoom animation in seconds
      const startPosition = camera.position.clone();
      const startTime = Date.now();

      const animateZoom = () => {
        const elapsed = (Date.now() - startTime) / 1000; // Time in seconds
        const t = Math.min(elapsed / duration, 1); // Normalize to [0, 1]

        // Lerp the camera position
        camera.position.lerpVectors(startPosition, newCameraPosition, t);
        camera.lookAt(targetPosition); // Keep looking at the target position

        // Continue animation if not yet done
        if (t < 1) {
          requestAnimationFrame(animateZoom);
        }
      };
      animateZoom();
    };

    // Loop through star systems and create stars and orbits
    starData.starSystems.forEach(createStar);

    // Animation loop to move planets
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // Animate each planet
      const time = Date.now() * 0.0001; // Speed factor for animation

      planets.forEach(({ planetMesh, planetData, starPosition }) => {
        const orbitalPeriod = planetData.orbital_period || 365; // Default to 365 days if not provided
        const angle = (time / orbitalPeriod) * 2 * Math.PI; // Calculate angle based on time and orbital period

        // Semi-major and semi-minor axes
        const semiMajorAxis = planetData.semi_major_axis * 100;
        const semiMinorAxis = semiMajorAxis * (1 - planetData.eccentricity);

        // Parametric equation of the ellipse
        const x = starPosition.x + semiMajorAxis * Math.cos(angle);
        const y = starPosition.y + semiMinorAxis * Math.sin(angle) * Math.cos(THREE.MathUtils.degToRad(planetData.inclination));
        const z = semiMajorAxis * Math.sin(THREE.MathUtils.degToRad(planetData.inclination)); // Adjusted for inclination

        planetMesh.position.set(x, y, z);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Function to close the modal
  const closeModal = () => {
    setSelectedObject(null);
    // Optionally reset the camera position to the initial state
    const camera = cameraRef.current;
    camera.position.set(100, 100, 500); // Reset camera position
    camera.lookAt(0, 0, 0); // Reset camera direction
  };

  // Function to handle Lagrange Point selection
  const handleLagrangePointSelect = (position) => {
    // Animate the camera to the Lagrange point
    const targetPosition = new THREE.Vector3(...position);
    cameraRef.current.position.copy(targetPosition).add(new THREE.Vector3(0, 0, 50)); // Offset for a better view
    cameraRef.current.lookAt(targetPosition);
  };

  return (
    <div>
      <LagrangeSelector onLagrangePointSelect={handleLagrangePointSelect} />
      <div ref={mountRef}></div>
      <Modal planet={selectedObject} onClose={closeModal} /> {/* Render Modal */}
    </div>
  );
};

export default StarSystem;
