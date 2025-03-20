import React, { useState } from 'react';

const StableVAEVisualization = () => {
  // Latent vector dimensions with initial values
  const [dimension1, setDimension1] = useState(0);
  const [dimension2, setDimension2] = useState(0);
  const [dimension3, setDimension3] = useState(0);
  
  // Mode switching
  const [diffusionMode, setDiffusionMode] = useState(false);
  
  // Function to generate SVG representation of flower
  const generateFlower = (dim1, dim2, dim3) => {
    // Color interpolation from red to blue
    const redValue = Math.max(0, Math.min(255, 255 - Math.floor((dim1 + 1) * 127.5)));
    const blueValue = Math.max(0, Math.min(255, Math.floor((dim1 + 1) * 127.5)));
    const flowerColor = `rgb(${redValue}, 50, ${blueValue})`;
    
    // Bloom level affects petal size
    const bloomFactor = Math.max(0.1, (dim2 + 1) * 0.45 + 0.1); // 0.1 to 1.0
    
    // Shape factor affects petal shape
    const shapeFactor = dim3; // -1 to 1
    
    // Stem
    const stemHeight = 80;
    const stemWidth = 4;
    
    return (
      <g transform="translate(50, 50)">
        {/* Stem */}
        <rect 
          x={-stemWidth/2} 
          y={0} 
          width={stemWidth} 
          height={stemHeight} 
          fill="#2E8B57" 
        />
        
        {/* Leaf */}
        <path 
          d={`M ${-stemWidth/2},${stemHeight*0.5} C ${-20},${stemHeight*0.4} ${-25},${stemHeight*0.6} ${-10},${stemHeight*0.7}`} 
          fill="#3CB371" 
          stroke="#2E8B57" 
          strokeWidth="1" 
        />
        
        {/* Flower center */}
        <circle cx="0" cy="0" r={10 * bloomFactor} fill="#FFD700" />
        
        {/* Petals */}
        {[...Array(shapeFactor < 0 ? 5 : 8)].map((_, i) => {
          const angle = (i * 2 * Math.PI) / (shapeFactor < 0 ? 5 : 8);
          const petalLength = 25 * bloomFactor;
          const controlPointFactor = shapeFactor < 0 ? 0.4 : 0.8;
          const controlPoint = petalLength * controlPointFactor;
          
          return (
            <path
              key={i}
              d={`
                M 0,0
                Q ${Math.cos(angle) * controlPoint},${Math.sin(angle) * controlPoint} 
                  ${Math.cos(angle) * petalLength},${Math.sin(angle) * petalLength}
                Q ${Math.cos(angle + 0.2) * controlPoint},${Math.sin(angle + 0.2) * controlPoint}
                  0,0
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
  
  // Generate small example flower
  const generateSmallFlower = (dim1, dim2, dim3) => {
    return (
      <svg width="60" height="60" viewBox="0 0 100 100">
        {generateFlower(dim1, dim2, dim3)}
      </svg>
    );
  };
  
  // Generate latent space visualization
  const generateLatentSpace = () => {
    // Training point coordinates
    const trainingPoints = [
      { x: 25, y: 25, color: "#3498db" },  // top-left
      { x: 75, y: 25, color: "#3498db" },  // top-right
      { x: 25, y: 75, color: "#3498db" },  // bottom-left
      { x: 75, y: 75, color: "#3498db" }   // bottom-right
    ];
    
    // Current point coordinates
    const x = 50 + dimension1 * 25;
    const y = 50 + dimension2 * 25;
    
    return (
      <svg width="180" height="180" style={{backgroundColor: "#f0f9ff", border: "1px solid #3498db"}}>
        {/* Grid lines */}
        <line x1="0" y1="90" x2="180" y2="90" stroke="#3498db" strokeWidth="1" />
        <line x1="90" y1="0" x2="90" y2="180" stroke="#3498db" strokeWidth="1" />
        
        {/* Axis labels */}
        <text x="170" y="85" fontSize="12" textAnchor="end">Color</text>
        <text x="95" y="15" fontSize="12" textAnchor="start">Shape</text>
        <text x="95" y="175" fontSize="12" textAnchor="start">Bloom</text>
        
        {/* Training points */}
        {trainingPoints.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="8" fill={point.color} opacity="0.6" />
        ))}
        
        {/* Current point */}
        <circle cx={x} cy={y} r="10" fill="#e74c3c" />
        
        {/* Diffusion noise */}
        {diffusionMode && [...Array(10)].map((_, i) => {
          const noiseX = x + (Math.random() - 0.5) * 20;
          const noiseY = y + (Math.random() - 0.5) * 20;
          return (
            <circle key={i} cx={noiseX} cy={noiseY} r="3" fill="#e74c3c" opacity="0.3" />
          );
        })}
      </svg>
    );
  };
  
  // Main render
  return (
    <div style={{maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif"}}>
      <h1 style={{textAlign: "center", marginBottom: "20px"}}>VAE Latent Space Exploration</h1>
      
      {/* Training data section */}
      <div style={{marginBottom: "30px", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"}}>
        <h2 style={{marginBottom: "15px"}}>How VAEs Represent Images</h2>
        
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px"}}>
          <div style={{border: "1px solid #eee", padding: "10px", borderRadius: "8px", backgroundColor: "#f8f8f8"}}>
            <h3 style={{textAlign: "center", marginBottom: "10px", fontSize: "16px"}}>Training Data</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"}}>
              {generateSmallFlower(-0.8, 0.7, 0.2)}
              {generateSmallFlower(0.8, 0.6, 0.3)}
              {generateSmallFlower(-0.7, -0.8, 0.1)}
              {generateSmallFlower(0.7, -0.5, -0.7)}
            </div>
          </div>
          
          <div style={{border: "1px solid #eee", padding: "10px", borderRadius: "8px", backgroundColor: "#f8f8f8", textAlign: "center"}}>
            <h3 style={{marginBottom: "10px", fontSize: "16px"}}>Learned Dimensions</h3>
            <div style={{marginBottom: "8px"}}>
              <div style={{height: "12px", background: "linear-gradient(to right, red, blue)", borderRadius: "3px", marginBottom: "4px"}}></div>
              <div style={{fontSize: "14px"}}>Dimension 1: Color</div>
            </div>
            <div style={{marginBottom: "8px"}}>
              <div style={{height: "12px", background: "linear-gradient(to right, #e0f7e0, #2e8b57)", borderRadius: "3px", marginBottom: "4px"}}></div>
              <div style={{fontSize: "14px"}}>Dimension 2: Bloom</div>
            </div>
            <div>
              <div style={{height: "12px", background: "linear-gradient(to right, #f0e6f6, #8e44ad)", borderRadius: "3px", marginBottom: "4px"}}></div>
              <div style={{fontSize: "14px"}}>Dimension 3: Shape</div>
            </div>
          </div>
          
          <div style={{border: "1px solid #eee", padding: "10px", borderRadius: "8px", backgroundColor: "#f8f8f8", display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h3 style={{marginBottom: "10px", fontSize: "16px"}}>Continuous Latent Space</h3>
            <div style={{position: "relative", width: "100px", height: "100px", border: "1px solid #3498db", borderRadius: "4px", marginTop: "10px"}}>
              <div style={{position: "absolute", top: "45%", width: "100%", height: "1px", backgroundColor: "#3498db"}}></div>
              <div style={{position: "absolute", left: "50%", height: "100%", width: "1px", backgroundColor: "#3498db"}}></div>
              <div style={{position: "absolute", left: "25%", top: "25%", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3498db"}}></div>
              <div style={{position: "absolute", left: "75%", top: "25%", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3498db"}}></div>
              <div style={{position: "absolute", left: "25%", top: "75%", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3498db"}}></div>
              <div style={{position: "absolute", left: "75%", top: "75%", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3498db"}}></div>
            </div>
            <div style={{fontSize: "14px", marginTop: "10px"}}>Any point = a flower</div>
          </div>
        </div>
      </div>
      
      {/* Interactive section */}
      <div style={{marginBottom: "30px", backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px"}}>
          <h2 style={{margin: 0}}>Explore Latent Space</h2>
          <div>
            <button 
              onClick={() => setDiffusionMode(true)}
              style={{
                padding: "8px 12px",
                marginRight: "8px",
                backgroundColor: diffusionMode ? "#8e44ad" : "#f0f0f0",
                color: diffusionMode ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Try Latent Diffusion
            </button>
            <button 
              onClick={() => setDiffusionMode(false)}
              style={{
                padding: "8px 12px",
                backgroundColor: !diffusionMode ? "#3498db" : "#f0f0f0",
                color: !diffusionMode ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Basic Generation
            </button>
          </div>
        </div>
        
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px"}}>
          {/* Sliders */}
          <div>
            <h3 style={{marginBottom: "15px", fontSize: "16px"}}>Adjust Latent Vector</h3>
            
            <div style={{marginBottom: "20px"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
                <label>Flower Color:</label>
                <span style={{color: "#3498db"}}>{dimension1.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={dimension1} 
                onChange={(e) => setDimension1(parseFloat(e.target.value))} 
                style={{width: "100%"}}
              />
              <div style={{display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666"}}>
                <span>Red</span>
                <span>Purple</span>
                <span>Blue</span>
              </div>
            </div>
            
            <div style={{marginBottom: "20px"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
                <label>Bloom Stage:</label>
                <span style={{color: "#3498db"}}>{dimension2.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={dimension2} 
                onChange={(e) => setDimension2(parseFloat(e.target.value))} 
                style={{width: "100%"}}
              />
              <div style={{display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666"}}>
                <span>Bud</span>
                <span>Partial</span>
                <span>Full Bloom</span>
              </div>
            </div>
            
            <div>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
                <label>Flower Shape:</label>
                <span style={{color: "#3498db"}}>{dimension3.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="-1.5" 
                max="1.5" 
                step="0.01" 
                value={dimension3} 
                onChange={(e) => setDimension3(parseFloat(e.target.value))} 
                style={{width: "100%"}}
              />
              <div style={{display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666"}}>
                <span>Tulip-like</span>
                <span>Mixed</span>
                <span>Rose-like</span>
              </div>
            </div>
          </div>
          
          {/* Latent Space */}
          <div style={{textAlign: "center"}}>
            <h3 style={{marginBottom: "15px", fontSize: "16px"}}>Latent Space</h3>
            {generateLatentSpace()}
            {(Math.abs(dimension1) > 1 || Math.abs(dimension2) > 1 || Math.abs(dimension3) > 1) && (
              <div style={{
                fontSize: "12px", 
                padding: "4px 8px", 
                backgroundColor: "#fff9e0", 
                borderRadius: "4px", 
                marginTop: "8px",
                display: "inline-block"
              }}>
                Exploring beyond training data!
              </div>
            )}
          </div>
          
          {/* Generated Flower */}
          <div style={{textAlign: "center"}}>
            <h3 style={{marginBottom: "15px", fontSize: "16px"}}>Generated Flower</h3>
            <svg width="180" height="180" viewBox="0 0 100 100" style={{backgroundColor: "#f8f8f8", borderRadius: "4px"}}>
              {generateFlower(dimension1, dimension2, dimension3)}
            </svg>
            
            {diffusionMode && (
              <div style={{marginTop: "10px", padding: "8px", backgroundColor: "white", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"}}>
                <p style={{fontSize: "14px", marginBottom: "5px", fontWeight: "500"}}>Diffusion Process</p>
                <div style={{display: "flex", justifyContent: "center", gap: "5px"}}>
                  {[...Array(5)].map((_, i) => {
                    const opacity = 0.2 + (i / 5) * 0.8;
                    return (
                      <div key={i} style={{opacity}}>
                        <svg width="32" height="32" viewBox="0 0 100 100" style={{backgroundColor: "#f0f0f0", borderRadius: "2px"}}>
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
          </div>
        </div>
      </div>
      
      {/* Explanation */}
      <div style={{backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"}}>
        <h2 style={{marginBottom: "15px"}}>How VAEs & Latent Diffusion Work</h2>
        
        <div style={{marginBottom: "20px"}}>
          <h3 style={{fontSize: "18px", marginBottom: "10px"}}>VAE Latent Space</h3>
          <p style={{marginBottom: "10px"}}>Variational Autoencoders (VAEs) learn to compress images into a continuous latent space where:</p>
          <ul style={{paddingLeft: "20px", marginBottom: "10px"}}>
            <li>Similar features are mapped to similar regions</li>
            <li>Each dimension controls a specific visual attribute</li>
            <li>The space is continuous, allowing smooth interpolation</li>
            <li>Novel combinations beyond training data can be generated</li>
          </ul>
        </div>
        
        <div>
          <h3 style={{fontSize: "18px", marginBottom: "10px"}}>Latent Diffusion</h3>
          <p style={{marginBottom: "10px"}}>Diffusion models like Stable Diffusion extend this by:</p>
          <ol style={{paddingLeft: "20px"}}>
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

export default StableVAEVisualization;
