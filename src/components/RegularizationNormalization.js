import React from 'react';

const RegularizationViz = () => {
  // Data
  const weights = [
    {name: 'Feature1', noReg: 8, l1: 0, l2: 2},
    {name: 'Feature2', noReg: -6, l1: 0, l2: -1.5},
    {name: 'Feature3', noReg: 5, l1: 2, l2: 1.2},
    {name: 'Feature4', noReg: 7, l1: 3, l2: 1.8},
    {name: 'Feature5', noReg: -4, l1: -2, l2: -1},
    {name: 'Feature6', noReg: 0.5, l1: 0, l2: 0.1}
  ];
  
  const activationMatrix = [
    // Original
    [5.2, -4.8, 0.2, 2.3, -0.9],
    [6.1, -5.2, 0.1, 2.1, -1.1],
    [4.9, -4.5, 0.3, 2.5, -0.8],
    [5.5, -5.0, 0.2, 2.2, -1.0],
    
    // Batch Norm
    [0.8, -0.9, 0.7, 0.5, -0.6],
    [1.0, -1.0, -0.5, 0.2, 1.1],
    [0.2, -0.7, 1.5, 0.9, -0.8],
    [0.9, -0.8, 0.2, 0.3, -0.9],
    
    // Layer Norm
    [1.2, -1.1, -0.2, 0.7, -0.6],
    [1.3, -1.2, -0.4, 0.5, -0.8],
    [1.0, -0.9, -0.1, 0.8, -0.5],
    [1.1, -1.0, -0.3, 0.6, -0.7]
  ];
  
  // Get color for activation values
  const getColor = (value) => {
    const normalized = Math.max(-2, Math.min(2, value)); 
    
    if (normalized < 0) {
      const intensity = Math.min(255, Math.round(Math.abs(normalized) * 127));
      return `rgb(0,0,${intensity + 127})`;
    } else {
      const intensity = Math.min(255, Math.round(normalized * 127));
      return `rgb(${intensity + 127},0,0)`;
    }
  };
  
  return (
    <div className="p-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-4">Regularization and Normalization: Core Comparison</h2>
      
      {/* Explainer */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold text-lg mb-1">Understanding the Visualizations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="p-2">
            <p><span className="font-bold">Weight Regularization Chart</span>: Each set of bars shows the weight value for a specific feature, demonstrating how different regularization methods affect weight magnitudes.</p>
          </div>
          <div className="p-2">
            <p><span className="font-bold">Activation Normalization Chart</span>: The three matrices represent different normalization methods, where each row is a sample and each column is a neuron, with colors and values showing activation strength.</p>
          </div>
        </div>
      </div>
      
      {/* Weight Regularization */}
      <div className="mb-6 bg-white rounded shadow p-4">
        <h3 className="font-bold text-lg text-center mb-3">Weight Regularization: L1 vs L2</h3>
        
        <div className="flex justify-center mb-3">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>No Regularization</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>L1 Regularization</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>L2 Regularization</span>
          </div>
        </div>
        
        {/* Weight Graph - Fixed Implementation */}
        <div className="w-full h-64 relative border-b border-l border-gray-400 mb-4">
          {/* Y-axis label */}
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-bold">
            Weight Value
          </div>
          
          {/* X-axis label */}
          <div className="absolute bottom-[-20px] w-full text-center text-sm font-bold">
            Model Features/Neural Network Weights
          </div>
          
          {/* Y-axis values */}
          <div className="absolute -left-2 top-0 h-full flex flex-col justify-between items-center text-xs">
            <span>8</span><span>4</span><span>0</span><span>-4</span><span>-8</span>
          </div>

          {/* Zero line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300"></div>
          
          {/* Weight bars */}
          <div className="absolute inset-0 flex justify-around items-center px-2">
            {weights.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Center point for alignment */}
                <div className="w-full h-0 relative" style={{top: '50%'}}>
                  {/* No Regularization */}
                  <div className="w-4 bg-purple-500 absolute left-1/2 transform -translate-x-1/2"
                    style={{
                      height: `${Math.abs(item.noReg) * 10}px`,
                      bottom: item.noReg >= 0 ? '0px' : 'auto',
                      top: item.noReg >= 0 ? 'auto' : '0px',
                    }}>
                  </div>
                  
                  {/* L1 Regularization */}
                  {item.l1 !== 0 && (
                    <div className="w-4 bg-green-500 absolute left-1/2 transform -translate-x-1/2 ml-5"
                      style={{
                        height: `${Math.abs(item.l1) * 10}px`,
                        bottom: item.l1 >= 0 ? '0px' : 'auto',
                        top: item.l1 >= 0 ? 'auto' : '0px',
                      }}>
                    </div>
                  )}
                  
                  {/* L2 Regularization */}
                  <div className="w-4 bg-blue-500 absolute left-1/2 transform -translate-x-1/2 ml-10"
                    style={{
                      height: `${Math.abs(item.l2) * 10}px`,
                      bottom: item.l2 >= 0 ? '0px' : 'auto',
                      top: item.l2 >= 0 ? 'auto' : '0px',
                    }}>
                  </div>
                </div>
                
                <span className="mt-28 text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded">
            <h4 className="font-bold text-green-800">L1 Regularization</h4>
            <p>Adds |w| to loss function</p>
            <p className="font-bold">Effect: Makes many weights zero</p>
            <div className="italic">Like minimalism, completely removing unimportant items</div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-bold text-blue-800">L2 Regularization</h4>
            <p>Adds w² to loss function</p>
            <p className="font-bold">Effect: All weights become smaller</p>
            <div className="italic">Like downsizing all furniture while keeping balance</div>
          </div>
        </div>
      </div>
      
      {/* Activation Normalization */}
      <div className="mb-6 bg-white rounded shadow p-4">
        <h3 className="font-bold text-lg text-center mb-3">Activation Normalization: Batch vs Layer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Original activations */}
          <div className="text-center">
            <h4 className="font-bold mb-2">Original Activations</h4>
            <table className="mx-auto border-collapse">
              <tbody>
                {[0,1,2,3].map(row => (
                  <tr key={`orig-row-${row}`}>
                    {[0,1,2,3,4].map(col => (
                      <td 
                        key={`orig-${row}-${col}`}
                        className="border" 
                        style={{
                          width: '35px', 
                          height: '35px', 
                          backgroundColor: getColor(activationMatrix[row][col]),
                          color: Math.abs(activationMatrix[row][col]) > 1.5 ? 'white' : 'black',
                          textAlign: 'center',
                          fontSize: '11px'
                        }}
                      >
                        {activationMatrix[row][col].toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-sm">Large range differences between neurons</div>
          </div>
          
          {/* Batch Norm */}
          <div className="text-center">
            <h4 className="font-bold mb-2">Batch Norm</h4>
            <table className="mx-auto border-collapse">
              <tbody>
                {[0,1,2,3].map(row => (
                  <tr key={`bn-row-${row}`}>
                    {[0,1,2,3,4].map(col => (
                      <td 
                        key={`bn-${row}-${col}`}
                        className="border" 
                        style={{
                          width: '35px', 
                          height: '35px', 
                          backgroundColor: getColor(activationMatrix[row+4][col]),
                          color: Math.abs(activationMatrix[row+4][col]) > 1.5 ? 'white' : 'black',
                          textAlign: 'center',
                          fontSize: '11px'
                        }}
                      >
                        {activationMatrix[row+4][col].toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex justify-center">
              <svg width="80" height="24">
                <path d="M0,12 L60,12" stroke="purple" strokeWidth="2" />
                <path d="M55,7 L60,12 L55,17" fill="none" stroke="purple" strokeWidth="2" />
              </svg>
            </div>
            <div className="font-bold text-purple-800">Normalize along columns (each neuron)</div>
          </div>
          
          {/* Layer Norm */}
          <div className="text-center">
            <h4 className="font-bold mb-2">Layer Norm</h4>
            <table className="mx-auto border-collapse">
              <tbody>
                {[0,1,2,3].map(row => (
                  <tr key={`ln-row-${row}`}>
                    {[0,1,2,3,4].map(col => (
                      <td 
                        key={`ln-${row}-${col}`}
                        className="border" 
                        style={{
                          width: '35px', 
                          height: '35px', 
                          backgroundColor: getColor(activationMatrix[row+8][col]),
                          color: Math.abs(activationMatrix[row+8][col]) > 1.5 ? 'white' : 'black',
                          textAlign: 'center',
                          fontSize: '11px'
                        }}
                      >
                        {activationMatrix[row+8][col].toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex justify-center">
              <svg width="80" height="24">
                <path d="M0,12 L60,12" stroke="#d6336c" strokeWidth="2" />
                <path d="M55,7 L60,12 L55,17" fill="none" stroke="#d6336c" strokeWidth="2" />
              </svg>
            </div>
            <div className="font-bold text-pink-800">Normalize along rows (each sample)</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-purple-50 rounded">
            <h4 className="font-bold text-purple-800">Batch Normalization</h4>
            <p className="font-bold">Formula: (x-μ_batch)/σ_batch</p>
            <div><span className="font-bold">Direction:</span> Normalize each feature across samples</div>
            <div className="italic">Like ensuring each exam question has similar average scores</div>
          </div>
          <div className="p-3 bg-pink-50 rounded">
            <h4 className="font-bold text-pink-800">Layer Normalization</h4>
            <p className="font-bold">Formula: (x-μ_layer)/σ_layer</p> 
            <div><span className="font-bold">Direction:</span> Normalize each sample across features</div>
            <div className="italic">Like ensuring each student has balanced scores</div>
          </div>
        </div>
      </div>
      
      {/* Application Section */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-bold text-lg text-center mb-3">Combined Application in Deep Learning Practice</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* CNN Architecture */}
          <div className="bg-blue-50 rounded border border-blue-200 p-3">
            <h4 className="font-bold text-center mb-3">CNN Architecture (e.g., ResNet)</h4>
            
            <div className="relative bg-white p-3 rounded mb-6 min-h-[150px]">
              <div className="flex justify-between items-center h-full">
                <div className="text-center">
                  <div className="bg-gray-200 p-2 rounded text-xs">Input</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 p-1 rounded text-xs mb-1">Conv Layer</div>
                  <div className="bg-green-300 p-1 rounded text-xs font-bold mb-1">BatchNorm</div>
                  <div className="bg-purple-100 p-1 rounded text-xs mb-1">ReLU</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 p-1 rounded text-xs mb-1">Conv Layer</div>
                  <div className="bg-green-300 p-1 rounded text-xs font-bold mb-1">BatchNorm</div>
                  <div className="bg-purple-100 p-1 rounded text-xs mb-1">ReLU</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 p-2 rounded text-xs">FC Layer</div>
                </div>
              </div>
              
              <div className="absolute bottom-[-15px] left-0 right-0 text-center">
                <span className="inline-block bg-red-100 px-2 py-1 rounded border border-red-300 text-xs font-bold">
                  L2 Weight Decay applied to all weights
                </span>
              </div>
            </div>
            
            <div className="bg-blue-100 p-2 rounded text-sm">
              <div><strong>Typical Applications:</strong> ResNet, VGG, MobileNet</div>
              <div><strong>Normalization Choice:</strong> Primarily Batch Normalization</div>
              <div><strong>Regularization Choice:</strong> Almost always L2 weight decay</div>
            </div>
          </div>
          
          {/* Transformer Architecture */}
          <div className="bg-purple-50 rounded border border-purple-200 p-3">
            <h4 className="font-bold text-center mb-3">Transformer Architecture (e.g., BERT, GPT)</h4>
            
            <div className="relative bg-white p-3 rounded mb-6 min-h-[150px]">
              <div className="flex justify-between items-center h-full">
                <div className="text-center">
                  <div className="bg-gray-200 p-2 rounded text-xs">Embeddings</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-200 p-1 rounded text-xs mb-1">Multi-Head Attn</div>
                  <div className="bg-pink-300 p-1 rounded text-xs font-bold mb-1">LayerNorm</div>
                  <div className="bg-indigo-100 p-1 rounded text-xs mb-1">Feed Forward</div>
                  <div className="bg-pink-300 p-1 rounded text-xs font-bold">LayerNorm</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-200 p-1 rounded text-xs mb-1">Multi-Head Attn</div>
                  <div className="bg-pink-300 p-1 rounded text-xs font-bold mb-1">LayerNorm</div>
                  <div className="bg-indigo-100 p-1 rounded text-xs mb-1">Feed Forward</div>
                  <div className="bg-pink-300 p-1 rounded text-xs font-bold">LayerNorm</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 p-2 rounded text-xs">Output Layer</div>
                </div>
              </div>
              
              <div className="absolute bottom-[-15px] left-0 right-0 text-center">
                <span className="inline-block bg-red-100 px-2 py-1 rounded border border-red-300 text-xs font-bold">
                  L2 Weight Decay + Dropout
                </span>
              </div>
            </div>
            
            <div className="bg-purple-100 p-2 rounded text-sm">
              <div><strong>Typical Applications:</strong> BERT, GPT, T5, ViT</div>
              <div><strong>Normalization Choice:</strong> Primarily Layer Normalization</div>
              <div><strong>Regularization Choice:</strong> L2 Weight Decay + Dropout</div>
            </div>
          </div>
        </div>
        
        {/* Reasons section */}
        <div className="bg-yellow-50 rounded border border-yellow-200 p-3 mb-4">
          <h4 className="font-bold text-center mb-2">Reasons for Combined Usage in Deep Learning</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">1</span>
              </div>
              <div><strong>Complementary Effects:</strong> Weight regularization controls model complexity, activation normalization improves training stability</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">2</span>
              </div>
              <div><strong>Synergistic Action:</strong> Normalization allows higher learning rates, regularization prevents overfitting at those rates</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">3</span>
              </div>
              <div><strong>Engineering Practice:</strong> Normalization integrated as part of network architecture, regularization applied through optimizer</div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">4</span>
              </div>
              <div><strong>Flexible Combination:</strong> Different architectures and tasks need different normalization and regularization combinations</div>
            </div>
          </div>
        </div>
        
        {/* PyTorch code example */}
        <div className="bg-gray-50 rounded border border-gray-300 p-3">
          <h4 className="font-bold text-center mb-2">PyTorch Code Example: Activation Normalization + Weight Regularization</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded p-2 text-green-300 font-mono text-xs overflow-auto">
              <pre style={{whiteSpace: 'pre-wrap'}}>
{`# CNN model example using both techniques
model = nn.Sequential(
    nn.Conv2d(3, 16, 3, padding=1),
    nn.BatchNorm2d(16),  # Activation normalization
    nn.ReLU(),
    nn.Conv2d(16, 32, 3, padding=1),
    nn.BatchNorm2d(32),  # Activation normalization
    nn.ReLU(),
    nn.Flatten(),
    nn.Linear(32*32*32, 10)
)

# Adding L2 weight regularization
optimizer = torch.optim.Adam(
    model.parameters(), 
    lr=0.001, 
    weight_decay=1e-4  # L2 regularization
)`}
              </pre>
            </div>
            
            <div>
              <div className="mb-3">
                <h5 className="font-bold mb-1">Code Analysis</h5>
                <ul className="list-disc pl-5">
                  <li><span className="font-mono bg-blue-100 px-1 rounded">nn.BatchNorm2d</span> - Activation normalization added after each convolutional layer</li>
                  <li><span className="font-mono bg-red-100 px-1 rounded">weight_decay=1e-4</span> - L2 weight regularization applied via optimizer parameter</li>
                </ul>
              </div>
              
              <div className="p-2 bg-white rounded border border-gray-200">
                <p>
                  <strong>Key Implementation Pattern:</strong> BatchNorm is added as part of the model architecture, while L2 regularization is configured as an optimizer parameter, highlighting their different implementation approaches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularizationViz;
