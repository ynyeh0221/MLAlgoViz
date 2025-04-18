import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Neural Network Visualization Component
const NeuralNetworkVisualization = () => {
  // Fixed network structure: 1 input, four hidden layers with architecture adjustments, 1 output
  const layers = [1, 12, 10, 8, 6, 1];
  
  // State variables
  const [weights, setWeights] = useState([]); // Network weights
  const [biases, setBiases] = useState([]); // Network biases
  const [learningRate, setLearningRate] = useState(0.05); // Learning rate
  const [epoch, setEpoch] = useState(0); // Current training epoch
  const [isTraining, setIsTraining] = useState(false); // Training status
  const [approximationData, setApproximationData] = useState([]); // Approximation function data
  const [targetData, setTargetData] = useState([]); // Target function data
  const [loss, setLoss] = useState(1.0); // Current loss

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const networkRef = useRef({ weights: [], biases: [] });

  // Initialize network
  useEffect(() => {
    initializeNetwork();
  }, []);

  // Initialize network weights and biases
  const initializeNetwork = () => {
    const newWeights = [];
    const newBiases = [];
    
    for (let i = 0; i < layers.length - 1; i++) {
      const layerWeights = [];
      const layerBiases = [];
      
      for (let j = 0; j < layers[i + 1]; j++) {
        const neuronWeights = [];
        for (let k = 0; k < layers[i]; k++) {
          // Initialize weights (using Xavier initialization)
          const stddev = Math.sqrt(1.0 / (layers[i] + layers[i + 1]));
          neuronWeights.push((Math.random() * 2 - 1) * stddev);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push((Math.random() * 2 - 1) * 0.05);
      }
      
      newWeights.push(layerWeights);
      newBiases.push(layerBiases);
    }
    
    // Update component state
    setWeights(newWeights);
    setBiases(newBiases);
    setEpoch(0);
    setLoss(1.0);
    
    // Also update reference to ensure always using latest weights
    networkRef.current = {
      weights: newWeights,
      biases: newBiases
    };
    
    // Generate initial data
    generateFunctionData(newWeights, newBiases);
  };

  // Generate target function data (more complex function with extended domain and higher boundary sampling)
  const generateFunctionData = (currentWeights, currentBiases) => {
    // Create two sets of samples:
    // 1. Regular samples across the domain
    // 2. Extra samples concentrated at boundaries
    
    const regularSamples = 40;
    const boundaryExtraSamples = 20; // Extra samples focused on boundaries
    const extendedDomain = 0.1 * Math.PI; // Extend domain by 10% of π
    
    const newTargetData = [];
    
    // Regular samples across the domain
    for (let i = 0; i < regularSamples; i++) {
      const x = -Math.PI - extendedDomain + ((2 * Math.PI + 2 * extendedDomain) * i) / (regularSamples - 1);
      
      // Complex target function: sin(x) + 0.5*sin(3x) * x^2/5
      const y = Math.sin(x) + 0.5 * Math.sin(3 * x) * (x * x / 5);
      
      newTargetData.push({ x, y, yApprox: 0 });
    }
    
    // Extra samples near left boundary
    for (let i = 0; i < boundaryExtraSamples / 2; i++) {
      const ratio = i / (boundaryExtraSamples / 2);
      const x = -Math.PI - extendedDomain + ratio * Math.PI * 0.4; // Focus on first 40% of left side
      
      const y = Math.sin(x) + 0.5 * Math.sin(3 * x) * (x * x / 5);
      newTargetData.push({ x, y, yApprox: 0 });
    }
    
    // Extra samples near right boundary
    for (let i = 0; i < boundaryExtraSamples / 2; i++) {
      const ratio = i / (boundaryExtraSamples / 2);
      const x = Math.PI * 0.6 + ratio * (Math.PI * 0.4 + extendedDomain); // Focus on last 40% of right side
      
      const y = Math.sin(x) + 0.5 * Math.sin(3 * x) * (x * x / 5);
      newTargetData.push({ x, y, yApprox: 0 });
    }
    
    setTargetData(newTargetData);
    
    // Calculate initial approximation function
    if (currentWeights && currentWeights.length > 0) {
      const newApproximationData = newTargetData.map(point => {
        const yApprox = forward([point.x], currentWeights, currentBiases)[0];
        return { x: point.x, y: point.y, yApprox };
      });
      
      setApproximationData(newApproximationData);
    }
  };

  // Forward propagation with SiLU (Swish) activation
  const forward = (input, currentWeights, currentBiases) => {
    let activation = [...input];
    const weights = currentWeights || networkRef.current.weights;
    const biases = currentBiases || networkRef.current.biases;
    
    for (let i = 0; i < weights.length; i++) {
      const layer = weights[i];
      const bias = biases[i];
      const newActivation = [];
      
      for (let j = 0; j < layer.length; j++) {
        const neuronWeights = layer[j];
        let sum = bias[j];
        
        for (let k = 0; k < neuronWeights.length; k++) {
          sum += neuronWeights[k] * activation[k];
        }
        
        // Use SiLU/Swish activation function (x * sigmoid(x)) for hidden layers
        if (i < weights.length - 1) {
          // SiLU/Swish: x * sigmoid(x)
          const sigmoid = 1 / (1 + Math.exp(-sum));
          newActivation.push(sum * sigmoid);
        } else {
          newActivation.push(sum); // No activation function for output layer
        }
      }
      
      activation = [...newActivation];
    }
    
    return activation;
  };

  // Backward propagation with SiLU derivative
  const backward = (input, target) => {
    const weights = networkRef.current.weights;
    const biases = networkRef.current.biases;
    
    // Forward pass and save activations and pre-activations for each layer
    const activations = [input]; // Outputs after activation
    const preActivations = []; // Inputs before activation
    let activation = [...input];
    
    for (let i = 0; i < weights.length; i++) {
      const layer = weights[i];
      const bias = biases[i];
      const newActivation = [];
      const preActivation = [];
      
      for (let j = 0; j < layer.length; j++) {
        const neuronWeights = layer[j];
        let sum = bias[j];
        
        for (let k = 0; k < neuronWeights.length; k++) {
          sum += neuronWeights[k] * activation[k];
        }
        
        preActivation.push(sum);
        
        // Use SiLU activation for hidden layers
        if (i < weights.length - 1) {
          const sigmoid = 1 / (1 + Math.exp(-sum));
          newActivation.push(sum * sigmoid);
        } else {
          newActivation.push(sum);
        }
      }
      
      preActivations.push(preActivation);
      activation = [...newActivation];
      activations.push(newActivation);
    }
    
    // Calculate output layer error
    const output = activations[activations.length - 1];
    const outputError = output.map((o, i) => o - target[i]);
    
    // Backpropagate error
    const deltas = [outputError];
    
    for (let i = weights.length - 1; i > 0; i--) {
      const currentDelta = deltas[0];
      const newDelta = [];
      
      for (let j = 0; j < layers[i]; j++) {
        let error = 0;
        
        for (let k = 0; k < currentDelta.length; k++) {
          error += currentDelta[k] * weights[i][k][j];
        }
        
        // SiLU/Swish derivative: sigmoid(x) + x*sigmoid(x)*(1-sigmoid(x))
        const x = preActivations[i-1][j];
        const sigmoid = 1 / (1 + Math.exp(-x));
        const derivative = sigmoid + x * sigmoid * (1 - sigmoid);
        
        newDelta.push(error * derivative);
      }
      
      deltas.unshift(newDelta);
    }
    
    // Create deep copies of weights and biases
    const newWeights = JSON.parse(JSON.stringify(weights));
    const newBiases = JSON.parse(JSON.stringify(biases));
    
    // Update weights and biases
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights[i].length; j++) {
        for (let k = 0; k < weights[i][j].length; k++) {
          const change = learningRate * deltas[i][j] * activations[i][k];
          newWeights[i][j][k] -= change;
        }
        
        newBiases[i][j] -= learningRate * deltas[i][j];
      }
    }
    
    // Update reference and state
    networkRef.current = {
      weights: newWeights,
      biases: newBiases
    };
    
    setWeights([...newWeights]);
    setBiases([...newBiases]);
    
    // Calculate mean squared error
    return outputError.reduce((sum, err) => sum + err * err, 0) / outputError.length;
  };

  // Train one epoch
  const trainEpoch = () => {
    let totalLoss = 0;
    
    // Randomly shuffle training data
    const shuffledData = [...targetData].sort(() => Math.random() - 0.5);
    
    // Mini-batch gradient descent
    const batchSize = 10;
    for (let i = 0; i < shuffledData.length; i += batchSize) {
      const batch = shuffledData.slice(i, Math.min(i + batchSize, shuffledData.length));
      
      batch.forEach(point => {
        const error = backward([point.x], [point.y]);
        totalLoss += error;
      });
    }
    
    totalLoss /= shuffledData.length;
    
    // Update approximation function data
    const newApproximationData = targetData.map(point => {
      const yApprox = forward([point.x], networkRef.current.weights, networkRef.current.biases)[0];
      return { x: point.x, y: point.y, yApprox };
    });
    
    // Update UI state
    setApproximationData([...newApproximationData]);
    setLoss(totalLoss);
    setEpoch(prev => prev + 1);
    
    // For more complex functions, allow more training epochs before stopping
    return (totalLoss < 0.0001 && epoch >= 300) || epoch >= 2000;
  };

  // Start training
  const startTraining = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    let frameCount = 0;
    
    const train = () => {
      frameCount++;
      
      // Execute training every few frames to avoid UI blocking
      if (frameCount % 3 === 0) {
        const converged = trainEpoch();
        
        if (converged || epoch >= 1000) {
          setIsTraining(false);
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(train);
    };
    
    animationRef.current = requestAnimationFrame(train);
  };

  // Stop training
  const stopTraining = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsTraining(false);
  };

  // Reset network
  const resetNetwork = () => {
    stopTraining();
    initializeNetwork();
  };

  // Draw neural network
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Adjust canvas size for better visibility
    canvas.width = 700; // Increase canvas width
    canvas.height = 500; // Increase canvas height
    
    const margin = 70; // Increased margin
    const width = canvas.width - 2 * margin;
    const height = canvas.height - 2 * margin;
    
    const layerSpacing = width / (layers.length - 1);
    const neuronRadius = 12; // Reduced neuron radius
    
    // Calculate minimum spacing needed for each layer
    const minSpacingNeeded = layers.map(neurons => {
      // At least 2.5 * neuron diameter between centers to avoid overlap
      return neuronRadius * 5;
    });
    
    // Calculate actual spacing based on available height and neurons
    const neuronSpacings = layers.map((neurons, i) => {
      const idealSpacing = height / (neurons);
      // Use at least minimum spacing or ideal spacing, whichever is larger
      return Math.max(minSpacingNeeded[i], idealSpacing);
    });
    
    // Calculate layer heights
    const layerHeights = layers.map((neurons, i) => (neurons - 1) * neuronSpacings[i]);
    
    // Select current data sample for display
    const sampleIndex = epoch % targetData.length;
    const currentSample = targetData[sampleIndex] || { x: 0, y: 0 };
    
    // Calculate network output for current sample
    const currentOutput = approximationData[sampleIndex]?.yApprox || 0;
    
    // Draw neurons and connections
    for (let i = 0; i < layers.length; i++) {
      const layerNeurons = layers[i];
      const layerHeight = layerHeights[i];
      const startY = margin + (height - layerHeight) / 2;
      
      // Draw connections first (so neurons are drawn on top)
      if (i > 0) {
        const prevLayerNeurons = layers[i - 1];
        const prevLayerHeight = layerHeights[i - 1];
        const prevStartY = margin + (height - prevLayerHeight) / 2;
        const prevSpacing = neuronSpacings[i-1];
        const currentSpacing = neuronSpacings[i];
        
        for (let j = 0; j < layerNeurons; j++) {
          const x = margin + i * layerSpacing;
          const y = startY + j * currentSpacing;
          
          for (let k = 0; k < prevLayerNeurons; k++) {
            const prevX = margin + (i - 1) * layerSpacing;
            const prevY = prevStartY + k * prevSpacing;
            
            // Set connection color and width based on weight
            if (networkRef.current.weights.length > 0 && i - 1 < networkRef.current.weights.length) {
              const w = networkRef.current.weights[i - 1][j] ? networkRef.current.weights[i - 1][j][k] || 0 : 0;
              const absW = Math.abs(w);
              
              // Only draw connections with significant weights
              if (absW > 0.05) {
                // Weight color: green for positive, red for negative
                const weightColor = w > 0 ? `rgba(0, 128, 0, ${Math.min(absW, 1)})` : `rgba(255, 0, 0, ${Math.min(absW, 1)})`;
                
                // Weight width: thicker for larger absolute values
                const weightWidth = 0.5 + 2 * Math.min(absW, 1);
                
                ctx.beginPath();
                ctx.moveTo(prevX + neuronRadius, prevY);
                ctx.lineTo(x - neuronRadius, y);
                ctx.strokeStyle = weightColor;
                ctx.lineWidth = weightWidth;
                ctx.stroke();
                
                // Only show weight values for significant weights
                if (absW > 0.3) {
                  // Show weight value
                  const midX = (prevX + neuronRadius + x - neuronRadius) / 2;
                  const midY = (prevY + y) / 2;
                  
                  // White background for text clarity
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                  const textWidth = ctx.measureText(w.toFixed(2)).width;
                  ctx.fillRect(midX - textWidth/2 - 2, midY - 7, textWidth + 4, 14);
                  
                  ctx.fillStyle = '#000000';
                  ctx.font = '9px Arial';
                  ctx.fillText(w.toFixed(2), midX, midY);
                }
              }
            }
          }
        }
      }
      
      // Now draw neurons on top of connections
      for (let j = 0; j < layerNeurons; j++) {
        const x = margin + i * layerSpacing;
        const y = startY + j * neuronSpacings[i];
        
        // Draw neuron
        ctx.beginPath();
        ctx.arc(x, y, neuronRadius, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? '#88CCEE' : i === layers.length - 1 ? '#DDCC77' : '#44AA99';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Show neuron number
        ctx.fillStyle = '#000000';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i+1}-${j+1}`, x, y);
        
        // Show input/output values - fixed position and display
        if (i === 0) { // Input layer
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'right';
          
          // Add background for better text clarity
          const inputText = `Input x: ${currentSample.x.toFixed(2)}`;
          const textWidth = ctx.measureText(inputText).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x - neuronRadius - 8 - textWidth, y - 7, textWidth + 4, 14);
          
          ctx.fillStyle = '#000000';
          ctx.fillText(inputText, x - neuronRadius - 8, y);
        } else if (i === layers.length - 1) { // Output layer
          // Add background box for output
          const outputText = `Output: ${currentOutput.toFixed(2)}`;
          const targetText = `Target: ${currentSample.y.toFixed(2)}`;
          
          const outputWidth = ctx.measureText(outputText).width;
          const targetWidth = ctx.measureText(targetText).width;
          const maxWidth = Math.max(outputWidth, targetWidth);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x + neuronRadius + 8, y - 15, maxWidth + 8, 30);
          
          ctx.fillStyle = '#0000AA';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(outputText, x + neuronRadius + 12, y - 5);
          
          ctx.fillStyle = '#AA0000';
          ctx.fillText(targetText, x + neuronRadius + 12, y + 10);
        }
      }
    }
  }, [weights, epoch, targetData, approximationData]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Render component
  return (
    <div className="w-full p-4 bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">Neural Network Learning Visualization (Complex Function)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Control Panel</h3>
          
          <div className="mb-4">
            <p className="text-sm mb-2">Network Structure: 1-12-10-8-6-1 (fixed, pyramid architecture)</p>
            <label className="block text-sm font-medium mb-1">Learning Rate: {learningRate.toFixed(3)}</label>
            <input
              type="range"
              min="0.001"
              max="0.2"
              step="0.001"
              value={learningRate}
              onChange={e => setLearningRate(parseFloat(e.target.value))}
              className="w-full"
              disabled={isTraining}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={isTraining ? stopTraining : startTraining}
              className={`px-4 py-2 rounded ${isTraining ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium`}
            >
              {isTraining ? 'Stop Training' : 'Start Training'}
            </button>
            
            <button
              onClick={resetNetwork}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded"
              disabled={isTraining}
            >
              Reset Network
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-sm">Current Epoch: <span className="font-semibold">{epoch}</span></p>
            <p className="text-sm">Current Loss: <span className="font-semibold">{loss.toFixed(6)}</span></p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Network Structure Visualization</h3>
          <div className="border rounded bg-white">
            <canvas ref={canvasRef} width="500" height="300" className="w-full h-64" />
          </div>
          <p className="text-xs mt-1 text-gray-500">Colors represent weights: green for positive, red for negative. Line thickness indicates weight magnitude.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Function Approximation</h3>
        <div className="border rounded bg-white">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              data={approximationData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                label={{ value: 'x', position: 'bottom', offset: 0 }}
                domain={[-Math.PI * 1.1, Math.PI * 1.1]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <YAxis
                label={{ value: 'y', angle: -90, position: 'left', offset: -5 }}
                domain={[-2, 2]}
              />
              <Tooltip formatter={(value, name) => [value.toFixed(4), name]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="y"
                name="Target Function"
                stroke="#8884d8"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="yApprox"
                name="Approximation Function"
                stroke="#82ca9d"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm">
          <p><span className="inline-block w-4 h-2 bg-purple-500 mr-1"></span> Target Function: sin(x) + 0.5*sin(3x) * x²/5</p>
          <p><span className="inline-block w-4 h-2 bg-green-500 mr-1"></span> Approximation Function: Current network output</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Training Data and Backpropagation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-1">Training Data Generation</h4>
            <p className="text-sm mb-1">How training data is created:</p>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li>Sample 50 x values uniformly in range [-π, π]</li>
              <li>For each x, calculate y = sin(x) as the target</li>
              <li>These (x, y) pairs form the training dataset</li>
              <li>During training, samples are randomly selected</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-1">Backpropagation Process</h4>
            <p className="text-sm">
              Backpropagation is the core learning algorithm for neural networks:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Green/red connections show weight values and changes</li>
              <li>Input node displays current sample's x value</li>
              <li>Output node shows both network output and target value</li>
              <li>As training progresses, the approximation function (green line) gets closer to the target function (purple line)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualization;
