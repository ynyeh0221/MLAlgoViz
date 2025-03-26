import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LRSchedulerVisualization = () => {
  const [epochs, setEpochs] = useState(100);
  const [initialLR, setInitialLR] = useState(0.1);
  const [minLR, setMinLR] = useState(0.001);
  const [warmupEpochs, setWarmupEpochs] = useState(5);
  const [data, setData] = useState([]);
  const [selectedSchedulers, setSelectedSchedulers] = useState({
    constant: true,
    step: true,
    exponential: true,
    cosine: true,
    cyclicCosine: true,
    warmupCosine: true
  });
  
  const [cyclicRestarts, setCyclicRestarts] = useState(3);
  const [cyclicDecay, setCyclicDecay] = useState(0.5);

  // Calculate the learning rates for different schedulers
  useEffect(() => {
    const newData = [];
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      const progress = epoch / (epochs - 1);
      
      // Constant LR
      const constantLR = initialLR;
      
      // Step decay (reduce by factor of 0.1 every 30% of training)
      let stepLR = initialLR;
      if (progress > 0.3) stepLR = initialLR * 0.1;
      if (progress > 0.6) stepLR = initialLR * 0.01;
      if (progress > 0.9) stepLR = initialLR * 0.001;
      
      // Exponential decay (continuous)
      const exponentialLR = initialLR * Math.exp(-5 * progress);
      
      // Cosine annealing
      const cosineLR = minLR + 0.5 * (initialLR - minLR) * (1 + Math.cos(Math.PI * progress));
      
      // Cyclic cosine annealing (with warm restarts and decaying maximum)
      const cycleLength = epochs / cyclicRestarts;
      const cycleNumber = Math.floor(epoch / cycleLength);
      const cycleEpoch = epoch % cycleLength;
      const cycleProgress = cycleEpoch / cycleLength;
      
      // Calculate the maximum learning rate for this cycle (decreasing with each cycle)
      const cyclicMaxLR = initialLR * Math.pow(1 - cyclicDecay, cycleNumber);
      const cyclicCosineLR = minLR + 0.5 * (cyclicMaxLR - minLR) * (1 + Math.cos(Math.PI * cycleProgress));
      
      // Warmup + Cosine annealing
      let warmupCosineLR;
      if (epoch < warmupEpochs) {
        // Linear warmup
        warmupCosineLR = minLR + (initialLR - minLR) * (epoch / warmupEpochs);
      } else {
        // Cosine annealing after warmup
        const warmupProgress = (epoch - warmupEpochs) / (epochs - warmupEpochs - 1);
        warmupCosineLR = minLR + 0.5 * (initialLR - minLR) * (1 + Math.cos(Math.PI * warmupProgress));
      }
      
      newData.push({
        epoch,
        constant: constantLR,
        step: stepLR,
        exponential: exponentialLR,
        cosine: cosineLR,
        cyclicCosine: cyclicCosineLR,
        warmupCosine: warmupCosineLR,
      });
    }
    
    setData(newData);
  }, [epochs, initialLR, minLR, warmupEpochs, cyclicRestarts, cyclicDecay]);

  const handleCheckboxChange = (scheduler) => {
    setSelectedSchedulers({
      ...selectedSchedulers,
      [scheduler]: !selectedSchedulers[scheduler]
    });
  };

  const schedulerInfo = {
    constant: {
      name: "Constant Learning Rate",
      description: "Maintains the same learning rate throughout training. Simple to implement but often suboptimal for complex models.",
      pros: "Simple to implement. No hyperparameters to tune beyond initial value. Predictable behavior.",
      cons: "Often results in suboptimal convergence. May get stuck in local minima. May oscillate around the minimum if LR is too high.",
      color: "#8884d8"
    },
    step: {
      name: "Step Decay",
      description: "Reduces the learning rate by a factor at predetermined intervals (e.g., every 30 epochs).",
      pros: "Simple to implement. Helps convergence by reducing oscillations near minima. Widely used in practice.",
      cons: "Requires manual tuning of step timing and decay factor. Creates sudden changes in training dynamics.",
      color: "#82ca9d"
    },
    exponential: {
      name: "Exponential Decay",
      description: "Continuously reduces the learning rate exponentially according to training progress.",
      pros: "Smooth decay. Theoretically supported for convex optimization. Automatically reduces learning rate over time.",
      cons: "Decay may be too aggressive for some problems. Requires tuning of the decay rate.",
      color: "#ffc658"
    },
    cosine: {
      name: "Cosine Annealing",
      description: "Reduces learning rate following a cosine curve from initial value to minimum value.",
      pros: "Smooth transitions. Slows down gradually near the end of training. Often yields better generalization.",
      cons: "May not explore the loss landscape as effectively as cyclic schedules.",
      color: "#ff8042"
    },
      cyclicCosine: {
      name: "Cyclic Cosine Annealing (SGDR)",
      description: "Periodically reduces and resets LR following a cosine curve, with decaying maximum learning rate after each restart.",
      pros: "Better exploration of loss landscape. May escape poor local minima. Often achieves better final results. Simulates ensemble-like effects.",
      cons: "More hyperparameters to tune (restart frequency, decay factor). Can be unstable if restart schedule is poorly chosen.",
      color: "#8800ff"
    },
    warmupCosine: {
      name: "Warmup + Cosine Annealing",
      description: "Starts with a small LR that increases linearly during warmup, then follows cosine annealing.",
      pros: "Prevents early divergence in deep networks. Stabilizes early training phases. Widely used in transformers.",
      cons: "Adds extra hyperparameters (warmup period). May waste training iterations if warmup is too long.",
      color: "#ff3333"
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Learning Rate Scheduler Comparison</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2">
            Initial Learning Rate: {initialLR}
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={initialLR}
              onChange={(e) => setInitialLR(parseFloat(e.target.value))}
              className="w-full"
            />
          </label>
          
          <label className="block mb-2">
            Minimum Learning Rate: {minLR}
            <input
              type="range"
              min="0.00001"
              max="0.1"
              step="0.00001"
              value={minLR}
              onChange={(e) => setMinLR(parseFloat(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        
        <div>
          <label className="block mb-2">
            Total Epochs: {epochs}
            <input
              type="range"
              min="10"
              max="200"
              step="1"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              className="w-full"
            />
          </label>
          
          <label className="block mb-2">
            Warmup Epochs: {warmupEpochs}
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={warmupEpochs}
              onChange={(e) => setWarmupEpochs(parseInt(e.target.value))}
              className="w-full"
            />
          </label>
          
          <label className="block mb-2">
            Cyclic Restarts: {cyclicRestarts}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={cyclicRestarts}
              onChange={(e) => setCyclicRestarts(parseInt(e.target.value))}
              className="w-full"
            />
          </label>
          
          <label className="block mb-2">
            Cyclic Decay Factor: {cyclicDecay.toFixed(2)}
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={cyclicDecay}
              onChange={(e) => setCyclicDecay(parseFloat(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(schedulerInfo).map(scheduler => (
          <label key={scheduler} className="inline-flex items-center cursor-pointer mr-4">
            <input
              type="checkbox"
              checked={selectedSchedulers[scheduler]}
              onChange={() => handleCheckboxChange(scheduler)}
              className="mr-1"
            />
            <span style={{color: schedulerInfo[scheduler].color}} className="font-semibold">
              {schedulerInfo[scheduler].name}
            </span>
          </label>
        ))}
      </div>
      
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="epoch" 
              label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'Learning Rate', angle: -90, position: 'insideLeft' }}
              scale="log"
              domain={['auto', 'auto']} 
            />
            <Tooltip formatter={(value) => value.toExponential(4)} />
            <Legend />
            {Object.keys(schedulerInfo).map(scheduler => (
              selectedSchedulers[scheduler] && (
                <Line
                  key={scheduler}
                  type="monotone"
                  dataKey={scheduler}
                  name={schedulerInfo[scheduler].name}
                  stroke={schedulerInfo[scheduler].color}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Scheduler Details</h3>
        <div className="grid grid-cols-1 gap-4">
          {Object.keys(schedulerInfo).map(scheduler => (
            selectedSchedulers[scheduler] && (
              <div key={scheduler} className="border rounded p-3" style={{borderLeftColor: schedulerInfo[scheduler].color, borderLeftWidth: '4px'}}>
                <h4 className="font-bold" style={{color: schedulerInfo[scheduler].color}}>
                  {schedulerInfo[scheduler].name}
                </h4>
                <p className="text-sm mb-2">{schedulerInfo[scheduler].description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold text-green-600">Pros:</span> {schedulerInfo[scheduler].pros}
                  </div>
                  <div>
                    <span className="font-semibold text-red-600">Cons:</span> {schedulerInfo[scheduler].cons}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Why Use Learning Rate Warmup?</h3>
        <div className="border rounded p-3 bg-blue-50">
          <p className="mb-2">
            <strong>Learning rate warmup</strong> is essential for training stability, especially in deep or complex neural networks, for several reasons:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>Initialization issues:</strong> At the beginning of training, weights are randomly initialized and gradients can be large and unstable. A high learning rate can cause the model to diverge.
            </li>
            <li>
              <strong>Layer normalization calibration:</strong> In models with normalization layers (like transformers), these layers need some iterations to calibrate their statistics. A smaller learning rate gives them time to adjust.
            </li>
            <li>
              <strong>Gradient variance:</strong> Initially, gradients may have high variance. Starting with a small learning rate reduces the impact of noisy gradients.
            </li>
            <li>
              <strong>Adaptive optimizers:</strong> For optimizers like Adam that maintain parameter-specific learning rates, warmup allows moment estimates to accumulate before making large updates.
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Why Learning Rates Should Decrease Over Time</h3>
        <div className="border rounded p-3 bg-blue-50">
          <p className="mb-2">
            <strong>Decreasing learning rates</strong> over the course of training is fundamental to optimization success:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <strong>Convergence theory:</strong> Mathematical convergence guarantees for gradient descent require decreasing step sizes to reach the minimum of a function.
            </li>
            <li>
              <strong>Coarse-to-fine optimization:</strong> Early large steps help escape poor initial regions quickly, while later small steps allow precise fine-tuning.
            </li>
            <li>
              <strong>Loss landscape navigation:</strong> The loss landscape typically has large, flat regions far from minima and becomes more curved near good solutions. Adjusting step size appropriately improves navigation.
            </li>
            <li>
              <strong>Avoiding oscillation:</strong> Large learning rates can cause oscillation around minima rather than convergence. Decreasing the learning rate helps settle into good solutions.
            </li>
            <li>
              <strong>Generalization benefits:</strong> Research shows that models trained with decreasing learning rates often generalize better to unseen data than those with constant rates.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LRSchedulerVisualization;
