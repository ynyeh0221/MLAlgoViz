import React from 'react';

const RegularizationViz = () => {
  // Example data
  const weights = [
    {name: 'Feature1', noReg: 8, l1: 0, l2: 2},
    {name: 'Feature2', noReg: -6, l1: 0, l2: -1.5},
    {name: 'Feature3', noReg: 5, l1: 2, l2: 1.2},
    {name: 'Feature4', noReg: 7, l1: 3, l2: 1.8},
    {name: 'Feature5', noReg: -4, l1: -2, l2: -1},
    {name: 'Feature6', noReg: 0.5, l1: 0, l2: 0.1},
  ];
  
  // Simulated activations
  const activationMatrix = [
    // Original activations
    [5.2, -4.8, 0.2, 2.3, -0.9],
    [6.1, -5.2, 0.1, 2.1, -1.1],
    [4.9, -4.5, 0.3, 2.5, -0.8],
    [5.5, -5.0, 0.2, 2.2, -1.0],
    
    // After Batch Norm
    [0.8, -0.9, 0.7, 0.5, -0.6],
    [1.0, -1.0, -0.5, 0.2, 1.1],
    [0.2, -0.7, 1.5, 0.9, -0.8],
    [0.9, -0.8, 0.2, 0.3, -0.9],
    
    // After Layer Norm
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
    <div className="py-4 px-2 md:px-4 bg-gray-50 font-sans">
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
      
      {/* Weight Regularization Section */}
      <div className="mb-6 bg-white rounded shadow-sm p-4">
        <h3 className="font-bold text-lg text-center mb-4">Weight Regularization: L1 vs L2</h3>
        
        <div className="flex items-center justify-center mb-3 flex-wrap">
          <div className="flex items-center mr-4 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm">No Regularization</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">L1 Regularization</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">L2 Regularization</span>
          </div>
        </div>
        
        {/* Weight Visualization */}
        <div className="relative w-full mx-auto border-b border-l border-gray-400 mb-8 h-56">
          {/* Y-axis label */}
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-bold">
            Weight Value
          </div>
          
          {/* Y-axis */}
          <div className="absolute -left-2 top-0 h-full flex flex-col justify-between items-center text-xs">
            <span>8</span>
            <span>4</span>
            <span>0</span>
            <span>-4</span>
            <span>-8</span>
          </div>
          
          {/* X-axis label */}
          <div className="absolute bottom-[-24px] w-full text-center text-sm font-bold">
            Model Features/Neural Network Weights
          </div>
          
          {/* Weight bars */}
          <div className="absolute inset-0 flex items-center justify-around pt-2 pb-2">
            {weights.map((item, index) => (
              <div key={index} className="flex flex-col items-center w-10">
                <div className="flex flex-col items-center justify-center h-full">
                  {/* No regularization */}
                  <div 
                    className="w-5 bg-purple-500 mb-0.5" 
                    style={{ 
                      height: `${Math.abs(item.noReg) * 10}px`,
                      marginTop: item.noReg >= 0 ? '0' : 'auto',
                      marginBottom: item.noReg >= 0 ? 'auto' : '0'
                    }}
                  ></div>
                  
                  {/* L1 regularization */}
                  {item.l1 !== 0 && (
                    <div 
                      className="w-5 bg-green-500 mb-0.5" 
                      style={{ 
                        height: `${Math.abs(item.l1) * 10}px`,
                        marginTop: item.l1 >= 0 ? '0' : 'auto',
                        marginBottom: item.l1 >= 0 ? 'auto' : '0'
                      }}
                    ></div>
                  )}
                  
                  {/* L2 regularization */}
                  <div 
                    className="w-5 bg-blue-500" 
                    style={{ 
                      height: `${Math.abs(item.l2) * 10}px`,
                      marginTop: item.l2 >= 0 ? '0' : 'auto',
                      marginBottom: item.l2 >= 0 ? 'auto' : '0'
                    }}
                  ></div>
                </div>
                
                <span className="mt-3 text-xs text-center">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-3 bg-green-50 rounded">
            <h4 className="font-bold text-green-800">L1 Regularization</h4>
            <p>Adds |w| to loss function</p>
            <p className="text-xs mt-1 font-bold">Effect: Makes many weights zero</p>
            <div className="mt-1 text-xs italic">Like minimalism, completely removing unimportant items</div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-bold text-blue-800">L2 Regularization</h4>
            <p>Adds w² to loss function</p>
            <p className="text-xs mt-1 font-bold">Effect: All weights become smaller</p>
            <div className="mt-1 text-xs italic">Like downsizing all furniture while keeping balance</div>
          </div>
        </div>
      </div>
      
      {/* Activation Normalization Section */}
      <div className="mb-6 bg-white rounded shadow-sm p-4">
        <h3 className="font-bold text-lg text-center mb-4">Activation Normalization: Batch vs Layer</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Original activations */}
          <div className="text-center">
            <h4 className="text-sm font-bold mb-2">Original Activations</h4>
            <div className="flex justify-center items-center mb-2">
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold mb-1">Neurons</div>
                <div className="grid grid-cols-5 gap-0.5">
                  {[0,1,2,3].map(row => (
                    <React.Fragment key={`orig-row-${row}`}>
                      {[0,1,2,3,4].map(col => (
                        <div 
                          key={`orig-${row}-${col}`}
                          className="w-8 h-8 flex items-center justify-center text-xs rounded border border-gray-200"
                          style={{
                            backgroundColor: getColor(activationMatrix[row][col]),
                            color: Math.abs(activationMatrix[row][col]) > 1.5 ? 'white' : 'black'
                          }}
                        >
                          {activationMatrix[row][col].toFixed(1)}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-xs mt-1">Large range differences between neurons</div>
          </div>
          
          {/* Batch Norm */}
          <div className="text-center">
            <h4 className="text-sm font-bold mb-2">Batch Norm</h4>
            <div className="flex justify-center items-center mb-2">
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold mb-1">Neurons</div>
                <div className="grid grid-cols-5 gap-0.5">
                  {[0,1,2,3].map(row => (
                    <React.Fragment key={`bn-row-${row}`}>
                      {[0,1,2,3,4].map(col => (
                        <div 
                          key={`bn-${row}-${col}`}
                          className="w-8 h-8 flex items-center justify-center text-xs rounded border border-gray-200"
                          style={{
                            backgroundColor: getColor(activationMatrix[row+4][col]),
                            color: Math.abs(activationMatrix[row+4][col]) > 1.5 ? 'white' : 'black'
                          }}
                        >
                          {activationMatrix[row+4][col].toFixed(1)}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-1">
              <div className="relative">
                <svg width="100" height="20">
                  <path d="M5,10 L95,10" stroke="#4C1D95" strokeWidth="2" />
                  <path d="M90,5 L95,10 L90,15" fill="none" stroke="#4C1D95" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div className="text-xs mt-1 font-bold text-purple-800">Normalize along columns (each neuron)</div>
          </div>
          
          {/* Layer Norm */}
          <div className="text-center">
            <h4 className="text-sm font-bold mb-2">Layer Norm</h4>
            <div className="flex justify-center items-center mb-2">
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold mb-1">Neurons</div>
                <div className="grid grid-cols-5 gap-0.5">
                  {[0,1,2,3].map(row => (
                    <React.Fragment key={`ln-row-${row}`}>
                      {[0,1,2,3,4].map(col => (
                        <div 
                          key={`ln-${row}-${col}`}
                          className="w-8 h-8 flex items-center justify-center text-xs rounded border border-gray-200"
                          style={{
                            backgroundColor: getColor(activationMatrix[row+8][col]),
                            color: Math.abs(activationMatrix[row+8][col]) > 1.5 ? 'white' : 'black'
                          }}
                        >
                          {activationMatrix[row+8][col].toFixed(1)}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-1">
              <div className="relative">
                <svg width="100" height="20">
                  <path d="M5,10 L95,10" stroke="#9D174D" strokeWidth="2" />
                  <path d="M90,5 L95,10 L90,15" fill="none" stroke="#9D174D" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div className="text-xs mt-1 font-bold text-pink-800">Normalize along rows (each sample)</div>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-purple-50 rounded">
            <h4 className="font-bold text-purple-800">Batch Normalization</h4>
            <p className="text-xs mt-1 font-bold">Formula: (x-μ_batch)/σ_batch</p>
            <div className="mt-1 text-xs">
              <span className="font-bold">Direction:</span> Normalize each feature across samples
            </div>
            <div className="mt-1 text-xs italic">Like ensuring each exam question has similar average scores</div>
          </div>
          <div className="p-3 bg-pink-50 rounded">
            <h4 className="font-bold text-pink-800">Layer Normalization</h4>
            <p className="text-xs mt-1 font-bold">Formula: (x-μ_layer)/σ_layer</p> 
            <div className="mt-1 text-xs">
              <span className="font-bold">Direction:</span> Normalize each sample across features
            </div>
            <div className="mt-1 text-xs italic">Like ensuring each student has balanced scores</div>
          </div>
        </div>
      </div>
      
      {/* Combined Application Section */}
      <div className="mb-6 bg-white rounded shadow-sm p-4">
        <h3 className="font-bold text-lg text-center mb-4">Combined Application in Deep Learning Practice</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* CNN Architecture */}
          <div className="bg-blue-50 rounded border border-blue-200 p-4">
            <h4 className="font-bold text-center mb-4">CNN Architecture (e.g., ResNet)</h4>
            
            <div className="relative mx-auto mb-6 h-56">
              <div className="bg-white rounded-lg shadow-sm p-3 h-full">
                <div className="flex h-full items-center justify-between">
                  {/* Input layer */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">Input</span>
                    </div>
                  </div>
                  
                  {/* Conv layer 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-14 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="text-xs">Conv Layer</span>
                    </div>
                    <div className="w-16 h-6 bg-green-300 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs font-bold">BatchNorm</span>
                    </div>
                    <div className="w-16 h-6 bg-purple-100 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs">ReLU</span>
                    </div>
                  </div>
                  
                  {/* Conv layer 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-14 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="text-xs">Conv Layer</span>
                    </div>
                    <div className="w-16 h-6 bg-green-300 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs font-bold">BatchNorm</span>
                    </div>
                    <div className="w-16 h-6 bg-purple-100 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs">ReLU</span>
                    </div>
                  </div>
                  
                  {/* FC layer */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-20 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs">FC Layer</span>
                    </div>
                  </div>
                </div>
                
                {/* Weight decay marker */}
                <div className="absolute bottom-0 left-0 right-0 text-center -mb-6">
                  <div className="inline-block bg-red-100 px-2 py-1 rounded border border-red-300">
                    <span className="text-xs font-bold">L2 Weight Decay applied to all weights</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs mt-8 p-3 bg-blue-100 rounded">
              <div><strong>Typical Applications:</strong> ResNet, VGG, MobileNet</div>
              <div><strong>Normalization Choice:</strong> Primarily Batch Normalization</div>
              <div><strong>Regularization Choice:</strong> Almost always L2 weight decay</div>
            </div>
          </div>
          
          {/* Transformer Architecture */}
          <div className="bg-purple-50 rounded border border-purple-200 p-4">
            <h4 className="font-bold text-center mb-4">Transformer Architecture (e.g., BERT, GPT)</h4>
            
            <div className="relative mx-auto mb-6 h-56">
              <div className="bg-white rounded-lg shadow-sm p-3 h-full">
                <div className="flex h-full items-center justify-between">
                  {/* Input embeddings */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">Embeddings</span>
                    </div>
                  </div>
                  
                  {/* Attention block 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-7 bg-purple-200 rounded flex items-center justify-center">
                      <span className="text-xs">Multi-Head Attn</span>
                    </div>
                    <div className="w-16 h-5 bg-pink-300 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs font-bold">LayerNorm</span>
                    </div>
                    <div className="w-16 h-7 bg-indigo-100 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs">Feed Forward</span>
                    </div>
                    <div className="w-16 h-5 bg-pink-300 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs font-bold">LayerNorm</span>
                    </div>
                  </div>
                  
                  {/* Attention block 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-7 bg-purple-200 rounded flex items-center justify-center">
                      <span className="text-xs">Multi-Head Attn</span>
                    </div>
                    <div className="w-16 h-5 bg-pink-300 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs font-bold">LayerNorm</span>
                    </div>
                    <div className="w-16 h-7 bg-indigo-100 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs">Feed Forward</span>
                    </div>
                    <div className="w-16 h-5 bg-pink-300 rounded mt-1 flex items-center justify-center">
                      <span className="text-xs font-bold">LayerNorm</span>
                    </div>
                  </div>
                  
                  {/* Output layer */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-20 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs">Output Layer</span>
                    </div>
                  </div>
                </div>
                
                {/* Weight decay marker */}
                <div className="absolute bottom-0 left-0 right-0 text-center -mb-6">
                  <div className="inline-block bg-red-100 px-2 py-1 rounded border border-red-300">
                    <span className="text-xs font-bold">L2 Weight Decay + Dropout</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs mt-8 p-3 bg-purple-100 rounded">
              <div><strong>Typical Applications:</strong> BERT, GPT, T5, ViT</div>
              <div><strong>Normalization Choice:</strong> Primarily Layer Normalization</div>
              <div><strong>Regularization Choice:</strong> L2 Weight Decay + Dropout</div>
            </div>
          </div>
        </div>
        
        {/* Reasons section */}
        <div className="bg-yellow-50 rounded border border-yellow-200 p-4 mb-4">
          <h4 className="font-bold text-center mb-3">Reasons for Combined Usage in Deep Learning</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">1</span>
              </div>
              <div>
                <p className="text-sm"><strong>Complementary Effects:</strong> Weight regularization controls model complexity, activation normalization improves training stability</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">2</span>
              </div>
              <div>
                <p className="text-sm"><strong>Synergistic Action:</strong> Normalization allows higher learning rates, regularization prevents overfitting at those higher rates</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">3</span>
              </div>
              <div>
                <p className="text-sm"><strong>Engineering Practice:</strong> Normalization typically integrated as part of network architecture, weight regularization applied through optimizer</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-red-100 rounded-full flex items-center justify-center mr-2">
                <span className="font-bold">4</span>
              </div>
              <div>
                <p className="text-sm"><strong>Flexible Combination:</strong> Different architectures and tasks need different normalization and regularization combinations</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* PyTorch code example */}
        <div className="bg-gray-50 rounded border border-gray-300 p-4">
          <h4 className="font-bold text-center mb-3">PyTorch Code Example: Activation Normalization + Weight Regularization</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-900 rounded p-3 text-green-300 font-mono text-xs overflow-auto max-h-56">
              <pre className="whitespace-pre-wrap break-all">
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
)

              </pre>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="mb-4">
                <h5 className="font-bold text-sm mb-1">Code Analysis</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li><span className="font-mono bg-blue-100 px-1 rounded">nn.BatchNorm2d</span> - Activation normalization added after each convolutional layer</li>
                  <li><span className="font-mono bg-red-100 px-1 rounded">weight_decay=1e-4</span> - L2 weight regularization applied via optimizer parameter</li>
                </ul>
              </div>
              
              <div className="p-3 bg-white rounded shadow-sm">
                <p className="text-xs">
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
