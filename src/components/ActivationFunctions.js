import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ActivationFunctionsExplorer = () => {
  const [viewMode, setViewMode] = useState('function'); // 'function' or 'derivative'
  const [selectedFunctions, setSelectedFunctions] = useState(['relu', 'sigmoid', 'tanh']);
  const [dataPoints, setDataPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('pros');
  
  // Define activation functions and their properties
  const activationFunctions = {
    sigmoid: {
      name: 'Sigmoid',
      formula: 'σ(x) = 1 / (1 + e^(-x))',
      function: (x) => 1 / (1 + Math.exp(-x)),
      derivative: (x) => {
        const sigmoid = 1 / (1 + Math.exp(-x));
        return sigmoid * (1 - sigmoid);
      },
      color: '#8884d8',
      range: '(0, 1)',
      pros: [
        'Smooth and differentiable everywhere',
        'Output bounded between 0 and 1',
        'Good for binary classification output layers'
      ],
      cons: [
        'Suffers from vanishing gradient problem',
        'Not zero-centered',
        'Computationally expensive'
      ],
      whenToUse: [
        'Binary classification (output layer)',
        'When bounded output between 0 and 1 is needed'
      ]
    },
    tanh: {
      name: 'Tanh',
      formula: 'tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))',
      function: (x) => Math.tanh(x),
      derivative: (x) => 1 - Math.pow(Math.tanh(x), 2),
      color: '#82ca9d',
      range: '(-1, 1)',
      pros: [
        'Zero-centered (outputs between -1 and 1)',
        'Stronger gradients than sigmoid',
        'Better convergence than sigmoid'
      ],
      cons: [
        'Still suffers from vanishing gradient problem',
        'Saturates at extreme values'
      ],
      whenToUse: [
        'Hidden layers in neural networks',
        'When zero-centered activation is needed',
        'Recurrent neural networks'
      ]
    },
    relu: {
      name: 'ReLU',
      formula: 'f(x) = max(0, x)',
      function: (x) => Math.max(0, x),
      derivative: (x) => x > 0 ? 1 : 0,
      color: '#ff7300',
      range: '[0, ∞)',
      pros: [
        'Computationally efficient',
        'No vanishing gradient for positive inputs',
        'Converges faster than sigmoid/tanh'
      ],
      cons: [
        '"Dying ReLU" problem',
        'Not zero-centered',
        'Unbounded output'
      ],
      whenToUse: [
        'Default choice for hidden layers in CNNs',
        'When computational efficiency is important',
        'Deep networks'
      ]
    },
    leakyRelu: {
      name: 'Leaky ReLU',
      formula: 'f(x) = max(αx, x), where α = 0.01',
      function: (x) => Math.max(0.01 * x, x),
      derivative: (x) => x > 0 ? 1 : 0.01,
      color: '#ff8e00',
      range: '(-∞, ∞)',
      pros: [
        'Prevents "dying ReLU" problem',
        'Allows negative values to contribute',
        'Computationally efficient'
      ],
      cons: [
        'Not zero-centered',
        'α is a hyperparameter that needs tuning'
      ],
      whenToUse: [
        'When you want to avoid dying ReLU problem',
        'Deep networks with potential negative activations'
      ]
    },
    prelu: {
      name: 'PReLU',
      formula: 'f(x) = max(αx, x), where α is learnable',
      function: (x) => Math.max(0.1 * x, x), // Using 0.1 as example α
      derivative: (x) => x > 0 ? 1 : 0.1,    // Using 0.1 as example α
      color: '#ff9e00',
      range: '(-∞, ∞)',
      pros: [
        'Adaptive negative slope (α is learned)',
        'Can outperform ReLU and Leaky ReLU',
        'Mitigates dying ReLU problem'
      ],
      cons: [
        'Additional parameters to learn',
        'Can overfit small datasets',
        'Not zero-centered'
      ],
      whenToUse: [
        'When you have sufficient data to learn α',
        'When performance is critical',
        'When dying ReLU is an issue'
      ]
    },
    elu: {
      name: 'ELU',
      formula: 'f(x) = x if x > 0, α(e^x - 1) if x ≤ 0',
      function: (x) => x > 0 ? x : 1 * (Math.exp(x) - 1),
      derivative: (x) => x > 0 ? 1 : 1 * Math.exp(x),
      color: '#ff4500',
      range: '(-α, ∞)',
      pros: [
        'Smooth function with negative values',
        'Closer to zero-mean activations',
        'Reduces "bias shift"'
      ],
      cons: [
        'Computationally more expensive than ReLU',
        'Can produce negative outputs'
      ],
      whenToUse: [
        'When you want benefits of both ReLU and negative values',
        'Deep networks that need regularizing effects'
      ]
    },
    selu: {
      name: 'SELU',
      formula: 'f(x) = λ * (x if x > 0, α(e^x - 1) if x ≤ 0)',
      function: (x) => {
        const lambda = 1.0507;
        const alpha = 1.67326;
        return x > 0 ? lambda * x : lambda * alpha * (Math.exp(x) - 1);
      },
      derivative: (x) => {
        const lambda = 1.0507;
        const alpha = 1.67326;
        return x > 0 ? lambda : lambda * alpha * Math.exp(x);
      },
      color: '#9932cc',
      range: 'Self-norm',
      pros: [
        'Self-normalizing (preserves mean/variance)',
        'Helps with vanishing/exploding gradients',
        'Can eliminate need for batch normalization'
      ],
      cons: [
        'Requires specific weight initialization',
        'Works best when used for all layers',
        'Less established than ReLU/ELU'
      ],
      whenToUse: [
        'Fully Connected Neural Networks',
        'When you want to avoid batch normalization',
        'Deep networks requiring normalization'
      ]
    },
    swish: {
      name: 'Swish',
      formula: 'f(x) = x * sigmoid(x)',
      function: (x) => x * (1 / (1 + Math.exp(-x))),
      derivative: (x) => {
        const sigmoid = 1 / (1 + Math.exp(-x));
        return sigmoid + x * sigmoid * (1 - sigmoid);
      },
      color: '#20b2aa',
      range: 'Unbounded',
      pros: [
        'Often outperforms ReLU in deep networks',
        'Smooth function with non-monotonic shape',
        'Works well with normalization techniques'
      ],
      cons: [
        'Computationally more expensive than ReLU',
        'Relatively new and less established'
      ],
      whenToUse: [
        'Deep neural networks',
        'Modern architectures like transformers',
        'When seeking potentially better performance than ReLU'
      ]
    },
    gelu: {
      name: 'GELU',
      formula: 'f(x) = x * Φ(x)',
      // Approximation: 0.5x * (1 + tanh(√(2/π) * (x + 0.044715x^3)))
      function: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
      derivative: (x) => {
        const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3));
        const dtanh = 1 - Math.pow(Math.tanh(inner), 2);
        const dinner = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * Math.pow(x, 2));
        return 0.5 * (1 + Math.tanh(inner)) + 0.5 * x * dtanh * dinner;
      },
      color: '#4682b4',
      range: 'Unbounded',
      pros: [
        'Used in modern transformers (BERT, GPT)',
        'Smooth non-monotonic shape',
        'Strong empirical performance'
      ],
      cons: [
        'Computationally more expensive than ReLU',
        'More complex to implement efficiently',
        'Less intuitive than simpler activations'
      ],
      whenToUse: [
        'Modern transformer architectures',
        'NLP models',
        'When seeking state-of-the-art performance'
      ]
    },
    softmax: {
      name: 'Softmax',
      formula: 'softmax(x_i) = e^(x_i) / Σ_j e^(x_j)',
      function: (x) => Math.exp(x) / 10, // Simplified for visualization
      derivative: (x) => Math.exp(x) / 10 * (1 - Math.exp(x) / 10), // Simplified
      color: '#dc143c',
      range: '(0,1), sum=1',
      pros: [
        'Converts values to probability distribution',
        'Outputs sum to 1 across all classes',
        'Good for multi-class classification'
      ],
      cons: [
        'Only meaningful for multiple outputs',
        'Can have numerical stability issues',
        'Computationally expensive'
      ],
      whenToUse: [
        'Multi-class classification output layers',
        'When probabilistic interpretation is needed',
        'Final layer of classification networks'
      ]
    }
  };

  // Generate data points for plotting
  useEffect(() => {
    const min = -5, max = 5;
    const step = (max - min) / 200;
    const points = [];

    for (let x = min; x <= max; x += step) {
      const point = { x: parseFloat(x.toFixed(2)) };
      
      Object.entries(activationFunctions).forEach(([key, func]) => {
        try {
          if (viewMode === 'function') {
            point[key] = func.function(x);
          } else {
            point[key] = func.derivative(x);
          }
          
          // Handle infinity and NaN
          if (!isFinite(point[key]) || isNaN(point[key])) {
            point[key] = null;
          }
        } catch (error) {
          point[key] = null;
        }
      });
      
      points.push(point);
    }
    
    setDataPoints(points);
  }, [viewMode]);

  // Toggle function selection
  const toggleFunction = (funcKey) => {
    if (selectedFunctions.includes(funcKey)) {
      setSelectedFunctions(selectedFunctions.filter(key => key !== funcKey));
    } else {
      setSelectedFunctions([...selectedFunctions, funcKey]);
    }
  };

  // Function to render a table row for an activation function
  const renderFunctionTableRow = (key, func) => (
    <tr key={key}>
      <td className="px-3 py-2 border-r">
        <div className="font-medium" style={{color: func.color}}>{func.name}</div>
        <div className="text-gray-500">{func.formula}</div>
      </td>
      <td className="px-3 py-2 border-r">{func.range}</td>
      <td className="px-3 py-2 border-r">
        <ul className="list-disc pl-4">
          {func.pros.map((pro, idx) => (
            <li key={idx}>{pro}</li>
          ))}
        </ul>
      </td>
      <td className="px-3 py-2">
        <ul className="list-disc pl-4">
          {func.cons.map((con, idx) => (
            <li key={idx}>{con}</li>
          ))}
        </ul>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="w-full border rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Neural Network Activation Functions Explorer</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative inline-block w-10 h-5">
                <input
                  type="checkbox"
                  id="viewMode"
                  className="opacity-0 w-0 h-0"
                  checked={viewMode === 'derivative'}
                  onChange={(e) => setViewMode(e.target.checked ? 'derivative' : 'function')}
                />
                <span 
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                    viewMode === 'derivative' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span 
                    className={`absolute h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                      viewMode === 'derivative' ? 'transform translate-x-5' : 'transform translate-x-0.5'
                    }`} 
                    style={{top: '2px'}}
                  />
                </span>
              </div>
              <label htmlFor="viewMode" className="ml-2 cursor-pointer">
                {viewMode === 'function' ? 'Show Function' : 'Show Derivative'}
              </label>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dataPoints} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[-5, 5]}
                      tickCount={11}
                      label={{ value: 'x', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis 
                      domain={[-2, 2]} 
                      tickCount={9}
                      label={{ value: viewMode === 'function' ? 'f(x)' : 'f\'(x)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [value?.toFixed(4), activationFunctions[name]?.name || name]}
                      labelFormatter={(label) => `x = ${label}`}
                    />
                    <Legend 
                      onClick={(e) => toggleFunction(e.dataKey)}
                      wrapperStyle={{ paddingTop: '10px' }}
                      formatter={(value, entry) => {
                        const funcKey = entry.dataKey;
                        return activationFunctions[funcKey]?.name || value;
                      }}
                    />
                    {selectedFunctions.map(funcKey => (
                      <Line
                        key={funcKey}
                        type="monotone"
                        dataKey={funcKey}
                        stroke={activationFunctions[funcKey].color}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(activationFunctions).map(([key, func]) => (
                    <button
                      key={key}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                        selectedFunctions.includes(key) 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                      onClick={() => toggleFunction(key)}
                      style={{ 
                        borderColor: selectedFunctions.includes(key) ? undefined : func.color,
                        color: selectedFunctions.includes(key) ? undefined : func.color 
                      }}
                    >
                      {func.name}
                    </button>
                  ))}
                </div>
                
                {selectedFunctions.length === 1 && (
                  <div className="mt-4 border rounded-lg shadow-sm">
                    <div className="p-3 border-b">
                      <h3 className="text-md font-medium">{activationFunctions[selectedFunctions[0]].name}</h3>
                    </div>
                    <div className="p-4 text-sm">
                      <p className="font-mono mb-2">{activationFunctions[selectedFunctions[0]].formula}</p>
                      
                      <div className="border-b mb-2">
                        <div className="flex space-x-2 mb-2">
                          <button 
                            className={`px-3 py-1 rounded-t-md ${activeTab === 'pros' ? 'bg-blue-100 border-b-2 border-blue-500' : 'hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('pros')}
                          >
                            Pros
                          </button>
                          <button 
                            className={`px-3 py-1 rounded-t-md ${activeTab === 'cons' ? 'bg-blue-100 border-b-2 border-blue-500' : 'hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('cons')}
                          >
                            Cons
                          </button>
                          <button 
                            className={`px-3 py-1 rounded-t-md ${activeTab === 'when' ? 'bg-blue-100 border-b-2 border-blue-500' : 'hover:bg-gray-100'}`}
                            onClick={() => setActiveTab('when')}
                          >
                            When to Use
                          </button>
                        </div>
                      </div>
                      
                      {activeTab === 'pros' && (
                        <ul className="list-disc pl-4 space-y-1">
                          {activationFunctions[selectedFunctions[0]].pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      )}
                      
                      {activeTab === 'cons' && (
                        <ul className="list-disc pl-4 space-y-1">
                          {activationFunctions[selectedFunctions[0]].cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                          ))}
                        </ul>
                      )}
                      
                      {activeTab === 'when' && (
                        <ul className="list-disc pl-4 space-y-1">
                          {activationFunctions[selectedFunctions[0]].whenToUse.map((use, idx) => (
                            <li key={idx}>{use}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedFunctions.length !== 1 && (
                  <div className="mt-4 p-4 border rounded-md bg-gray-50 text-center text-sm">
                    Select a single activation function to see detailed information.
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="font-medium mb-4 text-center">Activation Functions Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Function</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Range</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Key Pros</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Cons</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-xs">
                    {Object.entries(activationFunctions).map(([key, func]) => 
                      renderFunctionTableRow(key, func)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border rounded-lg shadow-sm p-4 bg-blue-50">
        <h3 className="font-medium mb-2">Activation Functions Evolution Timeline</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-300"></div>
          
          {/* Timeline entries */}
          <div className="grid grid-cols-2 gap-4">
            {/* 1940s-50s */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">1940s-50s</div>
              <div>Linear & Step Functions</div>
            </div>
            <div className="pl-4 py-4">
              <div>First neural networks used simple threshold/step functions</div>
              <div className="text-gray-600 text-sm">Problem: Not differentiable</div>
            </div>
            
            {/* 1970s-80s */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">1970s-80s</div>
              <div className="text-purple-700">Sigmoid & Tanh</div>
            </div>
            <div className="pl-4 py-4">
              <div>Smooth, differentiable activation functions</div>
              <div className="text-gray-600 text-sm">Problem: Vanishing gradient in deep networks</div>
            </div>
            
            {/* 2010 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2010</div>
              <div className="text-orange-500">ReLU</div>
            </div>
            <div className="pl-4 py-4">
              <div>Simplified, faster computation, no vanishing gradient for positive inputs</div>
              <div className="text-gray-600 text-sm">Problem: "Dying ReLU" - neurons can permanently die during training</div>
            </div>
            
            {/* 2013 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2013</div>
              <div className="text-orange-600">Leaky ReLU</div>
            </div>
            <div className="pl-4 py-4">
              <div>Allows small negative values (α*x) to prevent dying neurons</div>
              <div className="text-gray-600 text-sm">Problem: α hyperparameter needs tuning</div>
            </div>
            
            {/* 2015 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2015</div>
              <div className="text-orange-700">PReLU</div>
            </div>
            <div className="pl-4 py-4">
              <div>Makes the α parameter learnable rather than fixed</div>
              <div className="text-gray-600 text-sm">Problem: Additional parameters, can overfit</div>
            </div>
            
            {/* 2015 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2015</div>
              <div className="text-red-500">ELU</div>
            </div>
            <div className="pl-4 py-4">
              <div>Introduced by Clevert et al., smooth negative values with saturation</div>
              <div className="text-gray-600 text-sm">Problem: Computationally more expensive than ReLU</div>
            </div>
            
            {/* 2016 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2016</div>
              <div className="text-blue-500">GELU</div>
            </div>
            <div className="pl-4 py-4">
              <div>Combines properties from ReLU and dropout with probabilistic approach</div>
              <div className="text-gray-600 text-sm">Later adopted in transformers (BERT, GPT)</div>
            </div>
            
            {/* 2017 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2017</div>
              <div className="text-purple-500">SELU</div>
            </div>
            <div className="pl-4 py-4">
              <div>Introduced by Klambauer et al., self-normalizing neural networks</div>
              <div className="text-gray-600 text-sm">Designed to maintain normalized activations across layers</div>
            </div>
            
            {/* 2017 */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">2017</div>
              <div className="text-teal-500">Swish</div>
            </div>
            <div className="pl-4 py-4">
              <div>x * sigmoid(x), discovered through automated search</div>
              <div className="text-gray-600 text-sm">Similar to GELU with strong empirical performance</div>
            </div>
            
            {/* Present */}
            <div className="text-right pr-4 py-4">
              <div className="font-semibold">Present</div>
              <div>Task-specific choice</div>
            </div>
            <div className="pl-4 py-4">
              <div>Different functions excel in different contexts</div>
              <div className="text-gray-600 text-sm">ReLU variants for CNN, GELU/Swish for transformers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationFunctionsExplorer;
