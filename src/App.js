import React, { useState } from 'react';
import NeuralNetworkVisualization from './components/NeuralNetworkFunctionApproximator';
import VAEVisualizer from './components/VAEVisualizer';

function App() {
  const [activeComponent, setActiveComponent] = useState('neural');
  
  return (
    <div className="App">
      <div className="tabs">
        <button onClick={() => setActiveComponent('neural')}>Neural Network Function Approximator</button>
        <button onClick={() => setActiveComponent('another')}>VAE Visualizer</button>
      </div>
      
      {activeComponent === 'neural' && <NeuralNetworkVisualization />}
      {activeComponent === 'another' && <VAEVisualizer />}
    </div>
  );
}

export default App;
