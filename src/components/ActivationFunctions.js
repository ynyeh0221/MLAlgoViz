import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ActivationFunctionsExplorer = () => {
  const [viewMode, setViewMode] = useState('function'); // 'function' or 'derivative'
  const [selectedFunctions, setSelectedFunctions] = useState(['relu', 'sigmoid', 'tanh']);
  const [dataPoints, setDataPoints] = useState([]);
  
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
      pros: [
        'Adaptive negative slope (α is learned)',
        'Can outperform ReLU and Leaky ReLU',
        'Mitigates dying ReLU problem'
      ],
      cons: [
        'Additional parameters to learn',
        'Can overfit on small datasets',
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

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="w-full border rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Neural Network Activation Functions Explorer</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="viewMode"
                checked={viewMode === 'derivative'}
                onCheckedChange={(checked) => setViewMode(checked ? 'derivative' : 'function')}
              />
              <Label htmlFor="viewMode">
                {viewMode === 'function' ? 'Show Function' : 'Show Derivative'}
              </Label>
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
                    <Button
                      key={key}
                      variant={selectedFunctions.includes(key) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFunction(key)}
                      style={{ borderColor: func.color, color: selectedFunctions.includes(key) ? undefined : func.color }}
                    >
                      {func.name}
                    </Button>
                  ))}
                </div>
                
                {selectedFunctions.length === 1 && (
                  <div className="mt-4 border rounded-lg shadow-sm">
                    <div className="p-3 border-b">
                      <h3 className="text-md font-medium">{activationFunctions[selectedFunctions[0]].name}</h3>
                    </div>
                    <div className="p-4 text-sm">
                      <p className="font-mono mb-2">{activationFunctions[selectedFunctions[0]].formula}</p>
                      
                      <Tabs defaultValue="pros">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="pros">Pros</TabsTrigger>
                          <TabsTrigger value="cons">Cons</TabsTrigger>
                          <TabsTrigger value="when">When to Use</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pros" className="pt-2">
                          <ul className="list-disc pl-4 space-y-1">
                            {activationFunctions[selectedFunctions[0]].pros.map((pro, idx) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                        </TabsContent>
                        <TabsContent value="cons" className="pt-2">
                          <ul className="list-disc pl-4 space-y-1">
                            {activationFunctions[selectedFunctions[0]].cons.map((con, idx) => (
                              <li key={idx}>{con}</li>
                            ))}
                          </ul>
                        </TabsContent>
                        <TabsContent value="when" className="pt-2">
                          <ul className="list-disc pl-4 space-y-1">
                            {activationFunctions[selectedFunctions[0]].whenToUse.map((use, idx) => (
                              <li key={idx}>{use}</li>
                            ))}
                          </ul>
                        </TabsContent>
                      </Tabs>
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
                    <tr>
                      <td className="px-3 py-2 border-r">
                        <div className="font-medium" style={{color: activationFunctions.relu.color}}>ReLU</div>
                        <div className="text-gray-500">f(x) = max(0, x)</div>
                      </td>
                      <td className="px-3 py-2 border-r">[0, ∞)</td>
                      <td className="px-3 py-2 border-r">
                        <ul className="list-disc pl-4">
                          <li>Computationally efficient</li>
                          <li>Solves vanishing gradient</li>
                          <li>Fast convergence</li>
                        </ul>
                      </td>
                      <td className="px-3 py-2">
                        <ul className="list-disc pl-4">
                          <li>"Dying ReLU" problem</li>
                          <li>Not zero-centered</li>
                          <li>Unbounded outputs</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-r">
                        <div className="font-medium" style={{color: activationFunctions.sigmoid.color}}>Sigmoid</div>
                        <div className="text-gray-500">σ(x) = 1/(1+e^(-x))</div>
                      </td>
                      <td className="px-3 py-2 border-r">(0, 1)</td>
                      <td className="px-3 py-2 border-r">
                        <ul className="list-disc pl-4">
                          <li>Bounded output</li>
                          <li>Smooth gradient</li>
                          <li>Clear probabilistic interpretation</li>
                        </ul>
                      </td>
                      <td className="px-3 py-2">
                        <ul className="list-disc pl-4">
                          <li>Vanishing gradient</li>
                          <li>Not zero-centered</li>
                          <li>Computationally expensive</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-r">
                        <div className="font-medium" style={{color: activationFunctions.tanh.color}}>Tanh</div>
                        <div className="text-gray-500">tanh(x)</div>
                      </td>
                      <td className="px-3 py-2 border-r">(-1, 1)</td>
                      <td className="px-3 py-2 border-r">
                        <ul className="list-disc pl-4">
                          <li>Zero-centered</li>
                          <li>Stronger gradients than sigmoid</li>
                          <li>Bounded output</li>
                        </ul>
                      </td>
                      <td className="px-3 py-2">
                        <ul className="list-disc pl-4">
                          <li>Still has vanishing gradient</li>
                          <li>Computationally expensive</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-r">
                        <div className="font-medium" style={{color: activationFunctions.leakyRelu.color}}>Leaky ReLU</div>
                        <div className="text-gray-500">f(x) = max(αx, x)</div>
                      </td>
                      <td className="px-3 py-2 border-r">(-∞, ∞)</td>
                      <td className="px-3 py-2 border-r">
                        <ul className="list-disc pl-4">
                          <li>Prevents dying ReLU</li>
                          <li>Computationally efficient</li>
                          <li>Allows negative values</li>
                        </ul>
                      </td>
                      <td className="px-3 py-2">
                        <ul className="list-disc pl-4">
                          <li>Not zero-centered</li>
                          <li>Requires α hyperparameter</li>
                          <li>Inconsistent results</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
<td className="px-3 py-2 border-r">
  <div className="font-medium" style={{color: activationFunctions.prelu.color}}>PReLU</div>
  <div className="text-gray-500">f(x) = max(αx, x), α learnable</div>
</td>
<td className="px-3 py-2 border-r">(-∞, ∞)</td>
<td className="px-3 py-2 border-r">
  <ul className="list-disc pl-4">
    <li>Adaptive negative slope</li>
    <li>Can outperform ReLU</li>
    <li>Mitigates dying ReLU</li>
  </ul>
</td>
<td className="px-3 py-2">
  <ul className="list-disc pl-4">
    <li>Additional parameters</li>
    <li>Can overfit small datasets</li>
    <li>Not zero-centered</li>
  </ul>
</td>
</tr>
<tr>
  <td className="px-3 py-2 border-r">
    <div className="font-medium" style={{color: activationFunctions.elu.color}}>ELU</div>
    <div className="text-gray-500">f(x) = x or α(e^x-1)</div>
  </td>
  <td className="px-3 py-2 border-r">(-α, ∞)</td>
  <td className="px-3 py-2 border-r">
    <ul className="list-disc pl-4">
      <li>Smooth negative values</li>
      <li>Closer to zero mean</li>
      <li>Reduces bias shift</li>
    </ul>
  </td>
  <td className="px-3 py-2">
    <ul className="list-disc pl-4">
      <li>More expensive than ReLU</li>
      <li>α hyperparameter</li>
      <li>Can output negatives</li>
    </ul>
  </td>
</tr>
<tr>
  <td className="px-3 py-2 border-r">
    <div className="font-medium" style={{color: activationFunctions.selu.color}}>SELU</div>
    <div className="text-gray-500">f(x) = λ(x or α(e^x-1))</div>
  </td>
  <td className="px-3 py-2 border-r">Self-norm</td>
  <td className="px-3 py-2 border-r">
    <ul className="list-disc pl-4">
      <li>Self-normalizing</li>
      <li>Prevents vanishing gradients</li>
      <li>Can replace batch norm</li>
    </ul>
  </td>
  <td className="px-3 py-2">
    <ul className="list-disc pl-4">
      <li>Specific initialization needed</li>
      <li>Best used for all layers</li>
      <li>Less established</li>
    </ul>
  </td>
</tr>
<tr>
  <td className="px-3 py-2 border-r">
    <div className="font-medium" style={{color: activationFunctions.gelu.color}}>GELU</div>
    <div className="text-gray-500">f(x) = x·Φ(x)</div>
  </td>
  <td className="px-3 py-2 border-r">Unbounded</td>
  <td className="px-3 py-2 border-r">
    <ul className="list-disc pl-4">
      <li>Used in BERT, GPT models</li>
      <li>Smooth non-monotonic</li>
      <li>Strong empirical results</li>
    </ul>
  </td>
  <td className="px-3 py-2">
    <ul className="list-disc pl-4">
      <li>Computationally expensive</li>
      <li>Complex implementation</li>
      <li>Less intuitive</li>
    </ul>
  </td>
</tr>
<tr>
  <td className="px-3 py-2 border-r">
    <div className="font-medium" style={{color: activationFunctions.swish.color}}>Swish</div>
    <div className="text-gray-500">f(x) = x·sigmoid(x)</div>
  </td>
  <td className="px-3 py-2 border-r">Unbounded</td>
  <td className="px-3 py-2 border-r">
    <ul className="list-disc pl-4">
      <li>Outperforms ReLU</li>
      <li>Smooth non-monotonic</li>
      <li>Works with normalization</li>
    </ul>
  </td>
  <td className="px-3 py-2">
    <ul className="list-disc pl-4">
      <li>More expensive than ReLU</li>
      <li>Newer, less established</li>
      <li>Non-intuitive behavior</li>
    </ul>
  </td>
</tr>
<tr>
  <td className="px-3 py-2 border-r">
    <div className="font-medium" style={{color: activationFunctions.softmax.color}}>Softmax</div>
    <div className="text-gray-500">e^(x_i) / Σ_j e^(x_j)</div>
  </td>
  <td className="px-3 py-2 border-r">(0,1), sum=1</td>
  <td className="px-3 py-2 border-r">
    <ul className="list-disc pl-4">
      <li>Creates probability distribution</li>
      <li>Ideal for multi-class classification</li>
      <li>Differentiable</li>
    </ul>
  </td>
  <td className="px-3 py-2">
    <ul className="list-disc pl-4">
      <li>Only for multiple outputs</li>
      <li>Numerical stability issues</li>
      <li>Computationally expensive</li>
    </ul>
  </td>
</tr>
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
