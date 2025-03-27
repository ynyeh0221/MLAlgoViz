import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

const LossFunctionsVisualization = () => {
  // States for interactive parameters
  const [prediction, setPrediction] = useState(0.5);
  const [huberDelta, setHuberDelta] = useState(1.0);
  const [marginValue, setMarginValue] = useState(1.0);
  
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
  }, [prediction, huberDelta, marginValue]);

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

  return (
    <div className="flex flex-col space-y-4 p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Neural Network Loss Functions Visualization</h1>
      
      <Tabs defaultValue="plots" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="plots">Loss Function Plots</TabsTrigger>
          <TabsTrigger value="fundamentals">Why Different Loss Functions</TabsTrigger>
          <TabsTrigger value="details">Detailed Explanations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plots" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interactive controls */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Interactive Parameters</CardTitle>
                <CardDescription>Adjust parameters to see how loss functions behave</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Huber Loss Delta: {huberDelta.toFixed(2)}</label>
                  <Slider
                    value={[huberDelta]}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setHuberDelta(value[0])}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hinge Loss Margin: {marginValue.toFixed(2)}</label>
                  <Slider
                    value={[marginValue]}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setMarginValue(value[0])}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Loss function charts */}
            <Card>
              <CardHeader>
                <CardTitle>Regression Loss Functions</CardTitle>
                <CardDescription>MSE, MAE, and Huber Loss</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Classification Loss Functions</CardTitle>
                <CardDescription>Binary Cross-Entropy and Hinge Loss</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="fundamentals">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Why Regression and Classification Need Different Loss Functions</CardTitle>
                <CardDescription>Understanding the fundamental differences in simple terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Regression Tasks</h3>
                    <p className="mb-2">Imagine you're trying to predict house prices or tomorrow's temperature.</p>
                    <p className="mb-2"><strong>What's being predicted:</strong> Continuous numbers (like $350,000 or 72°F)</p>
                    <p className="mb-2"><strong>How errors are measured:</strong> By the distance between prediction and actual value</p>
                    <p><strong>Real-world analogy:</strong> Like measuring how far your arrow landed from the bullseye</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Classification Tasks</h3>
                    <p className="mb-2">Imagine you're trying to identify spam emails or diagnose a disease.</p>
                    <p className="mb-2"><strong>What's being predicted:</strong> Categories or classes (like "spam/not spam" or "cat/dog")</p>
                    <p className="mb-2"><strong>How errors are measured:</strong> By whether the prediction is right or wrong, and how confident you were</p>
                    <p><strong>Real-world analogy:</strong> Like betting on a horse race - you either win or lose, and it matters how much you bet</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Why They Need Different Loss Functions</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Different Types of Errors</h4>
                      <p>In regression, being off by 10 or by 100 matters (different magnitudes of error). In classification, you're either right or wrong, but your confidence level matters.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Different Learning Behaviors</h4>
                      <p>Regression loss functions guide the model to find the "shortest path" to the correct value. Classification loss functions push the model to draw clear boundaries between categories.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Different Output Ranges</h4>
                      <p>Regression outputs can be any number (even negative). Classification often outputs probabilities (0-1) or scores, requiring special handling.</p>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Why Cross-Entropy is Perfect for Classification</h4>
                      <p className="mb-2">Cross-Entropy Loss has special properties that make it ideal for classification tasks:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>It measures the difference between probability distributions (your prediction vs. the truth)</li>
                        <li>It severely punishes confident wrong predictions (like being 99% sure an email is not spam when it actually is)</li>
                        <li>It works naturally with the probability outputs (0-1) that classification models produce</li>
                        <li>It has favorable gradient properties when used with sigmoid/softmax functions</li>
                      </ul>
                      <p className="mt-2"><strong>Real-world analogy:</strong> It's like a teacher who doesn't mind if you're unsure and get something wrong, but severely penalizes you when you confidently assert an incorrect answer.</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Real-World Example: Weather Prediction</h4>
                      <p><strong>Regression task:</strong> Predicting tomorrow's temperature (72°F, 73°F, etc.)<br />
                      <strong>Classification task:</strong> Predicting if it will rain (Yes/No)</p>
                      <p>The temperature prediction needs MSE/MAE to measure "how far off" you were.<br />
                      The rain prediction needs Cross-Entropy to penalize confident wrong predictions (like confidently saying "no rain" right before a downpour).</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Choosing the Right Loss Function</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">If your task is...</th>
                          <th className="px-4 py-2 text-left">And you care about...</th>
                          <th className="px-4 py-2 text-left">Consider using...</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2">Regression</td>
                          <td className="px-4 py-2">Penalizing large errors more</td>
                          <td className="px-4 py-2">Mean Squared Error (MSE)</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2">Regression</td>
                          <td className="px-4 py-2">Being robust to outliers</td>
                          <td className="px-4 py-2">Mean Absolute Error (MAE)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Regression</td>
                          <td className="px-4 py-2">Balance between MSE and MAE</td>
                          <td className="px-4 py-2">Huber Loss</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2">Binary Classification</td>
                          <td className="px-4 py-2">Probability outputs (0-1)</td>
                          <td className="px-4 py-2">Binary Cross-Entropy</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Multi-class Classification</td>
                          <td className="px-4 py-2">Probability distribution across classes</td>
                          <td className="px-4 py-2">Categorical Cross-Entropy</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Classification</td>
                          <td className="px-4 py-2">Clear decision boundaries</td>
                          <td className="px-4 py-2">Hinge Loss</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(lossFunctionInfo).map(([key, info]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{info.name}</CardTitle>
                  <CardDescription className="font-mono">{info.formula}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{info.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Pros:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {info.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Cons:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {info.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p><strong>Best used for:</strong> {info.use}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LossFunctionsVisualization;
