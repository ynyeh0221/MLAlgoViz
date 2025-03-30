import React, { useState, useEffect } from 'react';

const EigenvalueVisualization = () => {
  const [matrix, setMatrix] = useState({
    a: 1.5, b: 0.5,
    c: 0.5, d: 1.0
  });
  
  const [iterations, setIterations] = useState(1);
  const [randomVectors, setRandomVectors] = useState([]);
  
  // Calculate eigenvalues and eigenvectors
  const calculateEigen = () => {
    const { a, b, c, d } = matrix;
    
    const trace = a + d;
    const det = a * d - b * c;
    
    // Check if we have complex eigenvalues
    const discriminantValue = trace * trace - 4 * det;
    
    let eigenvalue1, eigenvalue2;
    let isComplex = false;
    
    if (discriminantValue >= 0) {
      // Real eigenvalues
      const discriminant = Math.sqrt(discriminantValue);
      eigenvalue1 = (trace + discriminant) / 2;
      eigenvalue2 = (trace - discriminant) / 2;
    } else {
      // Complex eigenvalues
      isComplex = true;
      const realPart = trace / 2;
      const imagPart = Math.sqrt(-discriminantValue) / 2;
      // Use magnitude of complex number for scaling
      const magnitude = Math.sqrt(realPart * realPart + imagPart * imagPart);
      eigenvalue1 = magnitude;
      eigenvalue2 = magnitude;
    }
    
    // Calculate eigenvectors
    let eigenvector1 = [1, 0];
    let eigenvector2 = [0, 1];
    
    if (b !== 0) {
      eigenvector1 = [1, (eigenvalue1 - a) / b];
      eigenvector2 = [1, (eigenvalue2 - a) / b];
    } else if (c !== 0) {
      eigenvector1 = [(eigenvalue1 - d) / c, 1];
      eigenvector2 = [(eigenvalue2 - d) / c, 1];
    }
    
    // Normalize eigenvectors
    const normalize = (v) => {
      const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
      return [v[0] / mag, v[1] / mag];
    };
    
    return {
      eigenvalues: [eigenvalue1, eigenvalue2],
      eigenvectors: [normalize(eigenvector1), normalize(eigenvector2)]
    };
  };
  
  // Apply matrix transformation
  const applyTransformation = (x, y, iterations = 1) => {
    let currentX = x;
    let currentY = y;
    
    for (let i = 0; i < iterations; i++) {
      const newX = matrix.a * currentX + matrix.b * currentY;
      const newY = matrix.c * currentX + matrix.d * currentY;
      currentX = newX;
      currentY = newY;
    }
    
    return [currentX, currentY];
  };
  
  // Generate random vectors
  useEffect(() => {
    const vectors = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 0.2 + Math.random() * 0.3;
      vectors.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    setRandomVectors(vectors);
  }, []);
  
  // Calculate transformed vectors
  const transformedVectors = randomVectors.map(v => ({
    original: v,
    transformed: applyTransformation(v[0], v[1], iterations)
  }));
  
  // Calculate eigenvalues and eigenvectors
  const { eigenvalues, eigenvectors } = calculateEigen();
  
  // Transformed eigenvectors (only change length, direction stays the same)
  const transformedEigenvectors = eigenvectors.map((v, i) => {
    const scaleFactor = Math.pow(eigenvalues[i], iterations);
    return [v[0] * scaleFactor, v[1] * scaleFactor];
  });
  
  // Visualization settings
  const width = 600;
  const height = 400;
  const scaleX = x => (x * 100) + width / 2;
  const scaleY = y => height / 2 - (y * 100);
  
  // Preset matrices
  const presetMatrices = [
    { name: "Scaling", matrix: { a: 2.0, b: 0.0, c: 0.0, d: 0.5 } },
    { name: "Rotation", matrix: { a: 0.7, b: -0.7, c: 0.7, d: 0.7 } },
    { name: "Shear", matrix: { a: 1.0, b: 0.5, c: 0.0, d: 1.0 } }
  ];
  
  return (
    <div className="flex flex-col items-center w-full p-4">
      <h1 className="text-xl font-bold mb-2">Eigenvalues and Repeated Linear Transformations</h1>
      
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-2">Transformation Settings</h2>
          
          <div className="bg-blue-50 p-2 rounded mb-3 text-xs">
            <p className="font-semibold mb-1">Matrix [a b; c d] parameters:</p>
            <p><strong>a</strong>: x-axis scaling factor</p>
            <p><strong>b</strong>: y's influence on x (horizontal shear)</p>
            <p><strong>c</strong>: x's influence on y (vertical shear)</p>
            <p><strong>d</strong>: y-axis scaling factor</p>
          </div>
          
          {/* Matrix inputs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {['a', 'b', 'c', 'd'].map(key => (
              <div key={key}>
                <label className="block text-sm">{key}:</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={matrix[key]} 
                  onChange={(e) => setMatrix({...matrix, [key]: parseFloat(e.target.value)})}
                  className="w-full p-1 border rounded"
                />
              </div>
            ))}
          </div>
          
          {/* Preset matrices */}
          <div className="flex flex-wrap gap-2 mb-4">
            {presetMatrices.map((preset, index) => (
              <button
                key={index}
                onClick={() => setMatrix(preset.matrix)}
                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                {preset.name}
              </button>
            ))}
          </div>
          
          {/* Iteration control */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm">Iterations:</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={iterations}
              onChange={(e) => setIterations(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm">{iterations.toFixed(1)}</span>
          </div>
          
          {/* Eigenvalue information */}
          <div className="mt-2 bg-white p-3 rounded border text-sm">
            <p className="mb-1"><strong>Eigenvalue λ₁:</strong> {eigenvalues[0].toFixed(2)}</p>
            <p className="mb-1"><strong>Eigenvalue λ₂:</strong> {eigenvalues[1].toFixed(2)}</p>
            <p className="mb-1"><strong>λ₁^{iterations.toFixed(1)}:</strong> {Math.pow(eigenvalues[0], iterations).toFixed(2)}</p>
            <p className="mb-1"><strong>λ₂^{iterations.toFixed(1)}:</strong> {Math.pow(eigenvalues[1], iterations).toFixed(2)}</p>
            {/* Rotation matrix hint */}
            {matrix.a.toFixed(1) === matrix.d.toFixed(1) && 
             matrix.b.toFixed(1) === (-matrix.c).toFixed(1) &&
             matrix.b !== 0 &&
              <p className="text-xs mt-1">Rotation matrices have complex eigenvalues; showing magnitude</p>
            }
          </div>
        </div>
        
        {/* Visualization area */}
        <div className="flex-grow bg-white border rounded-lg overflow-hidden">
          <svg width={width} height={height}>
            {/* Coordinate axes */}
            <line x1={0} y1={height/2} x2={width} y2={height/2} stroke="#ccc" strokeWidth="1" />
            <line x1={width/2} y1={0} x2={width/2} y2={height} stroke="#ccc" strokeWidth="1" />
            
            {/* Grid lines */}
            {[-2, -1, 1, 2].map(i => (
              <React.Fragment key={i}>
                <line 
                  x1={scaleX(i)} y1={0} x2={scaleX(i)} y2={height} 
                  stroke="#eee" strokeWidth="1" 
                />
                <line 
                  x1={0} y1={scaleY(i)} x2={width} y2={scaleY(i)} 
                  stroke="#eee" strokeWidth="1" 
                />
              </React.Fragment>
            ))}
            
            {/* Random vectors */}
            {transformedVectors.map((vector, index) => (
              <g key={index}>
                {/* Original vector */}
                <line
                  x1={scaleX(0)}
                  y1={scaleY(0)}
                  x2={scaleX(vector.original[0])}
                  y2={scaleY(vector.original[1])}
                  stroke="#ddd"
                  strokeWidth="1"
                />
                <circle
                  cx={scaleX(vector.original[0])}
                  cy={scaleY(vector.original[1])}
                  r="3"
                  fill="#aaa"
                />
                
                {/* Transformed vector */}
                <line
                  x1={scaleX(0)}
                  y1={scaleY(0)}
                  x2={scaleX(vector.transformed[0])}
                  y2={scaleY(vector.transformed[1])}
                  stroke="#2980b9"
                  strokeWidth="1.5"
                />
                <circle
                  cx={scaleX(vector.transformed[0])}
                  cy={scaleY(vector.transformed[1])}
                  r="4"
                  fill="#2980b9"
                />
              </g>
            ))}
            
            {/* Eigenvectors */}
            {eigenvectors.map((vector, index) => {
              const color = index === 0 ? "#e74c3c" : "#2ecc71";
              return (
                <g key={`eigen-${index}`}>
                  {/* Original eigenvector */}
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(0)}
                    x2={scaleX(vector[0])}
                    y2={scaleY(vector[1])}
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  
                  {/* Transformed eigenvector */}
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(0)}
                    x2={scaleX(transformedEigenvectors[index][0])}
                    y2={scaleY(transformedEigenvectors[index][1])}
                    stroke={color}
                    strokeWidth="2"
                  />
                  <circle
                    cx={scaleX(transformedEigenvectors[index][0])}
                    cy={scaleY(transformedEigenvectors[index][1])}
                    r="5"
                    fill={color}
                  />
                  
                  {/* Label */}
                  <text
                    x={scaleX(vector[0] * 1.1)}
                    y={scaleY(vector[1] * 1.1)}
                    fill={color}
                    fontSize="12"
                  >
                    λ{index + 1}={eigenvalues[index].toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* Brief explanation */}
      <div className="bg-gray-100 p-3 rounded-lg w-full mt-4 text-sm">
        <p>This visualization demonstrates the role of eigenvalues in repeated transformations:</p>
        <ul className="list-disc pl-6 mt-1">
          <li>Eigenvectors (colored lines) maintain their direction during transformation</li>
          <li>Eigenvector length changes by eigenvalue raised to power n (λⁿ)</li>
          <li>Gray dots are original vectors, blue dots are transformed vectors</li>
          <li>Try different matrices and iteration counts to observe changes</li>
        </ul>
      </div>
    </div>
  );
};

export default EigenvalueVisualization;
