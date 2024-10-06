import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import starData from '../data/exoplanets.json';
import ExoplanetVisualizer from './ExoplanetVisualizer';
import TelescopeVisualizer from './TelescopeVisualizer';
import PlanetLabel from './PlanetLabel'; // Import the PlanetLabel component

const StarSystem = () => {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null); // Use a ref to store the scene
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null); // State to track selected planet
  const [marker, setMarker] = useState(null); // State to track the circle marker

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene; // Store the scene in the ref
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 200, 500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 0, 0);
    scene.add(light);

    const globalOrigin = new THREE.Object3D();
    scene.add(globalOrigin);

    const planetMeshes = [];

    const temperatureToColor = (temperature) => {
      let r, g, b;
      if (temperature < 1000) {
        r = 255; 
        g = 0;
        b = 0;
      } else if (temperature < 4000) {
        r = 255;
        g = Math.round(255 * (temperature / 4000));
        b = 0;
      } else if (temperature < 6000) {
        r = Math.round(255 * (6000 - temperature) / 2000);
        g = 255;
        b = 0;
      } else {
        r = 0;
        g = Math.round(255 * (temperature - 6000) / 4000);
        b = 255;
      }
      return new THREE.Color(r / 255, g / 255, b / 255);
    };

    const createStar = (star) => {
      const geometry = new THREE.SphereGeometry(2, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: temperatureToColor(star.st_teff) });
      const starMesh = new THREE.Mesh(geometry, material);

      const ra = THREE.MathUtils.degToRad(star.ra);
      const dec = THREE.MathUtils.degToRad(star.dec);
      const dist = star.sy_dist;

      const x = dist * Math.cos(dec) * Math.cos(ra);
      const y = dist * Math.cos(dec) * Math.sin(ra);
      const z = dist * Math.sin(dec);

      starMesh.position.set(x, y, z);
      globalOrigin.add(starMesh);

      if (star.planets) {
        star.planets.forEach((planet) => createPlanet(planet, starMesh));
      }

      let angle = 0;
      const animateStar = () => {
        angle += star.rotation_speed;
        const starDistance = star.distance_from_center;
        const x = starDistance * Math.cos(angle);
        const z = starDistance * Math.sin(angle);
        starMesh.position.set(x, starMesh.position.y, z);
      };

      const animate = () => {
        requestAnimationFrame(animate);
        animateStar();
      };
      animate();
    };

    const createPlanet = (planet, starMesh) => {
      const { semi_major_axis, habitable_zone, radius, orbital_period, inclination, angular_separation, texture_url } = planet;
      const color = habitable_zone ? 0xffff00 : 0x00ff00;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = texture_url 
        ? new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(texture_url) }) // Load texture
        : new THREE.MeshBasicMaterial({ color }); // Use solid color if no texture

      const planetMesh = new THREE.Mesh(geometry, material);

      const planetDistance = semi_major_axis * 10;
      const baseAngle = THREE.MathUtils.degToRad(angular_separation);
      const x = planetDistance * Math.cos(baseAngle);
      const z = planetDistance * Math.sin(baseAngle);

      planetMesh.position.set(
        x,
        planetDistance * Math.sin(THREE.MathUtils.degToRad(inclination)),
        z
      );

      starMesh.add(planetMesh);

      planetMeshes.push({ planet, starMesh, mesh: planetMesh }); // Store planet mesh for zooming

      const angularSpeed = (2 * Math.PI) / (orbital_period * 60 * 60 * 24);
      let angle = baseAngle;

      const animatePlanet = () => {
        angle += angularSpeed;
        const x = planetDistance * Math.cos(angle);
        const z = planetDistance * Math.sin(angle);

        planetMesh.position.set(
          x,
          planetDistance * Math.sin(THREE.MathUtils.degToRad(inclination)),
          z
        );
      };

      const animate = () => {
        requestAnimationFrame(animate);
        animatePlanet();
      };
      animate();
    };

    starData.starSystems.forEach(createStar);
    setPlanets(planetMeshes); // Store all planet meshes in state for zooming

    const animateScene = () => {
      requestAnimationFrame(animateScene);
      controls.update();
      renderer.render(scene, camera);
    };
    animateScene();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const zoomToPlanet = (planetName) => {
    const selectedPlanet = planets.find((p) => p.planet.name === planetName);

    if (selectedPlanet) {
      const { mesh } = selectedPlanet;
      const targetPosition = new THREE.Vector3().copy(mesh.position).add(new THREE.Vector3(50, 50, 50));

      const currentPos = cameraRef.current.position.clone();
      const targetPos = targetPosition.clone();
      let progress = 0;
      const zoomSpeed = 0.02;

      controlsRef.current.enabled = false; // Disable controls during zoom

      const smoothZoom = () => {
        if (progress < 1) {
          progress += zoomSpeed;
          cameraRef.current.position.lerpVectors(currentPos, targetPos, progress);
          cameraRef.current.lookAt(mesh.position);
          requestAnimationFrame(smoothZoom);
        } else {
          cameraRef.current.lookAt(mesh.position);
          controlsRef.current.enabled = true; // Re-enable controls after zoom completes
        }
      };

      smoothZoom();
      setSelectedPlanet(selectedPlanet); // Set the currently selected planet

      // Create a circular marker on the selected planet
      createMarker(mesh.position);
    }
  };

  const createMarker = (position) => {
    const scene = sceneRef.current; // Access the scene from ref
    // Remove existing marker if it exists
    if (marker) {
      marker.geometry.dispose();
      marker.material.dispose();
      marker.parent.remove(marker);
    }

    // Create a circular marker (ring)
    const geometry = new THREE.CircleGeometry(0.2, 32); // Adjust radius as needed
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide }); // Red color
    const circle = new THREE.Mesh(geometry, material);
    circle.position.copy(position);
    circle.rotation.x = Math.PI / 2; // Rotate to face upwards

    scene.add(circle);
    setMarker(circle); // Store marker in state
  };

  const resetCamera = () => {
    cameraRef.current.position.set(0, 200, 500); // Reset to default position
    cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the origin
    controlsRef.current.update();
    setSelectedPlanet(null); // Reset the selected planet when camera is reset
    if (marker) {
      marker.geometry.dispose();
      marker.material.dispose();
      marker.parent.remove(marker);
      setMarker(null); // Clear marker when resetting
    }
  };

  return (
    <>
      <div ref={mountRef}></div>
      <ExoplanetVisualizer starData={starData} onPlanetSelect={zoomToPlanet} />
      <TelescopeVisualizer starData={starData} onPlanetSelect={zoomToPlanet} />

      {/* Display the planet label if a planet is selected */}
      {selectedPlanet && (
        <PlanetLabel 
          position={selectedPlanet.mesh.position} 
          name={selectedPlanet.planet.name} 
        />
      )}

      <button style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={resetCamera}>
        Reset Camera
      </button>
    </>
  );
};

export default StarSystem;
