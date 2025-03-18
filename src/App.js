import React from 'react';
import './App.css';

// Import this if your component exists
// import NeuralNetworkFunctionApproximator from './components/NeuralNetworkFunctionApproximator';

// Fallback implementation if component file doesn't exist yet
const NeuralNetworkFunctionApproximator = () => {
  return (
    <div>
      <h2>Neural Network Visualization</h2>
      <p>The neural network visualization will appear here.</p>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Neural Network Function Approximator</h1>
      </header>
      <main>
        <NeuralNetworkFunctionApproximator />
      </main>
      <footer>
        <p>Created for neural network visualization</p>
      </footer>
    </div>
  );
}

export default App;
