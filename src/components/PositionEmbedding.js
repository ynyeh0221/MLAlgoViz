import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

// Define embedding types with consistent colors
const EMBEDDING_COLORS = {
  sinusoidal: "#3b82f6", // blue
  learned: "#ef4444",    // red
  rope: "#10b981"        // green
};

// Custom tooltip component
const SimpleTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  const point = payload[0].payload;
  return (
    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-xs">
      <p><strong>Position:</strong> {point.position}</p>
      {payload.map(entry => (
        <p key={entry.dataKey}>
          <strong>{entry.name || entry.dataKey}:</strong> {entry.value.toFixed(4)}
        </p>
      ))}
    </div>
  );
};

const PositionEmbeddingsComparison = () => {
  const [selectedEmbedding, setSelectedEmbedding] = useState('sinusoidal');
  const [sequenceLength, setSequenceLength] = useState(50);
  const [visualizationData, setVisualizationData] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(10);
  
  // Embedding type definitions
  const embeddings = [
    {
      id: 'sinusoidal',
      name: 'Sinusoidal (Original)',
      description: 'Fixed pattern using sine/cosine functions of different frequencies',
      pros: ['No parameters to learn', 'Can handle variable length sequences', 'Simple implementation'],
      cons: ['Fixed pattern not adapted to data', 'Limited expressiveness'],
      color: EMBEDDING_COLORS.sinusoidal,
      examples: 'Original Transformer, BERT'
    },
    {
      id: 'learned',
      name: 'Learned Embeddings',
      description: 'Position embeddings learned during training',
      pros: ['Adapts to data patterns', 'Simple to implement'],
      cons: ['Limited to trained sequence length', 'Cannot extrapolate to longer sequences'],
      color: EMBEDDING_COLORS.learned,
      examples: 'BERT, RoBERTa, early GPTs'
    },
    {
      id: 'rope',
      name: 'RoPE (Rotary)',
      description: 'Rotates vectors in the complex plane based on position',
      pros: ['Preserves relative positions', 'Good extrapolation', 'Better for long contexts'],
      cons: ['More complex implementation', 'Requires careful parameter selection'],
      color: EMBEDDING_COLORS.rope,
      examples: 'LLaMA, PaLM, Modern LLMs'
    }
  ];
  
  // Generate visualization data when parameters change
  useEffect(() => {
    const data = generateVisualizationData(selectedEmbedding, sequenceLength);
    setVisualizationData(data);
  }, [selectedEmbedding, sequenceLength]);
  
  // Generate data for visualization
  const generateVisualizationData = (embeddingType, seqLength) => {
    const data = [];
    
    for (let pos = 0; pos < seqLength; pos++) {
      const item = { position: pos };
      
      if (embeddingType === 'sinusoidal') {
        // Sinusoidal embedding (showing 3 dimensions)
        item.dimSlow = Math.sin(pos * 0.05);
        item.dimMedium = Math.sin(pos * 0.15);
        item.dimFast = Math.sin(pos * 0.45);
      } 
      else if (embeddingType === 'learned') {
        // Learned embedding (simulated with random but consistent patterns)
        item.dim1 = 0.8 * Math.sin(pos * 0.12) + 0.2 * Math.sin(pos * 0.5);
        item.dim2 = 0.7 * Math.sin(pos * 0.1 + 1) + 0.3 * Math.sin(pos * 0.3);
        item.dim3 = 0.6 * Math.sin(pos * 0.08 + 2) + 0.4 * Math.cos(pos * 0.25);
      }
      else if (embeddingType === 'rope') {
        // RoPE embedding (showing rotation patterns)
        const theta1 = pos * 0.1;
        const theta2 = pos * 0.2;
        item.cosine = Math.cos(theta1);
        item.sine = Math.sin(theta1);
        item.rotation = Math.cos(theta1) * Math.cos(theta2 - theta1);
      }
      
      data.push(item);
    }
    
    return data;
  };
  
  // Get dimension names and colors based on embedding type
  const getDimensionInfo = () => {
    if (selectedEmbedding === 'sinusoidal') {
      return {
        dimensions: ['dimSlow', 'dimMedium', 'dimFast'],
        labels: ['Slow-changing dimension', 'Medium-changing dimension', 'Fast-changing dimension'],
        colors: ['#4285F4', '#34A853', '#FBBC05']
      };
    } 
    else if (selectedEmbedding === 'learned') {
      return {
        dimensions: ['dim1', 'dim2', 'dim3'],
        labels: ['Learned dimension 1', 'Learned dimension 2', 'Learned dimension 3'],
        colors: ['#EA4335', '#34A853', '#4285F4']
      };
    }
    else if (selectedEmbedding === 'rope') {
      return {
        dimensions: ['cosine', 'sine', 'rotation'],
        labels: ['Cosine component', 'Sine component', 'Rotation effect'],
        colors: ['#34A853', '#FBBC05', '#4285F4']
      };
    }
    return { dimensions: [], labels: [], colors: [] };
  };
  
  // Find current embedding info
  const currentEmbedding = embeddings.find(emb => emb.id === selectedEmbedding);
  const { dimensions, labels, colors } = getDimensionInfo();
  
  // Find position info for the selected position
  const positionData = visualizationData.find(d => d.position === selectedPosition) || {};
  
  return (
    <div className="p-4 w-full max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4 text-center">Transformer Position Embeddings</h1>
      
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Sequence Length: {sequenceLength}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={sequenceLength}
            onChange={(e) => setSequenceLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            View Position {selectedPosition} Details:
          </label>
          <input
            type="range"
            min="0"
            max={sequenceLength - 1}
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Embedding selector */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {embeddings.map(emb => (
          <button
            key={emb.id}
            className={`px-3 py-1 rounded-full text-sm ${selectedEmbedding === emb.id 
              ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={() => setSelectedEmbedding(emb.id)}
          >
            {emb.name}
          </button>
        ))}
      </div>
      
      {/* Current embedding info */}
      <div className="w-full bg-white p-3 rounded-lg border border-gray-200 mb-4 shadow-sm">
        <h2 className="text-lg font-medium mb-1" style={{color: currentEmbedding?.color}}>
          {currentEmbedding?.name}
        </h2>
        <p className="text-sm mb-1">{currentEmbedding?.description}</p>
        <p className="text-xs text-gray-500">Used in: {currentEmbedding?.examples}</p>
      </div>
      
{/* Visualization */}
<div className="w-full bg-white p-3 rounded-lg border border-gray-200 mb-4 shadow-sm">
  <h2 className="text-lg font-medium mb-2">Visualization</h2>
  
  <div className="w-full" style={{ height: '300px' }}>
    {visualizationData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={visualizationData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="position" 
            type="number"
            domain={[0, sequenceLength - 1]}
            label={{ value: 'Position', position: 'bottom', offset: 5 }} 
          />
          <YAxis 
            domain={[-1.1, 1.1]}
            label={{ value: 'Embedding Value', angle: -90, position: 'insideLeft', offset: -5 }}
          />
          <Tooltip content={<SimpleTooltip />} />
          <Legend />
          
          {/* Selected position marker */}
          <ReferenceLine x={selectedPosition} stroke="#000" strokeWidth={1} strokeDasharray="3 3">
            <Label value="Selected Position" position="top" fontSize={10} />
          </ReferenceLine>
          
          {/* Training length marker for learned embeddings */}
          {selectedEmbedding === 'learned' && (
            <ReferenceLine x={30} stroke="#ef4444" strokeDasharray="3 3">
              <Label value="Training Length Limit" position="insideBottomRight" fontSize={10} fill="#ef4444" />
            </ReferenceLine>
          )}
          
          {/* Draw lines for each dimension */}
          {dimensions.map((dim, i) => (
            <Line 
              key={dim} 
              type="monotone" 
              dataKey={dim} 
              name={labels[i]} 
              stroke={colors[i]} 
              strokeWidth={2}
              dot={false} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    )}
  </div>
</div>
      
      {/* Position details */}
      <div className="w-full bg-white p-3 rounded-lg border border-gray-200 mb-4 shadow-sm">
        <h2 className="text-lg font-medium mb-2">Position {selectedPosition} Details</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dimensions.map((dim, i) => (
            <div key={dim} className="p-2 rounded-lg border" style={{borderColor: colors[i]}}>
              <h3 className="text-sm font-medium mb-1" style={{color: colors[i]}}>
                {labels[i]}
              </h3>
              <div className="text-3xl font-bold text-center py-2">
                {positionData[dim] ? positionData[dim].toFixed(4) : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pros/Cons */}
      <div className="w-full bg-white p-3 rounded-lg border border-gray-200 mb-4 shadow-sm">
        <h2 className="text-lg font-medium mb-2">Advantages & Limitations</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-700 mb-2">Advantages</h3>
            <ul className="list-disc pl-5 space-y-1">
              {currentEmbedding?.pros.map((pro, idx) => (
                <li key={idx} className="text-sm">{pro}</li>
              ))}
            </ul>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <h3 className="text-sm font-medium text-red-700 mb-2">Limitations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {currentEmbedding?.cons.map((con, idx) => (
                <li key={idx} className="text-sm">{con}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Key insights */}
      <div className="w-full bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-medium mb-2">Key Insights</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
          <div className="p-2 rounded bg-blue-50 border border-blue-100">
            <h4 className="font-medium mb-1 text-blue-600">Sinusoidal</h4>
            <p className="text-xs mb-1">💡 Different frequencies create unique "fingerprints"</p>
            <p className="text-xs mb-1">💡 Mathematically guaranteed uniqueness</p>
            <p className="text-xs mb-1">💡 Works for any sequence length</p>
          </div>
          
          <div className="p-2 rounded bg-red-50 border border-red-100">
            <h4 className="font-medium mb-1 text-red-600">Learned</h4>
            <p className="text-xs mb-1">💡 Data-adaptive patterns for better fit</p>
            <p className="text-xs mb-1">💡 Simple lookup implementation</p>
            <p className="text-xs mb-1">💡 Limited to training sequence length</p>
          </div>
          
          <div className="p-2 rounded bg-green-50 border border-green-100">
            <h4 className="font-medium mb-1 text-green-600">RoPE</h4>
            <p className="text-xs mb-1">💡 Preserves relative position relationships</p>
            <p className="text-xs mb-1">💡 Strong extrapolation to longer sequences</p>
            <p className="text-xs mb-1">💡 Used in modern large language models</p>
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Understanding Position Embeddings:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Position embeddings add <strong>order information</strong> to transformer models that would otherwise treat tokens as a set</li>
            <li>Each embedding creates a unique "fingerprint" for every position in a sequence</li>
            <li>The choice of embedding affects how well models handle <strong>longer sequences</strong> not seen during training</li>
            <li>Modern models like LLaMA use more sophisticated approaches (RoPE) for better performance on long contexts</li>
          </ul>
        </div>
      </div>
      
      {/* How embeddings are used in transformers */}
      <div className="w-full bg-white p-3 rounded-lg border border-gray-200 mt-4 shadow-sm">
        <h2 className="text-lg font-medium mb-2">How Position Embeddings Are Used in Transformers</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Embedding Process:</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Each token is converted to a token embedding</li>
              <li>Each position gets a position embedding</li>
              <li>The two embeddings are added together</li>
              <li>This combined embedding preserves both <strong>what</strong> the token is and <strong>where</strong> it appears</li>
              <li>The result is processed by attention layers</li>
            </ol>
          </div>
          
          <div className="flex-1 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Why Position Information Matters:</h3>
            <p className="text-sm mb-2">In language, order changes meaning:</p>
            <div className="p-2 bg-white rounded border border-gray-200 text-sm">
              <p>"The dog chased the cat" vs. "The cat chased the dog"</p>
              <p className="mt-1 text-xs text-gray-600">Same tokens, different order, completely different meaning</p>
            </div>
            <p className="text-sm mt-2">Position embeddings ensure transformers understand these differences despite processing all tokens in parallel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionEmbeddingsComparison;
