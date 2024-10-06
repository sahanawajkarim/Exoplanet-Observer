import React from 'react';
import './styles.css'; // Import the CSS file
import StarSystem from './components/StarSystem';



function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="App">

        <div className="content">
          
          <div id="star-system-container">
            <StarSystem />
            
          </div>

        </div>
      </div>
    </> 
  );
}

export default App;