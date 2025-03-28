import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CosineAnnealingWarmRestartsVisualization = () => {
  const [T_0, setT_0] = useState(20);
  const [T_mult, setT_mult] = useState(2);
  const [eta_min, setEta_min] = useState(0);
  const [eta_max, setEta_max] = useState(0.1);
  const [epochs, setEpochs] = useState(100);

  // Function to calculate cosine annealing with warm restarts
  const calculateLR = () => {
    const data = [];
    let current_T_0 = T_0;
    let iteration = 0;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      // Find the cycle and where we are in the cycle
      let cycle_start = 0;
      let cycle_length = current_T_0;
      
      while (epoch >= cycle_start + cycle_length) {
        cycle_start += cycle_length;
        cycle_length = Math.floor(cycle_length * T_mult);
      }
      
      const cycle_epoch = epoch - cycle_start;
      const lr = eta_min + 0.5 * (eta_max - eta_min) * (1 + Math.cos(Math.PI * cycle_epoch / cycle_length));
      
      data.push({
        epoch,
        lr,
      });
    }
    
    return data;
  };

  const data = calculateLR();

  const handleT0Change = (e) => {
    const value = parseInt(e.target.value, 10);
    setT_0(value > 0 ? value : 1);
  };

  const handleTMultChange = (e) => {
    const value = parseFloat(e.target.value);
    setT_mult(value >= 1 ? value : 1);
  };

  const handleEtaMinChange = (e) => {
    const value = parseFloat(e.target.value);
    setEta_min(value >= 0 ? value : 0);
  };

  const handleEtaMaxChange = (e) => {
    const value = parseFloat(e.target.value);
    setEta_max(value > 0 ? value : 0.001);
  };

  const handleEpochsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setEpochs(value > 0 ? value : 1);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">CosineAnnealingWarmRestarts Learning Rate Scheduler</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          This visualization demonstrates how PyTorch's CosineAnnealingWarmRestarts scheduler works. 
          The scheduler reduces the learning rate following a cosine curve and then restarts it periodically.
        </p>
        <p className="text-gray-700 mb-4">
          The T_0 parameter controls the first restart period, T_mult scales the restart period after each restart,
          and eta_min/eta_max control the learning rate range.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">T_0 (Initial cycle)</label>
          <input
            type="number"
            value={T_0}
            onChange={handleT0Change}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">T_mult (Cycle multiplier)</label>
          <input
            type="number"
            value={T_mult}
            onChange={handleTMultChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="1"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum LR (eta_min)</label>
          <input
            type="number"
            value={eta_min}
            onChange={handleEtaMinChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="0"
            step="0.001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maximum LR (eta_max)</label>
          <input
            type="number"
            value={eta_max}
            onChange={handleEtaMaxChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="0.001"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Epochs</label>
          <input
            type="number"
            value={epochs}
            onChange={handleEpochsChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="1"
            max="1000"
          />
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="epoch" 
              label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'Learning Rate', angle: -90, position: 'insideLeft' }} 
              domain={[0, Math.max(eta_max * 1.1, 0.001)]}
            />
            <Tooltip formatter={(value) => value.toFixed(5)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="lr" 
              name="Learning Rate" 
              stroke="#3182ce" 
              dot={false} 
              activeDot={{ r: 8 }} 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">How It Works</h3>
        <p className="text-gray-700 mb-2">
          CosineAnnealingWarmRestarts follows a cosine function that gradually reduces the learning rate from 
          eta_max to eta_min, then jumps back to eta_max at regular intervals (restarts).
        </p>
        <p className="text-gray-700 mb-2">
          The first restart occurs after T_0 epochs. Each subsequent restart cycle is T_mult times longer 
          than the previous one when T_mult > 1, creating increasingly longer periods between restarts.
        </p>
        <p className="text-gray-700">
          This helps the model escape local minima through the periodic restarts while benefiting from 
          lower learning rates for fine-tuning in between.
        </p>
      </div>
    </div>
  );
};

export default CosineAnnealingWarmRestartsVisualization;
