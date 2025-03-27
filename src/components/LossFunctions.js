import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LossFunctionsVisualization = () => {
  // States for fixed parameters (no longer interactive)
  const [huberDelta] = useState(0.30);
  const [marginValue] = useState(0.40);
  const [activeTab, setActiveTab] = useState('plots');
  
  // Generate data points for visualizations
  const generateData = () => {
    const data = [];
    // Create data points from -0.2 to 1.2 to show behavior around valid range
    for (let i = -0.2; i <= 1.2; i += 0.02) {
      const point = {
        x: i,
        // Different loss functions for target=1
        mse: Math.pow(i - 1, 2),
        mae: Math.abs(i - 1),
        binaryCrossEntropy: -(1 * Math.log(Math.max(i, 0.001)) + 0 * Math.log(Math.max(1 - i, 0.001))),
        huber: i < 1 - huberDelta/2 ? 
               huberDelta * (Math.abs(i - 1) - huberDelta/2) : 
               Math.pow(i - 1, 2) / 2,
        hinge: Math.max(0, marginValue - i * 1)
      };
      data.push(point);
    }
    return data;
  };

  // Generate comparison data for different target values
  const generateComparisonData = () => {
    return [
      { name: "Perfect Match (y=1, ŷ=1)", mse: 0, bce: 0, mae: 0, huber: 0, hinge: 0 },
      { name: "Slight Error (y=1, ŷ=0.8)", mse: 0.04, bce: 0.22, mae: 0.2, huber: 0.02, hinge: 0.2 },
      { name: "Medium Error (y=1, ŷ=0.5)", mse: 0.25, bce: 0.69, mae: 0.5, huber: 0.125, hinge: 0.5 },
      { name: "Large Error (y=1, ŷ=0.2)", mse: 0.64, bce: 1.61, mae: 0.8, huber: 0.32, hinge: 0.8 },
      { name: "Complete Error (y=1, ŷ=0)", mse: 1, bce: 15, mae: 1, huber: 0.5, hinge: 1 },
    ];
  };

  const [data, setData] = useState(generateData());
  const [comparisonData, setComparisonData] = useState(generateComparisonData());

  // Update data when parameters change
  useEffect(() => {
    setData(generateData());
  }, []);

  const lossFunctionInfo = {
    mse: {
      name: "Mean Squared Error (MSE)",
      formula: "MSE = (y - ŷ)²",
      description: "Measures the average squared difference between predictions and actual values.",
      pros: [
        "Differentiable everywhere",
        "Penalizes larger errors more heavily",
        "Mathematically convenient for optimization"
      ],
      cons: [
        "Very sensitive to outliers",
        "Can lead to slow convergence if features are on different scales",
        "Not ideal for classification tasks"
      ],
      use: "Regression problems where outliers are rare and error distribution is expected to be Gaussian."
    },
    binaryCrossEntropy: {
      name: "Binary Cross-Entropy Loss",
      formula: "BCE = -[y·log(ŷ) + (1-y)·log(1-ŷ)]",
      description: "Measures the performance of a classification model whose output is a probability value between 0 and 1.",
      pros: [
        "Well-suited for binary classification",
        "Works well with probabilistic outputs",
        "Penalizes confident wrong predictions heavily"
      ],
      cons: [
        "Not suitable for regression tasks",
        "Can lead to numerical instability with predictions near 0 or 1",
        "More computationally intensive than MSE"
      ],
      use: "Binary classification problems where output represents probability."
    },
    mae: {
      name: "Mean Absolute Error (MAE)",
      formula: "MAE = |y - ŷ|",
      description: "Measures the average absolute difference between predictions and actual values.",
      pros: [
        "More robust to outliers than MSE",
        "Provides uniform gradient",
        "Easier to interpret than MSE"
      ],
      cons: [
        "Not differentiable at y = ŷ",
        "Doesn't penalize large errors as heavily as MSE",
        "May converge slower than MSE in some cases"
      ],
      use: "Regression problems where outliers need to be handled better."
    },
    huber: {
      name: "Huber Loss",
      formula: "L = 0.5(y-ŷ)² if |y-ŷ| ≤ δ, else δ(|y-ŷ| - 0.5δ)",
      description: "Combines MSE and MAE, behaving like MSE for small errors and MAE for large errors.",
      pros: [
        "Robust to outliers like MAE",
        "Differentiable everywhere unlike MAE",
        "Adaptable based on the delta parameter"
      ],
      cons: [
        "Requires tuning of the delta hyperparameter",
        "More complex to implement",
        "Computationally more expensive than simpler losses"
      ],
      use: "Regression problems where some outliers are expected but differentiability is needed."
    },
    hinge: {
      name: "Hinge Loss",
      formula: "L = max(0, margin - y·ŷ)",
      description: "Measures how well a model separates classes with a margin, commonly used in SVMs.",
      pros: [
        "Encourages maximum-margin classification",
        "Good for binary classification tasks",
        "Can lead to sparse support vectors"
      ],
      cons: [
        "Not differentiable at the hinge point",
        "Doesn't provide probability outputs",
        "Less commonly used in deep learning"
      ],
      use: "Margin-based classification problems, especially when using SVMs or when a clear decision boundary is needed."
    }
  };

  // Styles for custom tabs and card components
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1rem'
    },
    tabList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    tabButton: (isActive) => ({
      padding: '0.5rem 1rem',
      border: '1px solid #ccc',
      borderRadius: '0.25rem',
      background: isActive ? '#4f46e5' : '#fff',
      color: isActive ? '#fff' : '#333',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: isActive ? 'bold' : 'normal'
    }),
    card: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      marginBottom: '1rem',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    cardHeader: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      background: '#f9fafb'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      margin: 0
    },
    cardDescription: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    cardContent: {
      padding: '1rem'
    },
    cardFooter: {
      padding: '1rem',
      borderTop: '1px solid #e5e7eb',
      background: '#f9fafb'
    },
    sliderContainer: {
      marginBottom: '1rem'
    },
    sliderLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    slider: {
      width: '100%',
      marginTop: '0.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem',
      marginBottom: '1rem'
    },
    gridMd2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem',
      marginBottom: '1rem',
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    spacerY: {
      marginTop: '1.5rem',
      marginBottom: '1.5rem'
    },
    listItem: {
      marginLeft: '1.5rem',
      position: 'relative',
      paddingLeft: '0.5rem'
    },
    infoBox: {
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem'
    },
    blueBox: {
      background: '#ebf5ff',
    },
    greenBox: {
      background: '#f0fdf4',
    },
    grayBox: {
      background: '#f9fafb',
    },
    yellowBox: {
      background: '#fffbeb',
    },
    sectionHeading: {
      fontSize: '1.125rem',
      fontWeight: '500',
      marginBottom: '0.5rem',
      color: '#1f2937'
    },
    sectionHeadingBlue: {
      color: '#1e40af'
    },
    sectionHeadingGreen: {
      color: '#15803d'
    },
    sectionHeadingYellow: {
      color: '#92400e'
    },
    table: {
      minWidth: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    },
    th: {
      padding: '0.5rem 1rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      fontWeight: '500',
      background: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '0.5rem 1rem',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '0.875rem'
    },
    chartContainer: {
      height: '16rem'
    }
  };

  // Apply media query for grid
  useEffect(() => {
    const handleResize = () => {
      const gridElements = document.querySelectorAll('.grid-md-2');
      gridElements.forEach(element => {
        if (window.innerWidth >= 768) {
          element.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
          element.style.gridTemplateColumns = 'repeat(1, 1fr)';
        }
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Neural Network Loss Functions Visualization</h1>
      
      {/* Custom Tabs */}
      <div style={styles.tabList}>
        <button 
          style={styles.tabButton(activeTab === 'plots')}
          onClick={() => setActiveTab('plots')}
        >
          Loss Function Plots
        </button>
        <button 
          style={styles.tabButton(activeTab === 'fundamentals')}
          onClick={() => setActiveTab('fundamentals')}
        >
          Why Different Loss Functions
        </button>
        <button 
          style={styles.tabButton(activeTab === 'details')}
          onClick={() => setActiveTab('details')}
        >
          Detailed Explanations
        </button>
      </div>
      
      {/* Plots Tab */}
      {activeTab === 'plots' && (
        <div style={styles.grid}>
          <div className="grid-md-2" style={{display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem'}}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Regression Loss Functions</div>
                <div style={styles.cardDescription}>MSE, MAE, and Huber Loss</div>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        label={{ value: 'Predicted Value', position: 'insideBottom', offset: -5 }} 
                        domain={[0, 1]}
                      />
                      <YAxis 
                        label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} 
                        domain={[0, 1.5]}
                      />
                      <Tooltip 
                        formatter={(value, name) => [value.toFixed(3), name === 'mse' ? 'MSE' : name === 'mae' ? 'MAE' : 'Huber']}
                        labelFormatter={(value) => `Prediction: ${parseFloat(value).toFixed(2)}`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="mse" stroke="#8884d8" name="MSE" dot={false} />
                      <Line type="monotone" dataKey="mae" stroke="#82ca9d" name="MAE" dot={false} />
                      <Line type="monotone" dataKey="huber" stroke="#ff7300" name="Huber" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Classification Loss Functions</div>
                <div style={styles.cardDescription}>Binary Cross-Entropy and Hinge Loss</div>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        label={{ value: 'Predicted Value', position: 'insideBottom', offset: -5 }} 
                        domain={[0, 1]}
                      />
                      <YAxis 
                        label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} 
                        domain={[0, 5]}
                      />
                      <Tooltip 
                        formatter={(value, name) => [value.toFixed(3), name === 'binaryCrossEntropy' ? 'BCE' : 'Hinge']}
                        labelFormatter={(value) => `Prediction: ${parseFloat(value).toFixed(2)}`}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="binaryCrossEntropy" stroke="#8884d8" name="Binary Cross-Entropy" dot={false} />
                      <Line type="monotone" dataKey="hinge" stroke="#82ca9d" name="Hinge Loss" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fundamentals Tab */}
      {activeTab === 'fundamentals' && (
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Why Regression and Classification Need Different Loss Functions</div>
              <div style={styles.cardDescription}>Understanding the fundamental differences in simple terms</div>
            </div>
            <div style={styles.cardContent}>
              <div className="grid-md-2" style={{display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem', marginBottom: '1.5rem'}}>
                <div style={{...styles.infoBox, ...styles.blueBox}}>
                  <h3 style={{...styles.sectionHeading, ...styles.sectionHeadingBlue}}>Regression Tasks</h3>
                  <p style={{marginBottom: '0.5rem'}}>Imagine you're trying to predict house prices or tomorrow's temperature.</p>
                  <p style={{marginBottom: '0.5rem'}}><strong>What's being predicted:</strong> Continuous numbers (like $350,000 or 72°F)</p>
                  <p style={{marginBottom: '0.5rem'}}><strong>How errors are measured:</strong> By the distance between prediction and actual value</p>
                  <p><strong>Real-world analogy:</strong> Like measuring how far your arrow landed from the bullseye</p>
                </div>
                
                <div style={{...styles.infoBox, ...styles.greenBox}}>
                  <h3 style={{...styles.sectionHeading, ...styles.sectionHeadingGreen}}>Classification Tasks</h3>
                  <p style={{marginBottom: '0.5rem'}}>Imagine you're trying to identify spam emails or diagnose a disease.</p>
                  <p style={{marginBottom: '0.5rem'}}><strong>What's being predicted:</strong> Categories or classes (like "spam/not spam" or "cat/dog")</p>
                  <p style={{marginBottom: '0.5rem'}}><strong>How errors are measured:</strong> By whether the prediction is right or wrong, and how confident you were</p>
                  <p><strong>Real-world analogy:</strong> Like betting on a horse race - you either win or lose, and it matters how much you bet</p>
                </div>
              </div>
              
              <div style={styles.spacerY}>
                <h3 style={styles.sectionHeading}>Why They Need Different Loss Functions</h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div style={{...styles.infoBox, ...styles.grayBox}}>
                    <h4 style={{fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Different Types of Errors</h4>
                    <p>In regression, being off by 10 or by 100 matters (different magnitudes of error). In classification, you're either right or wrong, but your confidence level matters.</p>
                  </div>
                  
                  <div style={{...styles.infoBox, ...styles.grayBox}}>
                    <h4 style={{fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Different Learning Behaviors</h4>
                    <p>Regression loss functions guide the model to find the "shortest path" to the correct value. Classification loss functions push the model to draw clear boundaries between categories.</p>
                  </div>
                  
                  <div style={{...styles.infoBox, ...styles.grayBox}}>
                    <h4 style={{fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Different Output Ranges</h4>
                    <p>Regression outputs can be any number (even negative). Classification often outputs probabilities (0-1) or scores, requiring special handling.</p>
                  </div>
                  
                  <div style={{...styles.infoBox, ...styles.yellowBox}}>
                    <h4 style={{...styles.sectionHeading, ...styles.sectionHeadingYellow, marginBottom: '0.25rem'}}>Why Cross-Entropy is Perfect for Classification</h4>
                    <p style={{marginBottom: '0.5rem'}}>Cross-Entropy Loss has special properties that make it ideal for classification tasks:</p>
                    <ul style={{paddingLeft: '1.5rem', marginBottom: '0.5rem'}}>
                      <li style={{marginBottom: '0.25rem'}}>It measures the difference between probability distributions (your prediction vs. the truth)</li>
                      <li style={{marginBottom: '0.25rem'}}>It severely punishes confident wrong predictions (like being 99% sure an email is not spam when it actually is)</li>
                      <li style={{marginBottom: '0.25rem'}}>It works naturally with the probability outputs (0-1) that classification models produce</li>
                      <li style={{marginBottom: '0.25rem'}}>It has favorable gradient properties when used with sigmoid/softmax functions</li>
                    </ul>
                    <p style={{marginTop: '0.5rem'}}><strong>Real-world analogy:</strong> It's like a teacher who doesn't mind if you're unsure and get something wrong, but severely penalizes you when you confidently assert an incorrect answer.</p>
                  </div>
                  
                  <div style={{...styles.infoBox, ...styles.grayBox}}>
                    <h4 style={{fontWeight: '500', color: '#374151', marginBottom: '0.25rem'}}>Real-World Example: Weather Prediction</h4>
                    <p><strong>Regression task:</strong> Predicting tomorrow's temperature (72°F, 73°F, etc.)<br />
                    <strong>Classification task:</strong> Predicting if it will rain (Yes/No)</p>
                    <p>The temperature prediction needs MSE/MAE to measure "how far off" you were.<br />
                    The rain prediction needs Cross-Entropy to penalize confident wrong predictions (like confidently saying "no rain" right before a downpour).</p>
                  </div>
                </div>
              </div>
              
              <div style={styles.spacerY}>
                <h3 style={styles.sectionHeading}>Choosing the Right Loss Function</h3>
                <div style={{overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>If your task is...</th>
                        <th style={styles.th}>And you care about...</th>
                        <th style={styles.th}>Consider using...</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}>Regression</td>
                        <td style={styles.td}>Penalizing large errors more</td>
                        <td style={styles.td}>Mean Squared Error (MSE)</td>
                      </tr>
                      <tr style={{background: '#f9fafb'}}>
                        <td style={styles.td}>Regression</td>
                        <td style={styles.td}>Being robust to outliers</td>
                        <td style={styles.td}>Mean Absolute Error (MAE)</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Regression</td>
                        <td style={styles.td}>Balance between MSE and MAE</td>
                        <td style={styles.td}>Huber Loss</td>
                      </tr>
                      <tr style={{background: '#f9fafb'}}>
                        <td style={styles.td}>Binary Classification</td>
                        <td style={styles.td}>Probability outputs (0-1)</td>
                        <td style={styles.td}>Binary Cross-Entropy</td>
                      </tr>
                      <tr>
                        <td style={styles.td}>Multi-class Classification</td>
                        <td style={styles.td}>Probability distribution across classes</td>
                        <td style={styles.td}>Categorical Cross-Entropy</td>
                      </tr>
                      <tr style={{background: '#f9fafb'}}>
                        <td style={styles.td}>Classification</td>
                        <td style={styles.td}>Clear decision boundaries</td>
                        <td style={styles.td}>Hinge Loss</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Details Tab */}
      {activeTab === 'details' && (
        <div style={styles.grid}>
          {Object.entries(lossFunctionInfo).map(([key, info]) => (
            <div key={key} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>{info.name}</div>
                <div style={{...styles.cardDescription, fontFamily: 'monospace'}}>{info.formula}</div>
              </div>
              <div style={styles.cardContent}>
                <p style={{marginBottom: '1rem'}}>{info.description}</p>
                
                <div className="grid-md-2" style={{display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem'}}>
                  <div>
                    <h3 style={{fontWeight: '500', marginBottom: '0.5rem'}}>Pros:</h3>
                    <ul style={{paddingLeft: '1.5rem'}}>
                      {info.pros.map((pro, i) => (
                        <li key={i} style={{marginBottom: '0.25rem'}}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 style={{fontWeight: '500', marginBottom: '0.5rem'}}>Cons:</h3>
                    <ul style={{paddingLeft: '1.5rem'}}>
                      {info.cons.map((con, i) => (
                        <li key={i} style={{marginBottom: '0.25rem'}}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <p><strong>Best used for:</strong> {info.use}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LossFunctionsVisualization;
