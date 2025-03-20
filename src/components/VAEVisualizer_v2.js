import React, { useState, useEffect } from 'react';

const SimplifiedVAEVisualization = () => {
  // State for tracking the current view/phase
  const [currentPhase, setCurrentPhase] = useState('exploration'); // exploration or diffusion
  
  // Latent vector dimensions with initial values
  const [dimension1, setDimension1] = useState(0);
  const [dimension2, setDimension2] = useState(0);
  const [dimension3, setDimension3] = useState(0);
  
  // Function to generate SVG representation of flower based on latent dimensions
  const generateFlower = (dim1, dim2, dim3) => {
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
  
  // Generate a representation of the latent space
  const generateLatentSpace = (dim1, dim2, dim3) => {
    // Position in latent space
    const x = 75 + dim1 * 40;
    const y = 75 + dim2 * 40;
    const radius = 5 + (dim3 + 1) * 2;
    
    // Sample points representing the training data
    const trainingPoints = [
      { color: -0.8, bloom: 0.7, shape: 0.2 },  // Red tulip, full bloom
      { color: 0.8, bloom: 0.6, shape: 0.3 },   // Blue daisy, full bloom
      { color: -0.7, bloom: -0.8, shape: 0.1 }, // Red bud flower
      { color: 0.7, bloom: -0.5, shape: -0.7 }  // Blue rose bud
    ];
    
    return (
      <g>
        {/* Latent space grid */}
        <rect x="25" y="25" width="100" height="100" fill="#f0f9ff" stroke="#3498db" strokeWidth="1" />
        <line x1="25" y1="75" x2="125" y2="75" stroke="#3498db" strokeWidth="0.5" />
        <line x1="75" y1="25" x2="75" y2="125" stroke="#3498db" strokeWidth="0.5" />
        
        {/* Show training points in latent space */}
        {trainingPoints.map((point, index) => (
          <circle 
            key={index} 
            cx={75 + point.color * 40} 
            cy={75 + point.bloom * 40} 
            r={5 + (point.shape + 1) * 2} 
            fill="#3498db" 
            opacity="0.6" 
          />
        ))}
        
        {/* Current point */}
        <circle cx={x} cy={y} r={radius} fill="#e74c3c" />
        
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
                currentPhase === 'exploration'
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Try Latent Diffusion
            </button>
            <button 
              onClick={() => setCurrentPhase('exploration')}
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
                {generateLatentSpace(dimension1, dimension2, dimension3)}
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
      <h2 className="text-2xl font-bold text-center mb-6">VAE Latent Space Exploration</h2>
      
      <div className="w-full mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3">How VAEs Represent Images</h3>
        <div className="flex items-center">
          <div className="w-1/3 p-2">
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="text-sm font-medium mb-2 text-center">Training Data</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-1 bg-white rounded">
                  <svg width="70" height="70" viewBox="0 0 300 300">
                    {generateFlower(-0.8, 0.7, 0.2)}
                  </svg>
                </div>
                <div className="p-1 bg-white rounded">
                  <svg width="70" height="70" viewBox="0 0 300 300">
                    {generateFlower(0.8, 0.6, 0.3)}
                  </svg>
                </div>
                <div className="p-1 bg-white rounded">
                  <svg width="70" height="70" viewBox="0 0 300 300">
                    {generateFlower(-0.7, -0.8, 0.1)}
                  </svg>
                </div>
                <div className="p-1 bg-white rounded">
                  <svg width="70" height="70" viewBox="0 0 300 300">
                    {generateFlower(0.7, -0.5, -0.7)}
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3 p-2 flex flex-col items-center">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="50" height="20" viewBox="0 0 50 20">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                    </marker>
                  </defs>
                  <line x1="0" y1="10" x2="40" y2="10" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
                </svg>
              </div>
              <div className="bg-purple-50 p-3 rounded text-center">
                <h4 className="text-sm font-medium mb-2">Learned Dimensions</h4>
                <div className="mb-2">
                  <span className="inline-block w-4 h-4 mr-1 bg-gradient-to-r from-red-500 to-blue-500 rounded"></span>
                  <span className="text-xs">Dimension 1: Color</span>
                </div>
                <div className="mb-2">
                  <span className="inline-block w-4 h-4 mr-1 bg-gradient-to-r from-green-100 to-green-500 rounded"></span>
                  <span className="text-xs">Dimension 2: Bloom</span>
                </div>
                <div>
                  <span className="inline-block w-4 h-4 mr-1 bg-gradient-to-r from-purple-100 to-purple-500 rounded"></span>
                  <span className="text-xs">Dimension 3: Shape</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3 p-2">
            <div className="bg-green-50 p-3 rounded">
              <h4 className="text-sm font-medium mb-2 text-center">Continuous Latent Space</h4>
              <div className="h-32 relative bg-white rounded p-2">
                <svg width="100%" height="100%" viewBox="0 0 150 150">
                  {generateLatentSpace(0, 0, 0)}
                </svg>
                <div className="absolute bottom-2 right-2 text-xs bg-white bg-opacity-75 p-1 rounded">
                  <span>Any point = a flower</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Generation & Diffusion UI */}
      {generateLatentExploration()}
      
      {/* Explanation */}
      <div className="w-full mt-6 p-4 bg-white rounded-lg shadow text-gray-700">
        <h3 className="text-lg font-semibold mb-2">How VAEs & Latent Diffusion Work</h3>
        
        <div className="mb-4">
          <h4 className="font-medium">VAE Latent Space</h4>
          <p className="text-sm mb-2">Variational Autoencoders (VAEs) learn to compress images into a continuous latent space where:</p>
          <ul className="list-disc pl-5 text-sm mb-2">
            <li>Similar features are mapped to similar regions</li>
            <li>Each dimension controls a specific visual attribute</li>
            <li>The space is continuous, allowing smooth interpolation</li>
            <li>Novel combinations beyond training data can be generated</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium">Latent Diffusion</h4>
          <p className="text-sm mb-2">Diffusion models like Stable Diffusion extend this by:</p>
          <ol className="list-decimal pl-5 text-sm">
            <li>Adding noise to latent vectors to create variations</li>
            <li>Learning to remove noise in a controlled way</li>
            <li>Enabling text-guided latent space navigation</li>
            <li>Allowing for creative generation beyond the training distribution</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedVAEVisualization;
