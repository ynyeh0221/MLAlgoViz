import React, { useState, useEffect } from 'react';

const BetaVAEVisualization = () => {
  const [beta, setBeta] = useState(1.0);
  const [latentData, setLatentData] = useState([]);
  const [lossValues, setLossValues] = useState({ kl: 0.2, recon: 0.1 });
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });
  
  // Set up responsive dimensions
  useEffect(() => {
    // Initial sizing
    updateDimensions();
    
    // Update on resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const updateDimensions = () => {
    // Get available width (capped at reasonable max size)
    const containerWidth = Math.min(
      document.body.clientWidth - 40, 
      800
    );
    
    // Determine if we should switch to vertical layout
    const isMobile = containerWidth < 600;
    
    // Calculate graph width and height based on container
    const graphWidth = isMobile ? containerWidth - 40 : (containerWidth / 2) - 40;
    const graphHeight = Math.min(300, graphWidth * 0.8);
    
    setDimensions({
      width: graphWidth,
      height: graphHeight,
      isMobile
    });
  };
  
  // Generate latent space data based on beta value
  useEffect(() => {
    try {
      // Higher beta = more disentangled (clearer clusters)
      const disentanglementFactor = Math.min(beta, 4) / 4;
      const entanglementFactor = 1 - disentanglementFactor;
      
      // Generate data for 5 different classes
      const newData = [];
      for (let classIdx = 0; classIdx < 5; classIdx++) {
        for (let i = 0; i < 10; i++) {
          // Base position for each class
          const baseX = (classIdx - 2) * 2;
          const baseY = Math.sin(classIdx * Math.PI / 2.5) * 2;
          
          // More noise and overlap for lower beta values
          const noiseX = (Math.random() - 0.5) * 2 * (1 + entanglementFactor * 3);
          const noiseY = (Math.random() - 0.5) * 2 * (1 + entanglementFactor * 3);
          
          newData.push({
            id: `${classIdx}-${i}`,
            x: baseX + noiseX,
            y: baseY + noiseY,
            classIdx
          });
        }
      }
      
      setLatentData(newData);
      
      // Update loss values
      const kl = 0.2 + Math.min(beta, 4) / 8;
      const recon = 0.1 + Math.min(beta, 4) / 6;
      setLossValues({ kl, recon, total: recon + beta * kl });
    } catch (error) {
      console.error("Error generating latent data:", error);
      // Set fallback data if there's an error
      setLatentData([]);
    }
  }, [beta]);
  
  // Safe margin calculation with fallbacks
  const margin = Math.max(10, Math.min(30, dimensions.width * 0.08));
  
  // Colors for different classes
  const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];
  
  // Calculate plot dimensions with safeguards
  const plotWidth = Math.max(50, dimensions.width - 2 * margin);
  const plotHeight = Math.max(50, dimensions.height - 2 * margin);
  
  // Calculate scales with defensive coding
  let xMin = -5, xMax = 5, yMin = -5, yMax = 5;
  
  // Only recalculate if we have data
  if (latentData.length > 0) {
    const xValues = latentData.map(d => d.x);
    const yValues = latentData.map(d => d.y);
    
    xMin = Math.min(...xValues);
    xMax = Math.max(...xValues);
    yMin = Math.min(...yValues);
    yMax = Math.max(...yValues);
    
    // Add padding and handle identical min/max
    if (xMin === xMax) {
      xMin -= 1;
      xMax += 1;
    } else {
      const xPadding = (xMax - xMin) * 0.1;
      xMin -= xPadding;
      xMax += xPadding;
    }
    
    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    } else {
      const yPadding = (yMax - yMin) * 0.1;
      yMin -= yPadding;
      yMax += yPadding;
    }
  }
  
  // Scale points to fit in the plot area
  const scaleX = x => margin + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const scaleY = y => margin + ((y - yMin) / (yMax - yMin)) * plotHeight;
  
  // If dimensions aren't set yet, render a placeholder
  if (dimensions.width === 0) {
    return <div className="p-4 text-center">Loading visualization...</div>;
  }
  
  return (
    <div className="p-2 mx-auto" style={{ maxWidth: '800px' }}>
      <h2 className="text-xl font-bold mb-4 text-center">β-VAE Latent Space Visualization</h2>
      
      {/* Beta slider */}
      <div className="mb-6 px-2">
        <label className="block text-sm font-medium mb-1">
          β value: {beta.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.1"
          max="4"
          step="0.1"
          value={beta}
          onChange={e => setBeta(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className={`flex ${dimensions.isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
        {/* Latent space visualization */}
        <div className="border rounded p-2 flex-1">
          <h3 className="text-sm font-medium mb-2 text-center">Latent Space</h3>
          <div className="flex justify-center">
            <svg 
              width={dimensions.width} 
              height={dimensions.height} 
              className="bg-gray-50 rounded shadow-inner"
              style={{ minHeight: '200px' }}
            >
              {/* Axes */}
              <line 
                x1={margin} 
                y1={dimensions.height/2} 
                x2={dimensions.width-margin} 
                y2={dimensions.height/2} 
                stroke="#ccc" 
                strokeWidth="1"
              />
              <line 
                x1={dimensions.width/2} 
                y1={margin} 
                x2={dimensions.width/2} 
                y2={dimensions.height-margin} 
                stroke="#ccc" 
                strokeWidth="1"
              />
              
              {/* Points */}
              {latentData.map(point => (
                <circle
                  key={point.id}
                  cx={scaleX(point.x)}
                  cy={scaleY(point.y)}
                  r={Math.max(3, Math.min(6, dimensions.width * 0.01))}
                  fill={colors[point.classIdx % colors.length]}
                  opacity={0.7}
                />
              ))}
            </svg>
          </div>
          <div className="text-xs mt-1 text-center">
            More clustered = Better disentanglement
          </div>
        </div>
        
        {/* Loss values visualization */}
        <div className="border rounded p-2 flex-1">
          <h3 className="text-sm font-medium mb-2 text-center">Loss Components</h3>
          
          {/* Simpler, more robust chart implementation */}
          <div className="flex justify-center items-end h-48 gap-8 mt-4 mb-6">
            {/* Reconstruction loss */}
            <div className="flex flex-col items-center">
              <div 
                style={{
                  width: '40px',
                  height: `${Math.max(20, lossValues.recon * 150)}px`,
                  backgroundColor: '#3B82F6',
                  display: 'block',
                  borderRadius: '4px 4px 0 0',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              ></div>
              <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
                Recon.
              </div>
            </div>
            
            {/* KL divergence */}
            <div className="flex flex-col items-center">
              <div 
                style={{
                  width: '40px',
                  height: `${Math.max(20, lossValues.kl * 150)}px`,
                  backgroundColor: '#EF4444',
                  display: 'block',
                  borderRadius: '4px 4px 0 0',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              ></div>
              <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
                KL Div.
              </div>
            </div>
            
            {/* Total loss */}
            <div className="flex flex-col items-center">
              <div 
                style={{
                  width: '40px',
                  height: `${Math.max(20, lossValues.total * 50)}px`,
                  backgroundColor: '#8B5CF6',
                  display: 'block',
                  borderRadius: '4px 4px 0 0',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              ></div>
              <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
                Total
              </div>
            </div>
          </div>
          
          <div className="text-xs mt-3 text-center">
            β = {beta.toFixed(1)} weighs the KL divergence term
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm p-2">
        <h3 className="font-medium">Impact of β parameter:</h3>
        <ul className="list-disc pl-6 mt-1 space-y-1">
          <li><strong>Low β</strong> (0.1-1): Prioritizes reconstruction accuracy, leads to less disentangled latent space</li>
          <li><strong>β = 1</strong>: Standard VAE</li>
          <li><strong>High β</strong> (&gt;1): Encourages disentanglement, clearer separation in latent space, but worse reconstruction</li>
        </ul>
      </div>
    </div>
  );
};

export default BetaVAEVisualization;
