import React, { useState } from 'react';

const RegularizationViz = () => {
  // Example data for visualizations
  const weights = [
    {name: 'Feature1', noReg: 8, l1: 0, l2: 2},
    {name: 'Feature2', noReg: -6, l1: 0, l2: -1.5},
    {name: 'Feature3', noReg: 5, l1: 2, l2: 1.2},
    {name: 'Feature4', noReg: 7, l1: 3, l2: 1.8},
    {name: 'Feature5', noReg: -4, l1: -2, l2: -1},
    {name: 'Feature6', noReg: 0.5, l1: 0, l2: 0.1},
  ];
  
  // Simulated network activations
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
  
  // Styles for components - using inline styles like the example
  const styles = {
    container: {
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      maxWidth: '100%',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1.5rem'
    },
    subheading: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1rem'
    },
    infoBox: {
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: '#fff9e5',
      border: '1px solid #ffe58f',
      borderRadius: '0.25rem'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1.5rem',
      marginBottom: '1.5rem',
      '@media (min-width: 1024px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    cardHeader: {
      padding: '1rem',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb'
    },
    cardContent: {
      padding: '1rem'
    },
    visualizationContainer: {
      position: 'relative',
      height: '14rem',
      width: '100%',
      border: '1px solid #e5e7eb',
      marginTop: '2rem',
      marginBottom: '2rem',
      overflow: 'visible'
    },
    xAxisLabel: {
      position: 'absolute',
      bottom: '-30px',
      width: '100%',
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#4b5563'
    },
    yAxisLabel: {
      position: 'absolute',
      left: '-25px',
      top: '50%',
      transform: 'translateY(-50%) rotate(-90deg)',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#4b5563'
    },
    yAxisTicks: {
      position: 'absolute',
      left: '-10px',
      top: '0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    barsContainer: {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around'
    },
    barGroup: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '40px'
    },
    bar: (color, height, isPositive) => ({
      width: '16px',
      height: `${height}px`,
      backgroundColor: color,
      marginBottom: '4px',
      marginTop: isPositive ? '0' : 'auto',
      marginBottom: isPositive ? 'auto' : '0'
    }),
    barLabel: {
      marginTop: '8px',
      fontSize: '0.75rem',
      fontWeight: '500',
      textAlign: 'center'
    },
    legend: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.75rem'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '1rem'
    },
    legendColor: (color) => ({
      width: '16px',
      height: '16px',
      backgroundColor: color,
      borderRadius: '9999px',
      marginRight: '8px'
    }),
    legendText: {
      fontSize: '0.875rem'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginTop: '2rem'
    },
    infoCard: (color) => ({
      padding: '0.75rem',
      backgroundColor: color,
      borderRadius: '0.25rem'
    }),
    infoTitle: (color) => ({
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: color,
      marginBottom: '0.25rem'
    }),
    infoText: {
      fontSize: '0.875rem',
      marginBottom: '0.25rem'
    },
    infoBold: {
      fontSize: '0.75rem',
      fontWeight: 'bold',
      marginTop: '0.25rem' 
    },
    infoItalic: {
      fontSize: '0.75rem',
      fontStyle: 'italic',
      marginTop: '0.25rem'
    },
    activationGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    },
    activationBox: {
      textAlign: 'center'
    },
    activationTitle: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    matrixContainer: {
      display: 'flex',
      marginBottom: '0.5rem',
      justifyContent: 'center',
      alignItems: 'center'
    },
    matrixLabel: {
      transform: 'rotate(90deg)',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      marginRight: '0.25rem',
      flexShrink: '0',
      position: 'relative',
      width: '20px',
      marginLeft: '-10px'
    },
    matrixLabelText: {
      position: 'absolute',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      top: '40px'
    },
    matrixContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    matrixHeader: {
      fontSize: '0.75rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem',
      textAlign: 'center'
    },
    matrixGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '2px',
      padding: '0.25rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.25rem',
      margin: '0 auto'
    },
    matrixCell: (bgColor, textColor) => ({
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      borderRadius: '0.25rem',
      backgroundColor: bgColor,
      color: textColor
    }),
    matrixDesc: {
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    },
    arrowContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '0.25rem'
    },
    architectureBox: {
      position: 'relative',
      padding: '1rem',
      borderRadius: '0.25rem',
      marginBottom: '1.5rem'
    },
    architectureTitle: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1.5rem'
    },
    architectureDiagram: {
      position: 'relative',
      margin: '0 auto',
      width: '95%',
      height: '180px'
    },
    diagramBg: {
      position: 'absolute',
      inset: '0',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    layersContainer: {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    },
    layer: (bgColor, height) => ({
      width: '56px',
      height: height,
      backgroundColor: bgColor,
      borderRadius: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem'
    }),
    layerStack: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    weightDecayMarker: {
      position: 'absolute',
      bottom: '-25px',
      left: '0',
      right: '0',
      textAlign: 'center'
    },
    weightDecayBox: {
      display: 'inline-block',
      backgroundColor: '#fee2e2',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: '1px solid #fca5a5',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    },
    techSpecs: {
      marginTop: '2.5rem',
      fontSize: '0.75rem',
      padding: '0.5rem',
      borderRadius: '0.25rem'
    },
    pointsContainer: {
      padding: '1rem',
      backgroundColor: '#fffbeb',
      borderRadius: '0.25rem',
      border: '1px solid #fde68a',
      marginTop: '1rem'
    },
    pointsTitle: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '0.75rem',
      fontSize: '1rem'
    },
    reasonsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem',
      marginTop: '0.5rem',
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    reasonItem: {
      display: 'flex',
      alignItems: 'start'
    },
    reasonNumber: {
      flexShrink: '0',
      width: '32px',
      height: '32px',
      backgroundColor: (color) => color,
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.5rem',
      fontWeight: 'bold'
    },
    reasonText: {
      fontSize: '0.875rem'
    },
    codeContainer: {
      padding: '1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.25rem',
      border: '1px solid #d1d5db',
      marginTop: '1rem'
    },
    codeTitle: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '0.75rem'
    },
    codeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem',
      marginTop: '0.5rem',
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    codeBlock: {
      backgroundColor: '#111827',
      borderRadius: '0.25rem',
      padding: '0.75rem',
      color: '#34d399',
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      overflow: 'auto',
      maxHeight: '200px'
    },
    codeAnalysis: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    analysisTitle: {
      fontWeight: 'bold',
      fontSize: '0.875rem',
      marginBottom: '0.25rem'
    },
    analysisList: {
      listStyleType: 'disc',
      paddingLeft: '1.25rem',
      fontSize: '0.875rem'
    },
    analysisItem: {
      marginBottom: '0.25rem'
    },
    codeHighlight: (bgColor) => ({
      fontFamily: 'monospace',
      backgroundColor: bgColor,
      padding: '0 0.25rem'
    }),
    analysisBox: {
      padding: '0.5rem',
      backgroundColor: 'white',
      borderRadius: '0.25rem',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
      marginTop: '0.5rem'
    },
    analysisText: {
      fontSize: '0.75rem'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Regularization and Normalization: Core Comparison</h2>
      
      <div style={styles.infoBox}>
        <h3 style={styles.subheading}>Understanding the Visualizations</h3>
        <div style={styles.gridContainer}>
          <div style={{ padding: '0.5rem' }}>
            <p><span style={{ fontWeight: 'bold' }}>Weight Regularization Chart</span>: Each set of bars shows the weight value for a specific feature, demonstrating how different regularization methods affect weight magnitudes.</p>
          </div>
          <div style={{ padding: '0.5rem' }}>
            <p><span style={{ fontWeight: 'bold' }}>Activation Normalization Chart</span>: The three matrices represent different normalization methods, where each row is a sample and each column is a neuron, with colors and values showing activation strength.</p>
          </div>
        </div>
      </div>
      
      <div style={styles.gridContainer}>
        {/* L1 vs L2 Regularization Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h4 style={styles.subheading}>Weight Regularization: L1 vs L2</h4>
          </div>
          
          <div style={styles.cardContent}>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div style={styles.legendColor('#a855f7')}></div>
                <span style={styles.legendText}>No Regularization</span>
              </div>
              <div style={styles.legendItem}>
                <div style={styles.legendColor('#22c55e')}></div>
                <span style={styles.legendText}>L1 Regularization</span>
              </div>
              <div style={styles.legendItem}>
                <div style={styles.legendColor('#3b82f6')}></div>
                <span style={styles.legendText}>L2 Regularization</span>
              </div>
            </div>
            
            {/* Weight visualization */}
            <div style={styles.visualizationContainer}>
              {/* Y-axis label */}
              <div style={styles.yAxisLabel}>
                Weight Value
              </div>
              
              {/* Y-axis */}
              <div style={styles.yAxisTicks}>
                <span>8</span>
                <span>4</span>
                <span>0</span>
                <span>-4</span>
                <span>-8</span>
              </div>
              
              {/* X-axis label */}
              <div style={styles.xAxisLabel}>
                Model Features/Neural Network Weights
              </div>
              
              {/* Weight bars */}
              <div style={styles.barsContainer}>
                {weights.map((item, index) => (
                  <div key={index} style={styles.barGroup}>
                    {/* No regularization */}
                    <div 
                      style={styles.bar('#a855f7', Math.abs(item.noReg) * 5, item.noReg >= 0)}
                    ></div>
                    
                    {/* L1 regularization */}
                    {item.l1 !== 0 && (
                      <div 
                        style={styles.bar('#22c55e', Math.abs(item.l1) * 5, item.l1 >= 0)}
                      ></div>
                    )}
                    
                    {/* L2 regularization */}
                    <div 
                      style={styles.bar('#3b82f6', Math.abs(item.l2) * 5, item.l2 >= 0)}
                    ></div>
                    
                    <span style={styles.barLabel}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={styles.infoGrid}>
              <div style={styles.infoCard('#f0fdf4')}>
                <h5 style={styles.infoTitle('#15803d')}>L1 Regularization</h5>
                <p style={styles.infoText}>Adds |w| to loss function</p>
                <p style={styles.infoBold}>Effect: Makes many weights zero</p>
                <div style={styles.infoItalic}>Like minimalism, completely removing unimportant items</div>
              </div>
              <div style={styles.infoCard('#eff6ff')}>
                <h5 style={styles.infoTitle('#1e40af')}>L2 Regularization</h5>
                <p style={styles.infoText}>Adds w² to loss function</p>
                <p style={styles.infoBold}>Effect: All weights become smaller</p>
                <div style={styles.infoItalic}>Like downsizing all furniture while keeping balance</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Batch vs Layer Normalization Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h4 style={styles.subheading}>Activation Normalization: Batch vs Layer</h4>
          </div>
          
          <div style={styles.cardContent}>
            <div style={styles.activationGrid}>
              {/* Original activations */}
              <div style={styles.activationBox}>
                <h5 style={styles.activationTitle}>Original Activations</h5>
                <div style={styles.matrixContainer}>
                  <div style={styles.matrixLabel}>
                    <span style={styles.matrixLabelText}>Samples</span>
                  </div>
                  <div style={styles.matrixContent}>
                    <div style={styles.matrixHeader}>Neurons</div>
                    <div style={styles.matrixGrid}>
                      {[0,1,2,3].map(row => (
                        <React.Fragment key={`orig-row-${row}`}>
                          {[0,1,2,3,4].map(col => (
                            <div 
                              key={`orig-${row}-${col}`}
                              style={styles.matrixCell(
                                getColor(activationMatrix[row][col]),
                                Math.abs(activationMatrix[row][col]) > 1.5 ? 'white' : 'black'
                              )}
                            >
                              {activationMatrix[row][col].toFixed(1)}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={styles.matrixDesc}>Large range differences between neurons</div>
              </div>
              
              {/* Batch Norm */}
              <div style={styles.activationBox}>
                <h5 style={styles.activationTitle}>Batch Norm</h5>
                <div style={styles.matrixContainer}>
                  <div style={styles.matrixContent}>
                    <div style={styles.matrixHeader}>Neurons</div>
                    <div style={styles.matrixGrid}>
                      {[0,1,2,3].map(row => (
                        <React.Fragment key={`bn-row-${row}`}>
                          {[0,1,2,3,4].map(col => (
                            <div 
                              key={`bn-${row}-${col}`}
                              style={styles.matrixCell(
                                getColor(activationMatrix[row+4][col]),
                                Math.abs(activationMatrix[row+4][col]) > 1.5 ? 'white' : 'black'
                              )}
                            >
                              {activationMatrix[row+4][col].toFixed(1)}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={styles.arrowContainer}>
                  <svg width="120" height="20">
                    <path d="M5,10 L115,10" stroke="#4C1D95" strokeWidth="2" />
                    <path d="M110,5 L115,10 L110,15" fill="none" stroke="#4C1D95" strokeWidth="2" />
                  </svg>
                </div>
                <div style={{ ...styles.matrixDesc, fontWeight: 'bold', color: '#4C1D95' }}>
                  Normalize along columns (each neuron)
                </div>
              </div>
              
              {/* Layer Norm */}
              <div style={styles.activationBox}>
                <h5 style={styles.activationTitle}>Layer Norm</h5>
                <div style={styles.matrixContainer}>
                  <div style={styles.matrixContent}>
                    <div style={styles.matrixHeader}>Neurons</div>
                    <div style={styles.matrixGrid}>
                      {[0,1,2,3].map(row => (
                        <React.Fragment key={`ln-row-${row}`}>
                          {[0,1,2,3,4].map(col => (
                            <div 
                              key={`ln-${row}-${col}`}
                              style={styles.matrixCell(
                                getColor(activationMatrix[row+8][col]),
                                Math.abs(activationMatrix[row+8][col]) > 1.5 ? 'white' : 'black'
                              )}
                            >
                              {activationMatrix[row+8][col].toFixed(1)}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={styles.arrowContainer}>
                  <svg width="120" height="20">
                    <path d="M5,10 L115,10" stroke="#9D174D" strokeWidth="2" />
                    <path d="M110,5 L115,10 L110,15" fill="none" stroke="#9D174D" strokeWidth="2" />
                  </svg>
                </div>
                <div style={{ ...styles.matrixDesc, fontWeight: 'bold', color: '#9D174D' }}>
                  Normalize along rows (each sample)
                </div>
              </div>
            </div>
            
            {/* Explanation */}
            <div style={styles.infoGrid}>
              <div style={styles.infoCard('#f5f3ff')}>
                <h5 style={styles.infoTitle('#4C1D95')}>Batch Normalization</h5>
                <p style={styles.infoBold}>Formula: (x-μ_batch)/σ_batch</p>
                <div style={styles.infoText}>
                  <span style={{ fontWeight: 'bold' }}>Direction:</span> Normalize each feature across samples
                </div>
                <div style={styles.infoItalic}>Like ensuring each exam question has similar average scores</div>
              </div>
              <div style={styles.infoCard('#fdf2f8')}>
                <h5 style={styles.infoTitle('#9D174D')}>Layer Normalization</h5>
                <p style={styles.infoBold}>Formula: (x-μ_layer)/σ_layer</p> 
                <div style={styles.infoText}>
                  <span style={{ fontWeight: 'bold' }}>Direction:</span> Normalize each sample across features
                </div>
                <div style={styles.infoItalic}>Like ensuring each student has balanced scores</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Combined Application Section */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <div style={styles.cardHeader}>
          <h3 style={styles.subheading}>Combined Application in Deep Learning Practice</h3>
        </div>
        
        <div style={styles.cardContent}>
          <div style={styles.gridContainer}>
            <div style={{ ...styles.architectureBox, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <h4 style={styles.architectureTitle}>CNN Architecture (e.g., ResNet)</h4>
              
{/* CNN architecture diagram */}
              <div style={styles.architectureDiagram}>
                {/* Architecture background */}
                <div style={styles.diagramBg}></div>
                
                {/* Layer layout */}
                <div style={styles.layersContainer}>
                  {/* Input layer */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#e5e7eb', '80px')}>
                      <span>Input</span>
                    </div>
                  </div>
                  
                  {/* Conv layer 1 */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#fef9c3', '64px')}>
                      <span>Conv Layer</span>
                    </div>
                    <div style={styles.layer('#86efac', '20px')}>
                      <span style={{fontWeight: 'bold'}}>BatchNorm</span>
                    </div>
                    <div style={styles.layer('#e9d5ff', '20px')}>
                      <span>ReLU</span>
                    </div>
                  </div>
                  
                  {/* Conv layer 2 */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#fef9c3', '64px')}>
                      <span>Conv Layer</span>
                    </div>
                    <div style={styles.layer('#86efac', '20px')}>
                      <span style={{fontWeight: 'bold'}}>BatchNorm</span>
                    </div>
                    <div style={styles.layer('#e9d5ff', '20px')}>
                      <span>ReLU</span>
                    </div>
                  </div>
                  
                  {/* Fully connected layer */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#dbeafe', '80px')}>
                      <span>FC Layer</span>
                    </div>
                  </div>
                </div>
                
                {/* Weight decay marker */}
                <div style={styles.weightDecayMarker}>
                  <div style={styles.weightDecayBox}>
                    <span>L2 Weight Decay applied to all weights</span>
                  </div>
                </div>
              </div>
              
              <div style={{...styles.techSpecs, backgroundColor: '#dbeafe'}}>
                <strong>Typical Applications:</strong> ResNet, VGG, MobileNet
                <br />
                <strong>Normalization Choice:</strong> Primarily Batch Normalization
                <br />
                <strong>Regularization Choice:</strong> Almost always L2 weight decay
              </div>
            </div>
            
            <div style={{...styles.architectureBox, backgroundColor: '#f5f3ff', border: '1px solid #e9d5ff'}}>
              <h4 style={styles.architectureTitle}>Transformer Architecture (e.g., BERT, GPT)</h4>
              
              {/* Transformer architecture diagram */}
              <div style={styles.architectureDiagram}>
                {/* Architecture background */}
                <div style={styles.diagramBg}></div>
                
                {/* Layer layout */}
                <div style={styles.layersContainer}>
                  {/* Input embeddings */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#e5e7eb', '80px')}>
                      <span>Embeddings</span>
                    </div>
                  </div>
                  
                  {/* Attention block */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#e9d5ff', '32px')}>
                      <span>Multi-Head Attn</span>
                    </div>
                    <div style={styles.layer('#fbcfe8', '16px')}>
                      <span style={{fontWeight: 'bold'}}>LayerNorm</span>
                    </div>
                    <div style={styles.layer('#e0e7ff', '24px')}>
                      <span>Feed Forward</span>
                    </div>
                    <div style={styles.layer('#fbcfe8', '16px')}>
                      <span style={{fontWeight: 'bold'}}>LayerNorm</span>
                    </div>
                  </div>
                  
                  {/* Repeated attention block */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#e9d5ff', '32px')}>
                      <span>Multi-Head Attn</span>
                    </div>
                    <div style={styles.layer('#fbcfe8', '16px')}>
                      <span style={{fontWeight: 'bold'}}>LayerNorm</span>
                    </div>
                    <div style={styles.layer('#e0e7ff', '24px')}>
                      <span>Feed Forward</span>
                    </div>
                    <div style={styles.layer('#fbcfe8', '16px')}>
                      <span style={{fontWeight: 'bold'}}>LayerNorm</span>
                    </div>
                  </div>
                  
                  {/* Output layer */}
                  <div style={styles.layerStack}>
                    <div style={styles.layer('#dbeafe', '80px')}>
                      <span>Output Layer</span>
                    </div>
                  </div>
                </div>
                
                {/* Weight decay marker */}
                <div style={styles.weightDecayMarker}>
                  <div style={styles.weightDecayBox}>
                    <span>L2 Weight Decay + Dropout</span>
                  </div>
                </div>
              </div>
              
              <div style={{...styles.techSpecs, backgroundColor: '#f5f3ff'}}>
                <strong>Typical Applications:</strong> BERT, GPT, T5, ViT
                <br />
                <strong>Normalization Choice:</strong> Primarily Layer Normalization
                <br />
                <strong>Regularization Choice:</strong> L2 Weight Decay + Dropout
              </div>
            </div>
          </div>
          
          <div style={styles.pointsContainer}>
            <h4 style={styles.pointsTitle}>Reasons for Combined Usage in Deep Learning</h4>
            <div style={styles.reasonsGrid}>
              <div style={styles.reasonItem}>
                <div style={{...styles.reasonNumber, backgroundColor: '#dbeafe'}}>
                  <span>1</span>
                </div>
                <div>
                  <p style={styles.reasonText}><strong>Complementary Effects:</strong> Weight regularization controls model complexity, activation normalization improves training stability</p>
                </div>
              </div>
              <div style={styles.reasonItem}>
                <div style={{...styles.reasonNumber, backgroundColor: '#dcfce7'}}>
                  <span>2</span>
                </div>
                <div>
                  <p style={styles.reasonText}><strong>Synergistic Action:</strong> Normalization allows higher learning rates, regularization prevents overfitting at those higher rates</p>
                </div>
              </div>
              <div style={styles.reasonItem}>
                <div style={{...styles.reasonNumber, backgroundColor: '#f3e8ff'}}>
                  <span>3</span>
                </div>
                <div>
                  <p style={styles.reasonText}><strong>Engineering Practice:</strong> Normalization typically integrated as part of network architecture, weight regularization applied through optimizer</p>
                </div>
              </div>
              <div style={styles.reasonItem}>
                <div style={{...styles.reasonNumber, backgroundColor: '#fee2e2'}}>
                  <span>4</span>
                </div>
                <div>
                  <p style={styles.reasonText}><strong>Flexible Combination:</strong> Different architectures and tasks need different normalization and regularization combinations</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* PyTorch code example */}
          <div style={styles.codeContainer}>
            <h4 style={styles.codeTitle}>PyTorch Code Example: Activation Normalization + Weight Regularization</h4>
            <div style={styles.codeGrid}>
              <div style={styles.codeBlock}>
                <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
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
)`}
                </pre>
              </div>
              
              <div style={styles.codeAnalysis}>
                <div>
                  <h5 style={styles.analysisTitle}>Code Analysis</h5>
                  <ul style={styles.analysisList}>
                    <li style={styles.analysisItem}><span style={styles.codeHighlight('#dbeafe')}>nn.BatchNorm2d</span> - Activation normalization added after each convolutional layer</li>
                    <li style={styles.analysisItem}><span style={styles.codeHighlight('#fee2e2')}>weight_decay=1e-4</span> - L2 weight regularization applied via optimizer parameter</li>
                  </ul>
                </div>
                
                <div style={styles.analysisBox}>
                  <p style={styles.analysisText}>
                    <strong>Key Implementation Pattern:</strong> BatchNorm is added as part of the model architecture, while L2 regularization is configured as an optimizer parameter, highlighting their different implementation approaches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularizationViz;
