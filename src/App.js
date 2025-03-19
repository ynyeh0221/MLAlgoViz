import React from 'react';
import './App.css';
import NeuralNetworkFunctionApproximator from './components/NeuralNetworkFunctionApproximator';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Neural Network Function Approximation</h1>
      </header>
      <main className="App-main">
        <NeuralNetworkFunctionApproximator />
      </main>
      <footer className="App-footer">
        <p>Created with React</p>
      </footer>
    </div>
  );
}

export default App;
