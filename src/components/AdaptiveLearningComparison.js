import React from 'react';

// Ultra-minimal, CSS-free visualization
const MinimalOptimizationViz = () => {
  // Algorithm data and colors
  const algorithms = [
    {
      id: 'sgd',
      name: 'Standard SGD',
      color: '#FF5733',
      pathSvg: "M50,150 Q75,120 100,140 Q125,160 150,130 Q175,100 200,120 Q225,140 250,110 Q275,80 300,100 Q325,120 350,90",
      lossSvg: "M50,150 L84,135 L118,120 L152,105 L186,90 L220,75 L254,60 L288,45 L350,30",
      pros: ['Simple to implement', 'Low memory usage'],
      cons: ['Zigzags in ravines', 'Sensitive to feature scaling', 'Easily trapped in local minima'],
      convergence: '135+'
    },
    {
      id: 'momentum',
      name: 'SGD + Momentum',
      color: '#33C4FF',
      pathSvg: "M50,150 C100,130 150,70 200,60 S250,70 300,90 L350,90",
      lossSvg: "M50,150 L84,130 L118,110 L152,90 L186,70 L220,60 L254,50 L288,45 L350,40",
      pros: ['Accelerates in consistent directions', 'Reduces oscillations'],
      cons: ['Can overshoot minima', 'Still affected by feature scaling'],
      convergence: '~100'
    },
    {
      id: 'rmsprop',
      name: 'RMSProp',
      color: '#A033FF',
      pathSvg: "M50,150 C100,120 150,80 200,50 S250,40 300,40 L350,40",
      lossSvg: "M50,150 L84,120 L118,90 L152,70 L186,55 L220,45 L254,40 L288,37 L350,35",
      pros: ['Adapts learning rate per parameter', 'Handles different scales well'],
      cons: ['No momentum for acceleration', 'Can make small updates too small'],
      convergence: '~60'
    },
    {
      id: 'adam',
      name: 'Adam',
      color: '#33FF57',
      pathSvg: "M50,150 C100,100 125,60 150,40 S175,30 300,30 L350,30",
      lossSvg: "M50,150 L84,100 L118,60 L152,40 L186,30 L220,25 L254,22 L288,21 L350,20",
      pros: ['Combines momentum & adaptation', 'Best overall performance'],
      cons: ['More complex to implement', 'Higher memory requirements'],
      convergence: '~40'
    }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Adaptive Learning Rate Comparison
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {algorithms.map(alg => (
          <div key={alg.id} style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '15px',
              color: alg.color 
            }}>
              {alg.name}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* Optimization Path */}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>
                  Optimization Path
                </div>
                <svg 
                  viewBox="0 0 400 200" 
                  width="100%" 
                  height="140"
                  style={{ backgroundColor: 'white', border: '1px solid #eee' }}
                >
                  {/* Background grid */}
                  <g stroke="#eee" strokeWidth="1">
                    <line x1="50" y1="20" x2="50" y2="150" />
                    <line x1="50" y1="150" x2="350" y2="150" />
                    <line x1="125" y1="20" x2="125" y2="150" />
                    <line x1="200" y1="20" x2="200" y2="150" />
                    <line x1="275" y1="20" x2="275" y2="150" />
                    <line x1="350" y1="20" x2="350" y2="150" />
                    <line x1="50" y1="20" x2="350" y2="20" />
                    <line x1="50" y1="63" x2="350" y2="63" />
                    <line x1="50" y1="107" x2="350" y2="107" />
                  </g>
                  
                  {/* Axis labels */}
                  <text x="200" y="175" textAnchor="middle" fontSize="10">Position</text>
                  <text x="20" y="85" textAnchor="middle" fontSize="10" transform="rotate(-90, 20, 85)">Height</text>
                  
                  {/* Path visualization */}
                  <path 
                    d={alg.pathSvg} 
                    fill="none" 
                    stroke={alg.color} 
                    strokeWidth="3" 
                  />
                  
                  {/* Target point */}
                  <circle cx="350" cy="30" r="4" fill="#555" />
                </svg>
              </div>
              
              {/* Loss Curve */}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', textAlign: 'center' }}>
                  Loss Over Iterations
                </div>
                <svg 
                  viewBox="0 0 400 200" 
                  width="100%" 
                  height="140"
                  style={{ backgroundColor: 'white', border: '1px solid #eee' }}
                >
                  {/* Background grid */}
                  <g stroke="#eee" strokeWidth="1">
                    <line x1="50" y1="20" x2="50" y2="150" />
                    <line x1="50" y1="150" x2="350" y2="150" />
                    <line x1="110" y1="20" x2="110" y2="150" />
                    <line x1="170" y1="20" x2="170" y2="150" />
                    <line x1="230" y1="20" x2="230" y2="150" />
                    <line x1="290" y1="20" x2="290" y2="150" />
                    <line x1="350" y1="20" x2="350" y2="150" />
                    <line x1="50" y1="20" x2="350" y2="20" />
                    <line x1="50" y1="63" x2="350" y2="63" />
                    <line x1="50" y1="107" x2="350" y2="107" />
                  </g>
                  
                  {/* Axis labels */}
                  <text x="200" y="175" textAnchor="middle" fontSize="10">Iterations (0-140)</text>
                  <text x="20" y="85" textAnchor="middle" fontSize="10" transform="rotate(-90, 20, 85)">Loss</text>
                  
                  {/* Data line */}
                  <path 
                    d={alg.lossSvg} 
                    fill="none" 
                    stroke={alg.color} 
                    strokeWidth="3" 
                  />
                  
                  {/* Data points */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                    const x = 50 + i * 37.5;
                    const y = alg.lossSvg.split(' ')[i*2+1]?.split(',')[1] || 30;
                    return <circle key={i} cx={x} cy={y} r="3" fill={alg.color} />;
                  })}
                </svg>
              </div>
            </div>
            
            {/* Pros and Cons */}
            <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#22c55e', marginBottom: '5px' }}>Pros:</div>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px' }}>
                  {alg.pros.map((pro, i) => (
                    <li key={i}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>Cons:</div>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px' }}>
                  {alg.cons.map((con, i) => (
                    <li key={i}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Performance Summary */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          Key Performance Comparisons
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '10px'
        }}>
          {algorithms.map(alg => (
            <div key={alg.id} style={{ 
              backgroundColor: 'white', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', color: alg.color }}>
                {alg.name}
              </div>
              <div style={{ fontSize: '14px' }}>
                Iterations to converge: <span style={{ fontWeight: 'bold' }}>{alg.convergence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinimalOptimizationViz;
