import React, { useState, useEffect } from 'react';

const NormalizationVisualization = () => {
  const [normType, setNormType] = useState('batch');
  const [selectedCell, setSelectedCell] = useState(null);
  const [inputMatrix, setInputMatrix] = useState([]);
  const [normalizedMatrix, setNormalizedMatrix] = useState([]);
  const [showLabels, setShowLabels] = useState(true);

  // Initialize with sample data
  useEffect(() => {
    // Create a matrix: 3 examples (rows) x 4 features (columns)
    // Using values that will show more diverse normalized results
    const sampleMatrix = [
      [5.0, 1.0, 7.0, 2.0],  // Example 1
      [9.0, 8.0, 2.0, 6.0],  // Example 2
      [3.0, 4.0, 7.0, 8.0]   // Example 3
    ];
    
    setInputMatrix(sampleMatrix);
  }, []);

  // Compute normalization when input or normalization type changes
  useEffect(() => {
    if (inputMatrix.length > 0) {
      computeNormalization();
    }
  }, [inputMatrix, normType]);

  // Calculate the normalized values based on normalization type
  const computeNormalization = () => {
    const normalized = [];
    const numExamples = inputMatrix.length;
    const numFeatures = inputMatrix[0].length;
    
    if (normType === 'batch') {
      // Batch Normalization: normalize each feature (column) independently
      for (let i = 0; i < numExamples; i++) {
        const normalizedRow = [];
        
        for (let j = 0; j < numFeatures; j++) {
          // Get all values for this feature across all examples
          const featureValues = inputMatrix.map(row => row[j]);
          
          // Calculate mean and standard deviation
          const mean = featureValues.reduce((sum, val) => sum + val, 0) / numExamples;
          const variance = featureValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numExamples;
          const std = Math.sqrt(variance + 1e-5); // Add epsilon for numerical stability
          
          // Normalize the value
          const normalizedValue = ((inputMatrix[i][j] - mean) / std).toFixed(2);
          normalizedRow.push(parseFloat(normalizedValue));
        }
        
        normalized.push(normalizedRow);
      }
    } else if (normType === 'layer') {
      // Layer Normalization: normalize each example (row) independently
      for (let i = 0; i < numExamples; i++) {
        const normalizedRow = [];
        const exampleValues = inputMatrix[i];
        
        // Calculate mean and standard deviation for this example
        const mean = exampleValues.reduce((sum, val) => sum + val, 0) / numFeatures;
        const variance = exampleValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numFeatures;
        const std = Math.sqrt(variance + 1e-5);
        
        // Normalize all features for this example
        for (let j = 0; j < numFeatures; j++) {
          const normalizedValue = ((inputMatrix[i][j] - mean) / std).toFixed(2);
          normalizedRow.push(parseFloat(normalizedValue));
        }
        
        normalized.push(normalizedRow);
      }
    } else if (normType === 'group') {
      // Group Normalization: divide features into groups and normalize within each group
      // For this simplified example, we'll use 2 groups with 2 features each
      const groupSize = 2;
      
      for (let i = 0; i < numExamples; i++) {
        const normalizedRow = [];
        
        // Process each group separately
        for (let g = 0; g < numFeatures / groupSize; g++) {
          const startFeature = g * groupSize;
          const endFeature = Math.min((g + 1) * groupSize, numFeatures);
          
          // Collect values for this group
          const groupValues = [];
          for (let j = startFeature; j < endFeature; j++) {
            groupValues.push(inputMatrix[i][j]);
          }
          
          // Calculate mean and standard deviation for this group
          const mean = groupValues.reduce((sum, val) => sum + val, 0) / groupValues.length;
          const variance = groupValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / groupValues.length;
          const std = Math.sqrt(variance + 1e-5);
          
          // Normalize all features in this group
          for (let j = startFeature; j < endFeature; j++) {
            const normalizedValue = ((inputMatrix[i][j] - mean) / std).toFixed(2);
            normalizedRow.push(parseFloat(normalizedValue));
          }
        }
        
        normalized.push(normalizedRow);
      }
    }
    
    setNormalizedMatrix(normalized);
  };

  // Get the cell color based on normalization type and selection
  const getCellColor = (row, col, isInput) => {
    if (!selectedCell) return '';
    
    const [selectedRow, selectedCol] = selectedCell;
    
    if (normType === 'batch') {
      // For batch norm, highlight the same column (feature) across all examples
      return col === selectedCol ? (isInput ? 'bg-blue-200' : 'bg-blue-100') : '';
    } else if (normType === 'layer') {
      // For layer norm, highlight the entire row (example)
      return row === selectedRow ? (isInput ? 'bg-green-200' : 'bg-green-100') : '';
    } else if (normType === 'group') {
      // For group norm, highlight the group within the same example
      const groupSize = 2;
      const selectedGroup = Math.floor(selectedCol / groupSize);
      const cellGroup = Math.floor(col / groupSize);
      
      return (row === selectedRow && cellGroup === selectedGroup) 
             ? (isInput ? 'bg-purple-200' : 'bg-purple-100') 
             : '';
    }
    
    return '';
  };
  
  // Get the group styling for group normalization
  const getGroupStyle = (col) => {
    if (normType !== 'group') return '';
    
    const groupSize = 2;
    const group = Math.floor(col / groupSize);
    
    // Use background colors instead of borders for better visibility
    return group === 0 ? 'bg-purple-50' : 'bg-indigo-50';
  };

  // Render a matrix using an HTML table structure
  const renderMatrix = (matrix, isInput) => {
    if (!matrix || matrix.length === 0) return null;
    
    return (
      <div className="matrix-container">
        <table className="border-collapse">
          {showLabels && (
            <thead>
              <tr>
                {/* Empty corner cell */}
                <th className="w-16"></th>
                {/* Feature column headers */}
                {matrix[0].map((_, colIndex) => (
                  <th key={colIndex} className="w-16 text-center text-sm font-medium p-2">
                    Feature {colIndex+1}
                    {normType === 'group' && (
                      <div className={`text-xs mt-1 ${colIndex < 2 ? 'text-purple-700' : 'text-indigo-700'}`}>
                        Group {Math.floor(colIndex/2) + 1}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* Row labels */}
                {showLabels && (
                  <td className="text-right text-sm font-medium p-2">
                    Sample {rowIndex+1}
                  </td>
                )}
                {/* Matrix cell values */}
                {row.map((value, colIndex) => {
                  const bgColor = getCellColor(rowIndex, colIndex, isInput);
                  const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
                  const borderColor = isSelected ? (isInput ? 'border-gray-800' : 'border-gray-600') : 'border-gray-300';
                  const groupStyle = getGroupStyle(colIndex);
                  
                  return (
                    <td 
                      key={colIndex} 
                      className={`w-16 h-16 border ${borderColor} text-center ${bgColor} ${groupStyle} cursor-pointer hover:bg-gray-100`}
                      onClick={() => setSelectedCell([rowIndex, colIndex])}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render the calculation details for the selected cell
  const renderCalculation = () => {
    if (!selectedCell) return (
      <div className="p-4 text-center bg-gray-100 rounded">
        <p>Select any cell to see calculation details</p>
      </div>
    );
    
    const [row, col] = selectedCell;
    const numExamples = inputMatrix.length;
    const numFeatures = inputMatrix[0].length;
    let calculation = null;
    
    if (normType === 'batch') {
      // Get all values for this feature across examples
      const featureValues = inputMatrix.map(r => r[col]);
      const mean = featureValues.reduce((sum, val) => sum + val, 0) / numExamples;
      const variance = featureValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numExamples;
      const std = Math.sqrt(variance + 1e-5);
      
      calculation = (
        <div>
          <p className="font-medium">Batch Normalization Calculation:</p>
          <p>For feature {col+1}, we compute statistics across all examples (rows):</p>
          <p>Values across batch: [{featureValues.join(', ')}]</p>
          <p>Mean (μ): {mean.toFixed(2)}</p>
          <p>Standard deviation (σ): {std.toFixed(2)}</p>
          <p className="mt-2 font-medium">Formula for example {row+1}, feature {col+1}:</p>
          <p>(x - μ) / σ = ({inputMatrix[row][col]} - {mean.toFixed(2)}) / {std.toFixed(2)} = {normalizedMatrix[row][col]}</p>
        </div>
      );
    } else if (normType === 'layer') {
      // Get all values for this example
      const exampleValues = inputMatrix[row];
      const mean = exampleValues.reduce((sum, val) => sum + val, 0) / numFeatures;
      const variance = exampleValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numFeatures;
      const std = Math.sqrt(variance + 1e-5);
      
      calculation = (
        <div>
          <p className="font-medium">Layer Normalization Calculation:</p>
          <p>For example {row+1}, we compute statistics across all features (columns):</p>
          <p>Values across features: [{exampleValues.join(', ')}]</p>
          <p>Mean (μ): {mean.toFixed(2)}</p>
          <p>Standard deviation (σ): {std.toFixed(2)}</p>
          <p className="mt-2 font-medium">Formula for example {row+1}, feature {col+1}:</p>
          <p>(x - μ) / σ = ({inputMatrix[row][col]} - {mean.toFixed(2)}) / {std.toFixed(2)} = {normalizedMatrix[row][col]}</p>
        </div>
      );
    } else if (normType === 'group') {
      // Group Normalization
      const groupSize = 2;
      const group = Math.floor(col / groupSize);
      const startFeature = group * groupSize;
      const endFeature = Math.min((group + 1) * groupSize, numFeatures);
      
      // Get values for this group
      const groupValues = [];
      for (let j = startFeature; j < endFeature; j++) {
        groupValues.push(inputMatrix[row][j]);
      }
      
      const mean = groupValues.reduce((sum, val) => sum + val, 0) / groupValues.length;
      const variance = groupValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / groupValues.length;
      const std = Math.sqrt(variance + 1e-5);
      
      calculation = (
        <div>
          <p className="font-medium">Group Normalization Calculation:</p>
          <p>For example {row+1}, group {group+1} (features {startFeature+1}-{endFeature}):</p>
          <p>Values in this group: [{groupValues.join(', ')}]</p>
          <p>Mean (μ): {mean.toFixed(2)}</p>
          <p>Standard deviation (σ): {std.toFixed(2)}</p>
          <p className="mt-2 font-medium">Formula for example {row+1}, feature {col+1}:</p>
          <p>(x - μ) / σ = ({inputMatrix[row][col]} - {mean.toFixed(2)}) / {std.toFixed(2)} = {normalizedMatrix[row][col]}</p>
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-gray-100 rounded">
        {calculation}
      </div>
    );
  };

  // Render diagram explaining the normalization method
  const renderDiagram = () => {
    if (normType === 'batch') {
      return (
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-medium mb-2">Batch Normalization</h3>
          <div className="flex justify-center mb-4">
            <svg width="320" height="180" viewBox="0 0 320 180">
              {/* Input matrix */}
              <rect x="10" y="10" width="120" height="160" fill="#e6e6e6" stroke="#666" />
              <text x="70" y="30" textAnchor="middle" fontSize="14">Input Matrix</text>
              
              {/* Features */}
              <rect x="40" y="40" width="20" height="120" fill="#90cdf4" stroke="#3182ce" />
              <rect x="70" y="40" width="20" height="120" fill="#e6e6e6" stroke="#666" />
              <rect x="100" y="40" width="20" height="120" fill="#e6e6e6" stroke="#666" />
              
              {/* Arrow */}
              <path d="M 140 90 L 180 90" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
              
              {/* Calculation */}
              <rect x="190" y="65" width="120" height="50" fill="#bee3f8" rx="5" ry="5" stroke="#3182ce" />
              <text x="250" y="85" textAnchor="middle" fontSize="12">Compute μ, σ</text>
              <text x="250" y="105" textAnchor="middle" fontSize="12">for each column</text>
              
              {/* Output matrix */}
              <rect x="190" y="10" width="120" height="160" fill="#e6e6e6" stroke="#666" />
              <text x="250" y="30" textAnchor="middle" fontSize="14">Normalized Matrix</text>
              
              {/* Normalized features */}
              <rect x="220" y="40" width="20" height="120" fill="#bfdbfe" stroke="#3182ce" />
              <rect x="250" y="40" width="20" height="120" fill="#e6e6e6" stroke="#666" />
              <rect x="280" y="40" width="20" height="120" fill="#e6e6e6" stroke="#666" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Key Idea:</p>
            <p>Normalizes each feature (column) independently across all examples (rows) in the batch.</p>
            <p className="mt-2">Formula: (x - μᵦ) / σᵦ, where μᵦ and σᵦ are calculated for each feature across the batch.</p>
            <p className="mt-2">Use Cases:</p>
            <ul className="list-disc pl-5">
              <li>CNNs with large batch sizes</li>
              <li>Deep networks where internal covariate shift is a problem</li>
              <li>Most common normalization technique in computer vision</li>
            </ul>
          </div>
        </div>
      );
    } else if (normType === 'layer') {
      return (
        <div className="p-4 bg-green-50 rounded">
          <h3 className="text-lg font-medium mb-2">Layer Normalization</h3>
          <div className="flex justify-center mb-4">
            <svg width="320" height="180" viewBox="0 0 320 180">
              {/* Input matrix */}
              <rect x="10" y="10" width="120" height="160" fill="#e6e6e6" stroke="#666" />
              <text x="70" y="30" textAnchor="middle" fontSize="14">Input Matrix</text>
              
              {/* Examples/rows */}
              <rect x="40" y="50" width="80" height="20" fill="#9ae6b4" stroke="#38a169" />
              <rect x="40" y="80" width="80" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="40" y="110" width="80" height="20" fill="#e6e6e6" stroke="#666" />
              
              {/* Arrow */}
              <path d="M 140 90 L 180 90" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
              
              {/* Calculation */}
              <rect x="190" y="65" width="120" height="50" fill="#c6f6d5" rx="5" ry="5" stroke="#38a169" />
              <text x="250" y="85" textAnchor="middle" fontSize="12">Compute μ, σ</text>
              <text x="250" y="105" textAnchor="middle" fontSize="12">for each row</text>
              
              {/* Output matrix */}
              <rect x="190" y="10" width="120" height="160" fill="#e6e6e6" stroke="#666" />
              <text x="250" y="30" textAnchor="middle" fontSize="14">Normalized Matrix</text>
              
              {/* Normalized examples */}
              <rect x="220" y="50" width="80" height="20" fill="#d1fae5" stroke="#38a169" />
              <rect x="220" y="80" width="80" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="220" y="110" width="80" height="20" fill="#e6e6e6" stroke="#666" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Key Idea:</p>
            <p>Normalizes all features (columns) together for each example (row) independently.</p>
            <p className="mt-2">Formula: (x - μₗ) / σₗ, where μₗ and σₗ are calculated for all features in each example.</p>
            <p className="mt-2">Use Cases:</p>
            <ul className="list-disc pl-5">
              <li>RNNs and Transformers</li>
              <li>NLP tasks</li>
              <li>When batch size is small or varies</li>
              <li>Sequence modeling where sequence length varies</li>
            </ul>
          </div>
        </div>
      );
    } else if (normType === 'group') {
      return (
        <div className="p-4 bg-purple-50 rounded">
          <h3 className="text-lg font-medium mb-2">Group Normalization</h3>
          <div className="flex justify-center mb-4">
            <svg width="320" height="180" viewBox="0 0 320 180">
              {/* Input matrix */}
              <rect x="10" y="10" width="120" height="160" fill="#e6e6e6" stroke="#666" />
              <text x="70" y="30" textAnchor="middle" fontSize="14">Input Matrix</text>
              
              {/* Examples with groups */}
              <rect x="40" y="50" width="40" height="20" fill="#d8b4fe" stroke="#7e22ce" />
              <rect x="80" y="50" width="40" height="20" fill="#c4b5fd" stroke="#6d28d9" />
              <rect x="40" y="80" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="80" y="80" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="40" y="110" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="80" y="110" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              
              {/* Arrow */}
              <path d="M 140 90 L 180 90" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
              
              {/* Calculation */}
              <rect x="190" y="50" width="120" height="80" fill="#f3e8ff" rx="5" ry="5" stroke="#7e22ce" />
              <text x="250" y="70" textAnchor="middle" fontSize="12">Compute μ₁, σ₁</text>
              <text x="250" y="85" textAnchor="middle" fontSize="12">for group 1</text>
              <text x="250" y="105" textAnchor="middle" fontSize="12">Compute μ₂, σ₂</text>
              <text x="250" y="120" textAnchor="middle" fontSize="12">for group 2</text>
              
              {/* Output matrix */}
              <rect x="190" y="10" width="120" height="160" fill="#e6e6e6" stroke="#666" />
              <text x="250" y="30" textAnchor="middle" fontSize="14">Normalized Matrix</text>
              
              {/* Normalized groups */}
              <rect x="220" y="50" width="40" height="20" fill="#f3e8ff" stroke="#7e22ce" />
              <text x="240" y="63" textAnchor="middle" fontSize="10" fill="#7e22ce">G1</text>
              <rect x="260" y="50" width="40" height="20" fill="#e0e7ff" stroke="#6d28d9" />
              <text x="280" y="63" textAnchor="middle" fontSize="10" fill="#6d28d9">G2</text>
              <rect x="220" y="80" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="260" y="80" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="220" y="110" width="40" height="20" fill="#e6e6e6" stroke="#666" />
              <rect x="260" y="110" width="40" height="20" fill="#e6e6e6" stroke="#666" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Key Idea:</p>
            <p>Divides features into groups and normalizes each group independently for each example.</p>
            <p className="mt-2">Formula: (x - μg) / σg, where μg and σg are calculated within each feature group for each example.</p>
            <p className="mt-2">Use Cases:</p>
            <ul className="list-disc pl-5">
              <li>When batch size is small (e.g., high-resolution images)</li>
              <li>As a middle ground between batch and layer normalization</li>
              <li>Computer vision tasks with limited GPU memory</li>
              <li>When feature groups have semantic meaning</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Normalization Techniques: Simplified Matrix Visualization</h1>
      
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${normType === 'batch' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setNormType('batch')}
          >
            Batch Normalization
          </button>
          <button
            className={`px-4 py-2 rounded ${normType === 'layer' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setNormType('layer')}
          >
            Layer Normalization
          </button>
          <button
            className={`px-4 py-2 rounded ${normType === 'group' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setNormType('group')}
          >
            Group Normalization
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-medium mb-2">Matrix Format Explanation</h3>
          <p className="mb-2">
            <span className="font-medium">Samples:</span> Each <span className="font-medium">row</span> represents a training/testing data point (sample). In neural networks, this would be one input example in a batch.
          </p>
          <p className="mb-2">
            <span className="font-medium">Features:</span> Each <span className="font-medium">column</span> represents a dimension or attribute of the data. In neural networks, these are activation values at a particular layer.
          </p>
          <p className="mb-2">
            <span className="font-medium">Group Normalization:</span> Features are divided into groups (indicated by different colors and G1/G2 labels). Each group is normalized independently within each sample.
          </p>
          <div className="mt-3 flex items-center mb-2">
            <span className="inline-block w-4 h-4 bg-purple-50 border border-gray-300 mr-2"></span>
            <span className="mr-4">Group 1</span>
            <span className="inline-block w-4 h-4 bg-indigo-50 border border-gray-300 mr-2"></span>
            <span>Group 2</span>
          </div>
          <p>
            Click any cell to see which values are used in its normalization calculation.
          </p>
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? "Hide Labels" : "Show Labels"}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h2 className="text-lg font-medium mb-3">Input Matrix</h2>
          {inputMatrix.length > 0 && renderMatrix(inputMatrix, true)}
        </div>
        <div>
          <h2 className="text-lg font-medium mb-3">Normalized Matrix</h2>
          {normalizedMatrix.length > 0 && renderMatrix(normalizedMatrix, false)}
        </div>
      </div>
      
      <div className="mb-6">
        {renderCalculation()}
      </div>
      
      {renderDiagram()}
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-medium mb-2">Summary of Normalization Methods</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-medium mb-1">Batch Normalization</h4>
            <div className="flex justify-center my-2">
              <div className="bg-blue-200 p-2 rounded text-center">
                <strong>Normalizes each feature</strong><br/>across all samples
              </div>
            </div>
            <p className="text-sm">Works well with large batch sizes, but performance degrades with smaller batches.</p>
            <div className="mt-2 text-sm">
              <strong>Best for:</strong> CNNs, large batches (32+)
            </div>
      </div>
      <div className="p-3 bg-green-50 rounded">
        <h4 className="font-medium mb-1">Layer Normalization</h4>
        <div className="flex justify-center my-2">
          <div className="bg-green-200 p-2 rounded text-center">
            <strong>Normalizes all features</strong><br/>within each sample
          </div>
        </div>
        <p className="text-sm">Independent of batch size, works well for sequence models like RNNs and Transformers.</p>
        <div className="mt-2 text-sm">
          <strong>Best for:</strong> RNNs, Transformers, NLP
        </div>
      </div>
      <div className="p-3 bg-purple-50 rounded">
        <h4 className="font-medium mb-1">Group Normalization</h4>
        <div className="flex justify-center my-2">
          <div className="bg-purple-200 p-2 rounded text-center">
            <strong>Normalizes feature groups</strong><br/>within each sample
          </div>
        </div>
        <p className="text-sm">A middle ground approach. Features with similar semantics can be grouped together.</p>
        <div className="mt-2 text-sm">
          <strong>Best for:</strong> Small batches, high-res images
        </div>
      </div>
    </div>
  </div>
</div>
);
};
export default NormalizationVisualization;
