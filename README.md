# ThreeJS Population Chart

Welcome to the ThreeJS Population Chart repository! This project demonstrates a 3D visualization of population data over time using Three.js. The chart visualizes demographic trends across 16 years (1996 to 2012) with an interactive 3D graph.

## Features

- **3D Visualization**: Displays population data in a 3D graph using Three.js.
- **Interactive Chart**: Allows users to interact with the chart and explore demographic trends.
- **Color-Coded Trends**: Uses color to indicate population sizes, with pink for lower populations and orange for higher populations.

## Live Demo

You can view the live demo of this project at: [ThreeJS Population Chart Demo](https://jenzhng.github.io/threejs-population-chart/)

## Installation

To run this project locally, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/jenzhng/threejs-population-chart.git
2. **Navigate to the Project Directory**

   ```bash
   cd threejs-population-chart
3. **Install Dependencies**
  This project uses npm for dependency management. Ensure you have Node.js and npm installed, then run:
   ```bash
   npm install
4. **Run the Project**
   Start a local development server to view the project:
   ```bash
   npm start

The application will be available at **`http://localhost:3000`**

## Usage

1. Open the Application: Navigate to **`http://localhost:3000`** in your web browser to view the 3D population chart.
2. Interact with the Chart: Use your mouse to rotate, zoom, and explore the 3D chart. Hover over different data points to see detailed information.

## Data Format

This project uses hierarchical JSON data for the treemap. Ensure your data follows this structure:
   ```json
