import React, { useState, useEffect } from 'react';

const InteractiveVAEDiffusion = () => {
  // State for tracking the current view/phase
  const [currentPhase, setCurrentPhase] = useState('training'); // training, generation, diffusion
  
  // Latent vector dimensions with initial values
  const [dimension1, setDimension1] = useState(0);
  const [dimension2, setDimension2] = useState(0);
  const [dimension3, setDimension3] = useState(0);
  
  // Training state
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [draggedFlower, setDraggedFlower] = useState(null);
  const [trainedFlowers, setTrainedFlowers] = useState([]);
  
  // Track training epochs
  useEffect(() => {
    if (trainedFlowers.length > 0 && trainingProgress < 100 && currentPhase === 'training') {
      const timer = setTimeout(() => {
        setTrainingProgress(prev => {
          const newProgress = prev + (10 / trainedFlowers.length);
          if (newProgress >= 100) {
            setTrainingComplete(true);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trainedFlowers, trainingProgress, currentPhase]);
  
  // Available training flowers
  const trainingFlowers = [
    { id: 1, color: -0.8, bloom: 0.7, shape: 0.2, name: "Red tulip, full bloom" },
    { id: 2, color: 0.8, bloom: 0.6, shape: 0.3, name: "Blue daisy, full bloom" },
    { id: 3, color: -0.7, bloom: -0.8, shape: 0.1, name: "Red bud flower" },
    { id: 4, color: 0.7, bloom: -0.5, shape: -0.7, name: "Blue rose bud" }
  ];
  
  // Function to generate SVG representation of flower based on latent dimensions
  const generateFlower = (dim1, dim2, dim3) => {
    // Calculate features based on dimensions
    // dim1: Color (red to blue)
    // dim2: Bloom stage (bud to full bloom)
    // dim3: Shape (tulip-like to rose-like)
    
    // Color interpolation from red to blue
    const redValue = Math.max(0, Math.min(255, 255 - Math.floor((dim1 + 1) * 127.5)));
    const blueValue = Math.max(0, Math.min(255, Math.floor((dim1 + 1) * 127.5)));
    const flowerColor = `rgb(${redValue}, 50, ${blueValue})`;
    
    // Bloom level (affects petal size and opening)
    const bloomFactor = Math.max(0.1, (dim2 + 1) * 0.45 + 0.1); // 0.1 to 1.0
    
    // Shape factor (affects petal shape)
    const shapeFactor = dim3; // -1 to 1 (negative: pointed petals, positive: round petals)
    
    // Stem
    const stemHeight = 80;
    const stemWidth = 4;
    
    return (
      <g transform="translate(150, 150)">
        {/* Stem */}
        <rect 
          x={-stemWidth/2} 
          y={-5} 
          width={stemWidth} 
          height={stemHeight} 
          fill="#2E8B57" 
        />
        
        {/* Leaves */}
        <path 
          d={`M ${-stemWidth/2},${stemHeight*0.3} C ${-20},${stemHeight*0.2} ${-30},${stemHeight*0.4} ${-15},${stemHeight*0.5}`} 
          fill="#3CB371" 
          stroke="#2E8B57" 
          strokeWidth="1" 
        />
        <path 
          d={`M ${stemWidth/2},${stemHeight*0.6} C ${20},${stemHeight*0.5} ${30},${stemHeight*0.7} ${15},${stemHeight*0.8}`} 
          fill="#3CB371" 
          stroke="#2E8B57" 
          strokeWidth="1" 
        />
        
        {/* Flower center */}
        <circle cx="0" cy="-8" r={10 * bloomFactor} fill="#FFD700" />
        
        {/* Petals - number and shape vary based on dimensions */}
        {[...Array(shapeFactor < 0 ? 5 : 8)].map((_, i) => {
          const angle = (i * 2 * Math.PI) / (shapeFactor < 0 ? 5 : 8);
          const petalLength = 30 * bloomFactor;
          const petalWidth = 15 * bloomFactor;
          
          // Shape affects how pointed or round the petals are
          const controlPointFactor = shapeFactor < 0 ? 0.3 : 0.8;
          const controlPoint = petalLength * controlPointFactor;
          
          return (
            <path
              key={i}
              d={`
                M 0,-8
                Q ${Math.cos(angle) * controlPoint},${Math.sin(angle) * controlPoint - 8} 
                  ${Math.cos(angle) * petalLength},${Math.sin(angle) * petalLength - 8}
                Q ${Math.cos(angle + 0.2) * controlPoint},${Math.sin(angle + 0.2) * controlPoint - 8}
                  0,-8
              `}
              fill={flowerColor}
              stroke={flowerColor}
              strokeWidth="1"
              opacity="0.9"
            />
          );
        })}
      </g>
    );
  };
  
  // Handle drag start for training data
  const handleDragStart = (flower) => {
    setDraggedFlower(flower);
  };
  
  // Handle drop for training
  const handleDrop = () => {
    if (draggedFlower && !trainedFlowers.find(flower => flower.id === draggedFlower.id)) {
      setTrainedFlowers([...trainedFlowers, draggedFlower]);
      setDraggedFlower(null);
    }
  };
  
  // Generate a representation of the latent space
  const generateLatentSpace = (dim1, dim2, dim3, showTrainingPoints) => {
    // Position in latent space
    const x = 75 + dim1 * 40;
    const y = 75 + dim2 * 40;
    const radius = 5 + (dim3 + 1) * 2;
    
    return (
      <g>
        {/* Latent space grid */}
        <rect x="25" y="25" width="100" height="100" fill="#f0f9ff" stroke="#3498db" strokeWidth="1" />
        <line x1="25" y1="75" x2="125" y2="75" stroke="#3498db" strokeWidth="0.5" />
        <line x1="75" y1="25" x2="75" y2="125" stroke="#3498db" strokeWidth="0.5" />
        
        {/* Show training points in latent space */}
        {showTrainingPoints && trainedFlowers.map(flower => (
          <circle 
            key={flower.id} 
            cx={75 + flower.color * 40} 
            cy={75 + flower.bloom * 40} 
            r={5 + (flower.shape + 1) * 2} 
            fill="#3498db" 
            opacity="0.6" 
          />
        ))}
        
        {/* Current point */}
        {(currentPhase === 'generation' || currentPhase === 'diffusion') && (
          <circle cx={x} cy={y} r={radius} fill="#e74c3c" />
        )}
        
        {/* Diffusion noise cloud around point */}
        {currentPhase === 'diffusion' && (
          <>
            {[...Array(15)].map((_, i) => {
              const noiseX = x + (Math.random() - 0.5) * 20;
              const noiseY = y + (Math.random() - 0.5) * 20;
              return (
                <circle 
                  key={i} 
                  cx={noiseX} 
                  cy={noiseY} 
                  r={2} 
                  fill="#e74c3c" 
                  opacity={0.2 + Math.random() * 0.2} 
                />
              );
            })}
          </>
        )}
        
        {/* Axis labels */}
        <text x="125" y="78" fontSize="10" textAnchor="start">Color</text>
        <text x="75" y="20" fontSize="10" textAnchor="middle">Bloom</text>
        <text x="20" y="20" fontSize="10" textAnchor="start">Shape (size)</text>
      </g>
    );
  };
  
  // Generate animated training visualization
  const generateTrainingVisualization = () => {
    const progress = trainingProgress / 100;
    
    // Dimension discovery animation based on progress
    const colorDimension = {
      discovered: progress > 0.3,
      strength: Math.min(1, (progress - 0.3) * 5)
    };
    
    const bloomDimension = {
      discovered: progress > 0.5,
      strength: Math.min(1, (progress - 0.5) * 5)
    };
    
    const shapeDimension = {
      discovered: progress > 0.7,
      strength: Math.min(1, (progress - 0.7) * 5)
    };
    
    return (
      <div className="w-full p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-center">
          {trainingComplete ? "Training Complete!" : `Training Progress: ${Math.floor(trainingProgress)}%`}
        </h3>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000" 
            style={{ width: `${trainingProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-around items-center">
          <div className="w-1/3">
            <h4 className="text-md font-medium mb-2 text-center">Discovering Dimensions</h4>
            
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <div className="w-1/4 pr-2">
                  <div 
                    className={`h-4 rounded transition-all duration-1000 ${
                      colorDimension.discovered 
                        ? "bg-gradient-to-r from-red-500 to-blue-500" 
                        : "bg-gray-200"
                    }`}
                    style={{ opacity: colorDimension.discovered ? colorDimension.strength : 0.3 }}
                  ></div>
                </div>
                <div className="w-3/4">
                  <span className="text-sm font-medium">Dimension 1: Flower Color</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <div className="w-1/4 pr-2">
                  <div 
                    className={`h-4 rounded transition-all duration-1000 ${
                      bloomDimension.discovered 
                        ? "bg-gradient-to-r from-green-100 to-green-500" 
                        : "bg-gray-200"
                    }`}
                    style={{ opacity: bloomDimension.discovered ? bloomDimension.strength : 0.3 }}
                  ></div>
                </div>
                <div className="w-3/4">
                  <span className="text-sm font-medium">Dimension 2: Bloom Stage</span>
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center mb-1">
                <div className="w-1/4 pr-2">
                  <div 
                    className={`h-4 rounded transition-all duration-1000 ${
                      shapeDimension.discovered 
                        ? "bg-gradient-to-r from-purple-100 to-purple-500" 
                        : "bg-gray-200"
                    }`}
                    style={{ opacity: shapeDimension.discovered ? shapeDimension.strength : 0.3 }}
                  ></div>
                </div>
                <div className="w-3/4">
                  <span className="text-sm font-medium">Dimension 3: Flower Shape</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3">
            <h4 className="text-md font-medium mb-2 text-center">Latent Space Formation</h4>
            <svg width="150" height="150" viewBox="0 0 150 150" className="mx-auto">
              {generateLatentSpace(0, 0, 0, true)}
            </svg>
          </div>
        </div>
        
        {trainingComplete && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => setCurrentPhase('generation')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Training Complete - Generate New Flowers!
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Generate latent space exploration UI
  const generateLatentExploration = () => {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Explore Latent Space</h3>
          <div>
            <button 
              onClick={() => setCurrentPhase('diffusion')}
              className={`px-4 py-2 rounded transition-colors mr-2 ${
                currentPhase === 'generation'
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Try Latent Diffusion
            </button>
            <button 
              onClick={() => setCurrentPhase('generation')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPhase === 'diffusion'
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Basic Generation
            </button>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-1/3 pr-4">
            <h4 className="text-md font-medium mb-3">Adjust Latent Vector</h4>
            
            <div className="mb-6">
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium">Flower Color:</span>
                <span className="text-blue-600">{dimension1.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={dimension1} 
                onChange={(e) => setDimension1(parseFloat(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Red</span>
                <span>Purple</span>
                <span>Blue</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium">Bloom Stage:</span>
                <span className="text-blue-600">{dimension2.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={dimension2} 
                onChange={(e) => setDimension2(parseFloat(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Bud</span>
                <span>Partial</span>
                <span>Full Bloom</span>
              </div>
            </div>
            
            <div className="mb-2">
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium">Flower Shape:</span>
                <span className="text-blue-600">{dimension3.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={dimension3} 
                onChange={(e) => setDimension3(parseFloat(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Tulip-like</span>
                <span>Mixed</span>
                <span>Rose-like</span>
              </div>
            </div>
          </div>
          
          <div className="w-1/3 px-4">
            <h4 className="text-md font-medium mb-3 text-center">Latent Space</h4>
            <div className="bg-gray-100 p-2 rounded">
              <svg width="200" height="200" viewBox="0 0 150 150" className="mx-auto">
                {generateLatentSpace(dimension1, dimension2, dimension3, true)}
              </svg>
              {Math.abs(dimension1) > 1 || Math.abs(dimension2) > 1 || Math.abs(dimension3) > 1 ? (
                <div className="text-xs text-center mt-2 p-1 bg-yellow-100 rounded">
                  <span className="font-medium">Exploring beyond training data!</span>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="w-1/3 pl-4">
            <h4 className="text-md font-medium mb-3 text-center">Generated Flower</h4>
            <div className="bg-gray-100 p-2 rounded">
              <svg width="200" height="200" viewBox="0 0 300 300" className="mx-auto">
                {generateFlower(dimension1, dimension2, dimension3)}
              </svg>
            </div>
            
            {currentPhase === 'diffusion' && (
              <div className="mt-3 p-2 bg-white rounded shadow-md">
                <p className="text-sm font-medium mb-1 text-center">Diffusion Process</p>
                <div className="flex justify-center space-x-2">
                  {[...Array(5)].map((_, i) => {
                    const opacity = 0.2 + (i / 5) * 0.8;
                    return (
                      <div key={i} className="w-8 h-8 bg-gray-100 rounded overflow-hidden" style={{ opacity }}>
                        <svg width="32" height="32" viewBox="0 0 300 300">
                          {generateFlower(
                            dimension1 + (0.5 - i/10) * (Math.random() - 0.5), 
                            dimension2 + (0.5 - i/10) * (Math.random() - 0.5), 
                            dimension3 + (0.5 - i/10) * (Math.random() - 0.5)
                          )}
                        </svg>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {(Math.abs(dimension1) > 1 || Math.abs(dimension2) > 1 || Math.abs(dimension3) > 1) && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                <p className="font-medium">Novel Generation</p>
                <p>This flower combines features in ways not seen in training data!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-4 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Interactive VAE & Latent Diffusion</h2>
      
      {/* Training Data Section */}
      {currentPhase === 'training' && (
        <div className="mb-8">
          <div className="w-full p-4 bg-white rounded-lg shadow mb-4">
            <h3 className="text-lg font-medium mb-4">Step 1: Drag Training Data to the Model</h3>
            
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {trainingFlowers.map(flower => (
                <div 
                  key={flower.id}
                  className={`p-2 rounded border-2 cursor-pointer transition-all ${
                    trainedFlowers.find(f => f.id === flower.id) 
                      ? "border-green-500 bg-green-50" 
                      : "border-blue-200 bg-blue-50 hover:border-blue-400"
                  }`}
                  draggable={!trainedFlowers.find(f => f.id === flower.id)}
                  onDragStart={() => handleDragStart(flower)}
                >
                  <svg width="100" height="100" viewBox="0 0 300 300">
                    {generateFlower(flower.color, flower.bloom, flower.shape)}
                  </svg>
                  <p className="text-xs text-center mt-1">{flower.name}</p>
                </div>
              ))}
            </div>
            
            <div 
              className={`p-4 border-2 border-dashed rounded-lg text-center transition-all ${
                draggedFlower ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="text-lg font-medium mb-1">
                {draggedFlower 
                  ? "Drop to Train Model" 
                  : trainedFlowers.length > 0 
                    ? `Training with ${trainedFlowers.length} flowers` 
                    : "Drag Flowers Here to Train the VAE"
                }
              </div>
              <div className="text-sm text-gray-500">
                {trainedFlowers.length === 0 
                  ? "Add at least 2 flowers to start training" 
                  : trainedFlowers.length < 4 
                    ? "Add more flowers for better results" 
                    : "All flowers added - training in progress!"
                }
              </div>
            </div>
          </div>
          
          {trainedFlowers.length > 0 && generateTrainingVisualization()}
        </div>
      )}
      
      {/* Generation & Diffusion UI */}
      {(currentPhase === 'generation' || currentPhase === 'diffusion') && generateLatentExploration()}
      
      {/* Explanation */}
      <div className="w-full mt-6 p-4 bg-white rounded-lg shadow text-gray-700">
        <h3 className="text-lg font-semibold mb-2">How Latent Diffusion Works</h3>
        
        {currentPhase === 'training' && (
          <>
            <p className="mb-2"><strong>Step 1:</strong> Drag different flower examples to train the VAE.</p>
            <p className="mb-2"><strong>Step 2:</strong> Watch as the model discovers latent dimensions that capture meaningful variation.</p>
            <p className="mb-2">The VAE learns to encode similar features into the same dimensions without explicit labels.</p>
          </>
        )}
        
        {currentPhase === 'generation' && (
          <>
            <p className="mb-2">You're now exploring the learned latent space! Move the sliders to generate different flowers.</p>
            <p className="mb-2">The power of VAEs is their ability to create a <strong>continuous latent space</strong>. This means:</p>
            <ul className="list-disc pl-5 mb-3">
              <li>You can generate variations not seen in the training data</li>
              <li>Moving beyond ±1.0 explores novel combinations of features</li>
              <li>The model generalizes from limited examples to a continuous space</li>
            </ul>
            <p>Try creating a purple flower with a unique petal shape - a combination not in your training data!</p>
          </>
        )}
        
        {currentPhase === 'diffusion' && (
          <>
            <p className="mb-2"><strong>Latent Diffusion</strong> takes VAEs further by adding controlled randomness:</p>
            <ol className="list-decimal pl-5 mb-3">
              <li>Start with a point in latent space (your adjusted vector)</li>
              <li>Add noise to create variations around this point</li>
              <li>Gradually denoise to produce multiple related but different outputs</li>
            </ol>
            <p className="mb-2">This is how models like Stable Diffusion work, but in much higher dimensions (64-512+).</p>
            <p>The key insight: adding noise and then removing it allows exploring the latent manifold in ways that generate novel, coherent images.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InteractiveVAEDiffusion;
