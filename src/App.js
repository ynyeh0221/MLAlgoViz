import React, { useState } from 'react';
import NeuralNetworkVisualization from './components/NeuralNetworkFunctionApproximator';
import VAEVisualizer from './components/VAEVisualizer';
import GradientDescent from './components/GradientDescentAtSaddlePoint';
import EpochAndBatch from './components/EpochAndBatchVisualization';
import EncoderDecoder from './components/EncoderDecoderVisualizer';
import HessianEigenvalue from './components/HessianAndEigenvalue';
import LearningRate from './components/LearningRate';

function App() {
  const [activeComponent, setActiveComponent] = useState('neural');
  
  // Button data array
  const buttons = [
    { id: 'neural', label: 'Function Approximation' },
    { id: 'vae', label: 'Variational Autoencoder' },
    { id: 'gd', label: 'Saddle Points' },
    { id: 'eb', label: 'Epochs & Batches' },
    { id: 'ed', label: 'Encoder-Decoder Models' },
    { id: 'hessian', label: 'Hessian & Eigenvalues' },
    { id: 'learningrate', label: 'Learning Rates' }
  ];
  
  // Button style generator function
  const getButtonStyle = (id) => ({
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: activeComponent === id ? '#007bff' : '#f0f0f0',
    color: activeComponent === id ? 'white' : 'black',
    cursor: 'pointer',
    fontWeight: activeComponent === id ? 'bold' : 'normal',
    transition: 'background-color 0.2s'
  });
  
  // Component mapping object
  const componentMap = {
    neural: <NeuralNetworkVisualization />,
    vae: <VAEVisualizer />,
    gd: <GradientDescent />,
    eb: <EpochAndBatch />,
    ed: <EncoderDecoder />,
    hessian: <HessianEigenvalue />,
    learningrate: <LearningRate />
  };
  
  return (
    <div className="App">
      <header style={{ 
        padding: '12px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #e0e0e0' 
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Machine Learning Algorithm Visualizer</div>
        <div className="tabs" style={{ 
          display: 'flex', 
          flexWrap: 'wrap',  
          gap: '10px',       
          justifyContent: 'flex-start'
        }}>
          {buttons.map(button => (
            <button 
              key={button.id}
              onClick={() => setActiveComponent(button.id)}
              style={getButtonStyle(button.id)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </header>
      
      <div style={{ padding: '20px' }}>
        {componentMap[activeComponent]}
      </div>
    </div>
  );
}

export default App;
