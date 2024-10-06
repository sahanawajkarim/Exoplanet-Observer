import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import starData from '../data/exoplanets.json'; // Adjust the path as necessary
import ExoplanetVisualizer from './ExoplanetVisualizer';
import TelescopeVisualizer from './TelescopeVisualizer';
import PlanetLabel from './PlanetLabel'; // Import the PlanetLabel component

const StarSystem = () => {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const resetTimeoutRef = useRef(null); // Ref for the reset timeout

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 200, 500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Add ambient and directional light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(0, 200, 300);
    scene.add(directionalLight);

    const globalOrigin = new THREE.Object3D();
    scene.add(globalOrigin);

    // Create a skybox or background
    const loader = new THREE.TextureLoader();
    loader.load('assets/images/your-background-image.jpg', (texture) => {
      const backgroundGeometry = new THREE.SphereGeometry(500, 32, 32);
      const backgroundMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
      const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
      scene.add(backgroundMesh);
    });

    // Create particle system for dust
    const dustTexture = new THREE.TextureLoader().load('assets/textures/dust.png'); // Your dust texture path
    const dustCount = 5000; // Number of particles
    const dustGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000; // Spread particles in a large space
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      // Set colors to a soft white for mild light emission
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = 1.0; // G
      colors[i * 3 + 2] = 1.0; // B
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.5, // Size of each particle
      map: dustTexture,
      transparent: true,
      opacity: 0.5, // Adjust opacity for a mild light effect
      color: 0xffffff, // Color of the particles
    });

    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    const planetMeshes = [];

    const createStar = (star) => {
      const starColor = temperatureToColor(star.st_teff);
      const starGeometry = new THREE.SphereGeometry(5, 16, 16); // Increase size by 2.5 times
      const starMaterial = new THREE.MeshStandardMaterial({
        color: starColor,
        emissive: starColor,
        emissiveIntensity: 1,
      });

      const starMesh = new THREE.Mesh(starGeometry, starMaterial);
      const starLight = new THREE.PointLight(starColor, 5, 100);
      starMesh.add(starLight);

      const ra = THREE.MathUtils.degToRad(star.ra);
      const dec = THREE.MathUtils.degToRad(star.dec);
      const dist = star.sy_dist * 5; // Increase distance by 5 times

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
        const starDistance = star.distance_from_center * 5; // Increase distance by 5 times
        const x = starDistance * Math.cos(angle);
        const z = starDistance * Math.sin(angle);
        starMesh.position.set(x, starMesh.position.y, z);
      };

      const animate = () => {
        requestAnimationFrame(animate);
        if (isAnimating) {
          animateStar();
        }
      };
      animate();
    };

    const createPlanet = (planet, starMesh) => {
      const { semi_major_axis, habitable_zone, radius, orbital_period, inclination, angular_separation, texture } = planet;
      const color = habitable_zone ? 0xffff00 : 0x00ff00;

      const geometry = new THREE.SphereGeometry(radius * 2.5, 16, 16); // Increase size by 2.5 times
      let material;

      if (texture) {
        const planetTexture = new THREE.TextureLoader().load(`assets/textures/${texture}`);
        material = new THREE.MeshStandardMaterial({
          map: planetTexture,
          roughness: 0.7,
          metalness: 0.0,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.7,
          metalness: 0.0,
        });
      }

      const planetMesh = new THREE.Mesh(geometry, material);
      const planetDistance = semi_major_axis * 10 * 5; // Increase distance by 5 times
      const baseAngle = THREE.MathUtils.degToRad(angular_separation);
      const x = planetDistance * Math.cos(baseAngle);
      const z = planetDistance * Math.sin(baseAngle);

      planetMesh.position.set(
        x,
        planetDistance * Math.sin(THREE.MathUtils.degToRad(inclination)),
        z
      );

      // Draw dotted orbit with inclination
      const orbitGeometry = new THREE.RingGeometry(planetDistance, planetDistance + 0.05, 32);
      const orbitMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.05 });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2; // Make the orbit flat
      orbitLine.rotation.z = THREE.MathUtils.degToRad(inclination); // Apply inclination to the orbit

      // Offset the orbit line so it does not intersect with the planet
      orbitLine.position.y = (planetDistance * Math.sin(THREE.MathUtils.degToRad(inclination))) + 0.5;

      starMesh.add(orbitLine); // Add the orbit to the star mesh

      starMesh.add(planetMesh);

      planetMeshes.push({ planet, starMesh, mesh: planetMesh });

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
        if (isAnimating) {
          animatePlanet();
        }
      };
      animate();
    };

    const temperatureToColor = (temperature) => {
      let color;

      if (temperature < 3500) {
        color = new THREE.Color(0xff4500);
      } else if (temperature >= 3500 && temperature < 5000) {
        color = new THREE.Color(0xffd700);
      } else if (temperature >= 5000 && temperature < 6000) {
        color = new THREE.Color(0xffffff);
      } else if (temperature >= 6000) {
        color = new THREE.Color(0xadd8e6);
      }
      return color;
    };

    starData.starSystems.forEach(createStar);
    setPlanets(planetMeshes);

    // Post-processing with Bloom Effect
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);

    const animateScene = () => {
      requestAnimationFrame(animateScene);
      controls.update();
      composer.render(); // Use the composer to render with bloom effect
    };
    animateScene();

    // Reset camera view after 10 seconds if no interaction occurs
    const resetCameraAfterTimeout = () => {
      resetTimeoutRef.current = setTimeout(() => {
        resetCamera();
      }, 10000);
    };

    // Reset the timeout on user interaction
    const handleInteraction = () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetCameraAfterTimeout();
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    resetCameraAfterTimeout(); // Start the timer initially

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      clearTimeout(resetTimeoutRef.current); // Clear timeout on component unmount
    };
  }, [isAnimating]); // Re-run when the animation state changes

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
      setSelectedPlanet(selectedPlanet);
      createMarker(mesh.position);
    }
  };

  const createMarker = (position) => {
    const scene = sceneRef.current; // Access the scene from ref
    if (marker) {
      marker.geometry.dispose();
      marker.material.dispose();
      marker.parent.remove(marker);
    }

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

  const toggleAnimation = () => {
    setIsAnimating((prev) => !prev);
    if (!isAnimating) {
      // If we are starting the animation again, reset the reset timer
      resetCameraAfterTimeout();
    }
  };

  return (
    <>
      <div ref={mountRef}></div>
      <ExoplanetVisualizer starData={starData} onPlanetSelect={zoomToPlanet} />
      <TelescopeVisualizer starData={starData} onPlanetSelect={zoomToPlanet} />
      
      <button style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={toggleAnimation}>
        {isAnimating ? 'Pause Animation' : 'Resume Animation'}
      </button>

      {selectedPlanet && (
        <PlanetLabel 
          position={selectedPlanet.mesh.position} 
          name={selectedPlanet.planet.name} 
        />
      )}

      <button style={{ position: 'absolute', top: '60px', right: '20px' }} onClick={resetCamera}>
        Reset Camera
      </button>
    </>
  );
};

export default StarSystem;
