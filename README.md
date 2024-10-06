# Exoplanet Observer - 3D Visualization and Habitability Analyzer

**Developed by Team Planet Watchers**  
*Inspired by NASA and NASA Space Apps Challenge*


## What exactly does it do?

**Exoplanet Observer** is a comprehensive 3D visualizer app designed to explore exoplanets and determine their potential habitability. This interactive tool allows users to visualize distant planetary systems, calculate habitability based on various criteria, and gain insights into the exoplanets relative to Earth’s position. Our project is inspired by NASA’s ongoing search for habitable planets, providing users with a telescopic visualizer to explore selected exoplanets and simulate the view from these planets.

## How does it work?

1. **Data Extraction:**  
   We utilized exoplanet data from NASA's publicly accessible archive: [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PSCompPars). A CSV file was generated from this archive, containing detailed information on numerous exoplanets.

2. **Data Processing:**  
   After extracting the raw CSV file, we cleaned the dataset by selecting only the most relevant columns, such as exoplanet distances, radius, velocity, and host star characteristics. These columns were vital for building an effective 3D visualizer and determining potential habitability.

3. **Normalization & Conversion:**  
   We normalized various data points (e.g., distances, radii) to ensure uniformity in our visual representation. Then, the cleaned CSV data was converted into a `.json` format using Python. This JSON format feeds directly into the 3D visualizer, ensuring consistent and accurate rendering.

4. **3D Visualization using Three.js:**  
   We leveraged the Three.js library to generate 3D models of exoplanets and their systems. The visualization provides an immersive experience, allowing users to explore planetary systems and simulate their views through a telescopic interface.

5. **Habitability Calculation:**  
   Our tool provides a basic habitability score based on the exoplanet's distance from its host star, radius, and velocity. Earth serves as the reference for calculating this metric. Users can select a planet from a dropdown menu and analyze its habitability compared to Earth.

## What benefits does it have?

- **User-Friendly Visualization:**  
   The 3D component provides a compelling and engaging way to explore distant exoplanets. Users can interactively visualize entire planetary systems, understand their spatial relationships, and zoom in to see details.

- **Habitability Estimation:**  
   By calculating habitability metrics relative to Earth, we offer a tangible way for users to evaluate whether distant exoplanets could support life.

- **Telescopic Viewpoint Simulation:**  
   Users can visualize what a chosen exoplanet's view would look like, providing an immersive telescopic experience as though observing the universe from that exoplanet.

## What do you hope to achieve?

Our goal is to foster curiosity and exploration around exoplanetary research and space science. By visualizing exoplanet systems in 3D, we aim to:
- Support NASA's search for habitable exoplanets.
- Make complex astronomical data accessible and engaging for the public.
- Inspire future astronomers, scientists, and space enthusiasts to explore the cosmos.

## What tools, coding languages, hardware, or software did you use to develop the project?

- **Data Source:**  
  [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PSCompPars)

- **Programming Languages:**  
  - **Python:** For extracting and processing data from the CSV file, normalization, and conversion to `.json`.
  - **JavaScript (React + Three.js):** For building the front-end 3D visualizer and user interaction components.

- **Libraries and Frameworks:**  
  - **Three.js:** Used to create the 3D planetary models and visualizations.
  - **React:** To develop the interactive user interface and dynamic components.
  - **Pandas:** For data manipulation and cleaning.
  
- **Tools and Software:**  
  - **VS Code:** For development.
  - **GitHub:** For version control.
  - **Browser:** For running the app and testing the visualizations.

## Project Structure

```
Exoplanet-Observer/
│
├── public/
│   ├── index.html
│   └── ... (public assets)
│
├── src/
│   ├── components/
│   │   ├── PlanetVisualizer.js  # 3D visualization logic using Three.js
│   │   ├── DropdownMenu.js      # UI for selecting exoplanets
│   │   └── HabitabilityScore.js # Logic for calculating habitability
│   ├── data/
│   │   └── exoplanets.json      # Normalized data in JSON format
│   └── App.js                   # Main app logic
│
├── scripts/
│   └── csv_to_json.py            # Python script for CSV normalization and conversion
│
└── README.md
```

### How to Extract and Run the React App

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Exoplanet-Observer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

   The app will be hosted locally on `http://localhost:3000/`.

4. **View Exoplanets:**
   - Use the dropdown menu to select an exoplanet system.
   - Explore the 3D visualization of the planetary system.
   - Analyze the habitability score and observe the simulated telescopic viewpoint.

## Use of AI in the Project

We have integrated AI assistance to expedite development. By leveraging GitHub's **Copilot** and **ChatGPT**, we optimized our development process, gaining insights into specific coding issues, obtaining code references, and generating baseline code structures. This allowed us to focus on the core logic and visualization, reducing time spent on boilerplate code.

## Inspiration and Resources

The inspiration for this project came from **NASA** and the **NASA Space Apps Challenge**. Their continuous efforts in discovering habitable exoplanets encouraged us to develop this tool.

### Data and Resources Used:
- **NASA Exoplanet Archive**
- **Three.js Documentation**  
  (https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
- **React Documentation**  
  (https://reactjs.org/docs/getting-started.html)

### Acknowledgments

We thank NASA for their extensive data archives and continuous efforts in exoplanet research, providing the foundation for our project.

---

Feel free to replace the `<repository-url>` and adjust minor details to suit your needs. Let me know if you need more changes!