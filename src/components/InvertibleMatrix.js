import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';

const InvertibleMatricesDemo = () => {
  // State for UI settings
  const [showDetails, setShowDetails] = useState(true);
  const [matrix, setMatrix] = useState([
    [3, 1],
    [2, 2]
  ]);
  const [inverse, setInverse] = useState(null);
  const [determinant, setDeterminant] = useState(null);
  const [product, setProduct] = useState(null);
  const [vectorX, setVectorX] = useState([2, 1]);
  const [transformedVector, setTransformedVector] = useState(null);
  const [inverseMappedVector, setInverseMappedVector] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Grid properties
  const gridSize = 300;
  const gridCenter = gridSize / 2;
  const scale = 25;
  
  useEffect(() => {
    try {
      // Calculate determinant
      const det = math.det(matrix);
      setDeterminant(det);
      
      // Check if invertible
      if (Math.abs(det) < 1e-10) {
        setErrorMessage("Matrix is not invertible (determinant is zero)");
        setInverse(null);
        setProduct(null);
        return;
      } else {
        setErrorMessage("");
      }
      
      // Calculate inverse
      const inv = math.inv(matrix);
      setInverse(inv);
      
      // Calculate A * A^(-1)
      const prod = math.multiply(matrix, inv);
      setProduct(prod);
      
      // Transform vector
      const transformed = math.multiply(matrix, vectorX);
      setTransformedVector(transformed);
      
      // Map transformed vector back with inverse
      const inverseMapped = math.multiply(inv, transformed);
      setInverseMappedVector(inverseMapped);
      
    } catch (error) {
      setErrorMessage("Error in calculation: " + error.message);
    }
  }, [matrix, vectorX]);
  
  // Render a grid point
  const renderPoint = (x, y, color, size = 3) => {
    const screenX = gridCenter + x * scale;
    const screenY = gridCenter - y * scale;
    return (
      <circle
        key={`point-${x}-${y}`}
        cx={screenX}
        cy={screenY}
        r={size}
        fill={color}
      />
    );
  };
  
  // Render a vector
  const renderVector = (x, y, color, thickness = 2) => {
    const startX = gridCenter;
    const startY = gridCenter;
    const endX = gridCenter + x * scale;
    const endY = gridCenter - y * scale;
    
    return (
      <>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth={thickness}
        />
        <polygon
          points={calculateArrowhead(startX, startY, endX, endY, 10)}
          fill={color}
        />
      </>
    );
  };
  
  // Render a parallelogram to show determinant as area
  const renderParallelogram = (vectorsArray, color, opacity = 0.4) => {
    // For 2x2 matrix, we need the column vectors
    const col1 = [matrix[0][0], matrix[1][0]];
    const col2 = [matrix[0][1], matrix[1][1]];
    
    // Calculate the four points of the parallelogram
    const origin = [gridCenter, gridCenter];
    const point1 = [gridCenter + col1[0] * scale, gridCenter - col1[1] * scale];
    const point2 = [gridCenter + col2[0] * scale, gridCenter - col2[1] * scale];
    const point3 = [point1[0] + col2[0] * scale, point1[1] - col2[1] * scale];
    
    // Create path string for the parallelogram
    const pathStr = `M${origin[0]},${origin[1]} L${point1[0]},${point1[1]} L${point3[0]},${point3[1]} L${point2[0]},${point2[1]} Z`;
    
    return (
      <>
        <path d={pathStr} fill={color} fillOpacity={opacity} stroke={color} strokeWidth="2" />
        <line x1={origin[0]} y1={origin[1]} x2={point1[0]} y2={point1[1]} stroke={color} strokeWidth="3" />
        <line x1={origin[0]} y1={origin[1]} x2={point2[0]} y2={point2[1]} stroke={color} strokeWidth="3" />
        <line x1={point1[0]} y1={point1[1]} x2={point3[0]} y2={point3[1]} stroke={color} strokeWidth="2" strokeDasharray="4 2" />
        <line x1={point2[0]} y1={point2[1]} x2={point3[0]} y2={point3[1]} stroke={color} strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Add labels for the basis vectors */}
        <text x={point1[0] + 5} y={point1[1]} fill={color} fontWeight="bold">v₁</text>
        <text x={point2[0] + 5} y={point2[1]} fill={color} fontWeight="bold">v₂</text>
      </>
    );
  };
  
  // Calculate arrowhead points
  const calculateArrowhead = (x1, y1, x2, y2, size) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const x3 = x2 - size * Math.cos(angle - Math.PI / 6);
    const y3 = y2 - size * Math.sin(angle - Math.PI / 6);
    const x4 = x2 - size * Math.cos(angle + Math.PI / 6);
    const y4 = y2 - size * Math.sin(angle + Math.PI / 6);
    return `${x2},${y2} ${x3},${y3} ${x4},${y4}`;
  };
  
  // Render grid
  const renderGrid = () => {
    const gridLines = [];
    
    // X and Y axes
    gridLines.push(
      <line key="x-axis" x1="0" y1={gridCenter} x2={gridSize} y2={gridCenter} stroke="#000" strokeWidth="1.5" />
    );
    gridLines.push(
      <line key="y-axis" x1={gridCenter} y1="0" x2={gridCenter} y2={gridSize} stroke="#000" strokeWidth="1.5" />
    );
    
    // Grid lines
    for (let i = -gridSize / (2 * scale); i <= gridSize / (2 * scale); i++) {
      if (i === 0) continue;
      
      const pos = gridCenter + i * scale;
      
      // Horizontal grid line
      gridLines.push(
        <line key={`h-${i}`} x1="0" y1={pos} x2={gridSize} y2={pos} stroke="#ccc" strokeWidth="0.5" />
      );
      
      // Vertical grid line
      gridLines.push(
        <line key={`v-${i}`} x1={pos} y1="0" x2={pos} y2={gridSize} stroke="#ccc" strokeWidth="0.5" />
      );
      
      // Axis labels
      if (i % 2 === 0 && i !== 0) {
        gridLines.push(
          <text key={`xlabel-${i}`} x={pos} y={gridCenter + 15} textAnchor="middle" fontSize="10">{i}</text>
        );
        gridLines.push(
          <text key={`ylabel-${i}`} x={gridCenter - 15} y={pos + 4} textAnchor="middle" fontSize="10">{-i}</text>
        );
      }
    }
    
    return gridLines;
  };
  
  // Matrix input handler
  const handleMatrixChange = (row, col, value) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = parseFloat(value) || 0;
    setMatrix(newMatrix);
  };
  
  // Add preset matrix examples
  const presetMatrices = [
    { name: "Identity", matrix: [[1, 0], [0, 1]], desc: "No change to area (det=1)" },
    { name: "Scaling", matrix: [[2, 0], [0, 2]], desc: "Area scaled by 4 (det=4)" },
    { name: "Shear", matrix: [[1, 1], [0, 1]], desc: "Area preserved (det=1)" },
    { name: "Rotation", matrix: [[0, -1], [1, 0]], desc: "Area preserved (det=1)" },
    { name: "Reflection", matrix: [[-1, 0], [0, 1]], desc: "Area preserved, orientation flipped (det=-1)" },
    { name: "Non-invertible", matrix: [[1, 2], [0.5, 1]], desc: "Zero area, not invertible (det=0)" },
  ];
  
  const applyPreset = (preset) => {
    setMatrix(preset.matrix);
  };
  
  // Vector input handler
  const handleVectorChange = (index, value) => {
    const newVector = [...vectorX];
    newVector[index] = parseFloat(value) || 0;
    setVectorX(newVector);
  };
  
  // Format number for display
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    return Math.abs(num) < 1e-10 ? "0" : num.toFixed(2);
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Invertible Matrices Visualization</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="space-y-4 md:w-1/3">
          <div className="md:w-2/3">
            <h2 className="text-lg font-semibold">Input Matrix A</h2>
            <div className="flex items-center">
              <div className="mr-2 font-bold">A =</div>
              <div className="border border-gray-300 p-2 rounded">
                {matrix.map((row, i) => (
                  <div key={`row-${i}`} className="flex">
                    {row.map((val, j) => (
                      <input
                        key={`cell-${i}-${j}`}
                        type="number"
                        value={val}
                        onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                        className="w-16 m-1 p-1 border border-gray-300 rounded text-center"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              (Matrix columns represent basis vectors v₁ and v₂)
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Input Vector x</h2>
            <div className="flex items-center">
              <div className="mr-2">x =</div>
              <div className="border border-gray-300 p-2 rounded">
                {vectorX.map((val, i) => (
                  <input
                    key={`vec-${i}`}
                    type="number"
                    value={val}
                    onChange={(e) => handleVectorChange(i, e.target.value)}
                    className="w-16 m-1 p-1 border border-gray-300 rounded text-center"
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Determinant & Invertibility</h2>
            <div className="p-2 border border-gray-300 rounded bg-gray-50">
              <div className="text-base mb-2">
                det(A) = <span className={determinant === 0 ? "text-red-600 font-bold" : (determinant < 0 ? "text-orange-600 font-bold" : "text-green-600 font-bold")}>
                  {determinant !== null ? formatNumber(determinant) : "N/A"}
                </span>
              </div>
              <div className="text-sm">
                {determinant === 0 ? (
                  <span className="text-red-600">Matrix is not invertible! The transformation collapses space (loses dimension).</span>
                ) : determinant < 0 ? (
                  <span className="text-orange-600">Matrix is invertible. Negative determinant means orientation is flipped.</span>
                ) : (
                  <span className="text-green-600">Matrix is invertible. Positive determinant preserves orientation.</span>
                )}
              </div>
              <div className="text-sm mt-1">
                {determinant !== 0 && `1/det(A) = ${formatNumber(1/determinant)} (scaling factor for inverse matrix)`}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mt-3">Preset Examples</h2>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {presetMatrices.map((preset, idx) => (
                <button 
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="p-1 text-sm border border-gray-300 rounded hover:bg-blue-100 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="text-xs mt-1 text-gray-600">
              Click a preset to see how different transformations affect determinant and invertibility
            </div>
          </div>
          
          {errorMessage && (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              {errorMessage}
            </div>
          )}
          
          {inverse && (
            <>
              <div>
                <h2 className="text-lg font-semibold">Inverse Matrix A<sup>-1</sup></h2>
                <div className="p-2 border border-gray-300 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    {inverse.map((row, i) => (
                      <div key={`inv-row-${i}`} className="flex justify-around">
                        {row.map((val, j) => (
                          <div key={`inv-${i}-${j}`} className="w-16 text-center">
                            {formatNumber(val)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold">A × A<sup>-1</sup> = I (Identity)</h2>
                <div className="p-2 border border-gray-300 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    {product.map((row, i) => (
                      <div key={`prod-row-${i}`} className="flex justify-around">
                        {row.map((val, j) => (
                          <div key={`prod-${i}-${j}`} className="w-16 text-center">
                            {formatNumber(val)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Determinant as Area & Transformation</h2>
          <div className="border border-gray-300 rounded p-2 bg-gray-50">
            <svg width={gridSize} height={gridSize} className="mx-auto">
              {renderGrid()}
              {renderGrid()}
              
              {/* Unit square parallelogram showing determinant as area */}
              <g>
                {/* Show the unit square before transformation */}
                <path 
                  d={`M${gridCenter},${gridCenter} L${gridCenter + scale},${gridCenter} L${gridCenter + scale},${gridCenter - scale} L${gridCenter},${gridCenter - scale} Z`} 
                  fill="#cccccc" 
                  fillOpacity="0.2" 
                  stroke="#999999" 
                  strokeWidth="1" 
                  strokeDasharray="5,5"
                />
                <text x={gridCenter + scale/2} y={gridCenter - scale/2} fill="#999999" fontSize="12">Unit Square</text>
              </g>
              
              {/* Transformed parallelogram showing determinant as area */}
              {renderParallelogram(matrix, "#9370DB")}
              
              {/* Add text to show the area = determinant */}
              <text 
                x={gridCenter + 50} 
                y={gridCenter - 70} 
                fill="#663399" 
                fontWeight="bold"
                fontSize="14"
              >
                Area = |det(A)| = {Math.abs(determinant).toFixed(2)}
                {determinant === 0 && " → Not Invertible!"}
              </text>
              
              {/* Original vector */}
              {renderVector(vectorX[0], vectorX[1], "#0066cc", 2)}
              {renderPoint(vectorX[0], vectorX[1], "#0066cc", 4)}
              
              {/* Transformed vector */}
              {transformedVector && (
                <>
                  {renderVector(transformedVector[0], transformedVector[1], "#cc3300", 2)}
                  {renderPoint(transformedVector[0], transformedVector[1], "#cc3300", 4)}
                </>
              )}
              
              {/* Inverse mapped vector */}
              {inverseMappedVector && (
                <>
                  <line
                    x1={gridCenter + transformedVector[0] * scale}
                    y1={gridCenter - transformedVector[1] * scale}
                    x2={gridCenter + inverseMappedVector[0] * scale}
                    y2={gridCenter - inverseMappedVector[1] * scale}
                    stroke="#009900"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                  />
                  {renderPoint(inverseMappedVector[0], inverseMappedVector[1], "#009900", 4)}
                </>
              )}
            </svg>
            
            <div className="mt-3 text-sm space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full mr-2"></div>
                <span><strong>Parallelogram</strong>: Area = |det(A)| = {Math.abs(determinant).toFixed(2)}</span>
              </div>
            
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
                <span><strong>Original vector</strong> x = [{vectorX.join(', ')}]</span>
              </div>
              
              {transformedVector && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                  <span><strong>Transformed vector</strong> Ax = [{transformedVector.map(v => formatNumber(v)).join(', ')}]</span>
                </div>
              )}
              
              {inverseMappedVector && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                  <span><strong>Inverse mapped</strong> A<sup>-1</sup>(Ax) = [{inverseMappedVector.map(v => formatNumber(v)).join(', ')}]</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold text-blue-800">Understanding Determinants & Invertibility</h3>
            
            <div className="mt-2 space-y-3">
              <div>
                <h4 className="font-medium">Why is the determinant so important?</h4>
                <p className="text-sm mt-1">
                  The determinant tells us whether a matrix transformation can be "undone." If |det(A)| = 0, 
                  the transformation compresses space into fewer dimensions, making it impossible to recover the original input.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Determinant, Area, and the Inverse:</h4>
                <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                  <li><strong>When det(A) ≠ 0:</strong> The transformation preserves dimensionality, making an inverse possible</li>
                  <li><strong>When det(A) = 0:</strong> The transformation collapses space (e.g., squashes a square into a line), making inversion impossible</li>
                  <li><strong>For the inverse:</strong> Each element in A<sup>-1</sup> is scaled by 1/det(A), so smaller determinants create larger inverses</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Visual Interpretation:</h4>
                <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                  <li>The <span className="text-purple-600 font-bold">purple parallelogram</span> shows how the unit square is transformed by matrix A</li>
                  <li>If this parallelogram has zero area (det=0), the matrix isn't invertible</li>
                  <li>The sign of det(A) tells us if orientation is preserved (positive) or flipped (negative)</li>
                  <li>Larger |det(A)| means the transformation expands area; smaller |det(A)| means it contracts area</li>
                </ul>
              </div>
            </div>
            
            <h3 className="font-semibold mt-4 text-blue-800">Key Formulas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="border border-gray-300 rounded p-2 bg-white">
                <h4 className="font-medium">2×2 Matrix Determinant:</h4>
                <div className="mt-1 text-center">
                  det([a b; c d]) = ad - bc
                </div>
              </div>
              
              <div className="border border-gray-300 rounded p-2 bg-white">
                <h4 className="font-medium">2×2 Matrix Inverse:</h4>
                <div className="mt-1 text-center">
                  [a b; c d]<sup>-1</sup> = (1/det) × [d -b; -c a]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvertibleMatricesDemo;
