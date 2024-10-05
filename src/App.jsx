import React from 'react';
import './styles.css'; // Import the CSS file
import StarSystem from './components/StarSystem';

function App() {
  return (
    <div className="App">
      <div className="sidebar">
        <button onClick={() => alert('Button 1 clicked')}>Button 1</button>
        <button onClick={() => alert('Button 2 clicked')}>Button 2</button>
      </div>
      <div className="content">
        <h1>Exoplanet Star System Visualization</h1>
        <div id="star-system-container">
          <StarSystem />
        </div>
      </div>
    </div>
  );
}

export default App;