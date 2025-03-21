import React, { useEffect } from 'react';
import * as d3 from 'd3';

const OptimizerComparison = () => {
  useEffect(() => {
    renderVisualization();
    return () => d3.select('#viz-container').selectAll('*').remove();
  }, []);
  
  const renderVisualization = () => {
    // Setup
    const width = 600, height = 500;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select('#viz-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Loss curves
    const iterations = 100;
    const xScale = d3.scaleLinear()
      .domain([0, iterations])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Generate loss data for different optimizers
    const sgdData = [];
    const adamData = [];
    const adamWData = [];
    
    for (let i = 0; i <= iterations; i++) {
      // SGD has long plateau at saddle point
      let sgdLoss = 0;
      if (i <= 30) sgdLoss = Math.exp(-0.05 * i) * 0.8 + 0.2;
      else if (i <= 80) sgdLoss = 0.2 - 0.001 * (i - 30); // Long plateau
      else sgdLoss = 0.15 - 0.005 * (i - 80);
      
      // Adam moves through saddle point efficiently
      let adamLoss = 0;
      if (i <= 30) adamLoss = Math.exp(-0.05 * i) * 0.8 + 0.2;
      else if (i <= 40) adamLoss = 0.2 - 0.005 * (i - 30); // Brief plateau
      else adamLoss = 0.15 * Math.exp(-0.05 * (i - 40)) + 0.05;
      
      // AdamW handles saddle point even better with weight decay
      let adamWLoss = 0;
      if (i <= 30) adamWLoss = Math.exp(-0.05 * i) * 0.8 + 0.2;
      else if (i <= 37) adamWLoss = 0.2 - 0.008 * (i - 30); // Even shorter plateau
      else adamWLoss = 0.12 * Math.exp(-0.06 * (i - 37)) + 0.03;
      
      sgdData.push({ x: i, y: sgdLoss });
      adamData.push({ x: i, y: adamLoss });
      adamWData.push({ x: i, y: adamWLoss });
    }
    
    // Draw axes
    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Iterations');
    
    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Loss');
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Draw SGD loss curve
    svg.append('path')
      .datum(sgdData)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')
      .attr('d', line);
    
    // Draw Adam loss curve
    svg.append('path')
      .datum(adamData)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 3)
      .attr('d', line);
    
    // Draw AdamW loss curve
    svg.append('path')
      .datum(adamWData)
      .attr('fill', 'none')
      .attr('stroke', 'purple')
      .attr('stroke-width', 3)
      .attr('d', line);
    
    // Highlight saddle point region
    svg.append('rect')
      .attr('x', xScale(30))
      .attr('y', yScale(0.25))
      .attr('width', xScale(80) - xScale(30))
      .attr('height', yScale(0.15) - yScale(0.25))
      .attr('fill', 'rgba(255, 255, 0, 0.2)')
      .attr('stroke', 'orange')
      .attr('stroke-dasharray', '3,3');
    
    svg.append('text')
      .attr('x', xScale(55))
      .attr('y', yScale(0.27))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Saddle Point Region');
    
    // Add annotations
    svg.append('text')
      .attr('x', xScale(70))
      .attr('y', yScale(0.19))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'blue')
      .attr('font-weight', 'bold')
      .text('SGD gets stuck');
    
    svg.append('text')
      .attr('x', xScale(60))
      .attr('y', yScale(0.08))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'green')
      .attr('font-weight', 'bold')
      .text('Adam escapes');
    
    svg.append('text')
      .attr('x', xScale(50))
      .attr('y', yScale(0.04))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'purple')
      .attr('font-weight', 'bold')
      .text('AdamW escapes faster');
    
    // Add title
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Optimizer Comparison at Saddle Points');
    
    // Add legend with full names
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth - 250}, 20)`);
    
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 20)
      .attr('y2', 0)
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 5)
      .attr('font-size', '12px')
      .text('SGD (Stochastic Gradient Descent)');
    
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 20)
      .attr('x2', 20)
      .attr('y2', 20)
      .attr('stroke', 'green')
      .attr('stroke-width', 2);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 25)
      .attr('font-size', '12px')
      .text('Adam (Adaptive Moment Estimation)');
    
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 40)
      .attr('x2', 20)
      .attr('y2', 40)
      .attr('stroke', 'purple')
      .attr('stroke-width', 2);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 45)
      .attr('font-size', '12px')
      .text('AdamW (Adam with Decoupled Weight Decay)');
    
    // Draw small saddle function visualization
    const saddleSize = 120;
    const saddleX = 100;
    const saddleY = 150;
    
    // Create a small saddle function visualization
    const saddle = svg.append('g')
      .attr('transform', `translate(${saddleX}, ${saddleY})`);
    
    // Add background for the saddle visualization
    saddle.append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', saddleSize + 20)
      .attr('height', saddleSize + 20)
      .attr('fill', 'rgba(240, 240, 240, 0.8)')
      .attr('rx', 10);
    
    // Draw simplified saddle surface
    const saddleScale = d3.scaleLinear().domain([-1, 1]).range([0, saddleSize]);
    
    // Create grid points for the saddle
    const points = [];
    for (let x = -1; x <= 1; x += 0.1) {
      for (let y = -1; y <= 1; y += 0.1) {
        const z = x * x - y * y; // Saddle function
        points.push({ x, y, z });
      }
    }
    
    // Color scale for height
    const colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['steelblue', 'white', 'firebrick']);
    
    // Draw saddle points
    saddle.selectAll('.saddle-point')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', d => saddleScale(d.x))
      .attr('cy', d => saddleScale(d.y))
      .attr('r', 3)
      .attr('fill', d => colorScale(d.z))
      .attr('opacity', 0.7);
    
    // Draw simplified trajectories on the saddle
    const sgdSaddleTrajectory = [
      { x: -0.8, y: 0.2 }, { x: -0.5, y: 0.1 }, { x: -0.2, y: 0.05 },
      { x: -0.1, y: 0.02 }, { x: -0.05, y: 0.01 }, { x: -0.02, y: 0.005 },
      { x: -0.01, y: 0.002 }, { x: 0, y: 0 } // Gets stuck
    ];
    
    const adamSaddleTrajectory = [
      { x: -0.8, y: 0.2 }, { x: -0.5, y: 0.1 }, { x: -0.2, y: 0.05 },
      { x: 0, y: 0 }, { x: 0.2, y: -0.1 }, { x: 0.4, y: -0.2 },
      { x: 0.6, y: -0.3 }, { x: 0.8, y: -0.4 } // Passes through
    ];
    
    const adamWSaddleTrajectory = [
      { x: -0.8, y: 0.2 }, { x: -0.4, y: 0.1 }, { x: -0.1, y: 0.03 },
      { x: 0, y: -0.02 }, { x: 0.15, y: -0.15 }, { x: 0.35, y: -0.3 },
      { x: 0.6, y: -0.5 }, { x: 0.9, y: -0.7 } // Passes through with more direct path
    ];
    
    // Draw SGD path on saddle
    saddle.append('path')
      .datum(sgdSaddleTrajectory)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')
      .attr('d', d3.line()
        .x(d => saddleScale(d.x))
        .y(d => saddleScale(d.y))
        .curve(d3.curveBasis));
    
    // Draw Adam path on saddle
    saddle.append('path')
      .datum(adamSaddleTrajectory)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => saddleScale(d.x))
        .y(d => saddleScale(d.y))
        .curve(d3.curveBasis));
    
    // Draw AdamW path on saddle
    saddle.append('path')
      .datum(adamWSaddleTrajectory)
      .attr('fill', 'none')
      .attr('stroke', 'purple')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => saddleScale(d.x))
        .y(d => saddleScale(d.y))
        .curve(d3.curveBasis));
    
    // Mark saddle point
    saddle.append('circle')
      .attr('cx', saddleScale(0))
      .attr('cy', saddleScale(0))
      .attr('r', 5)
      .attr('fill', 'yellow')
      .attr('stroke', 'black');
    
    // Add saddle title
    saddle.append('text')
      .attr('x', saddleSize / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Saddle Point (x² - y²)');
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div id="viz-container" className="w-full h-[500px] border rounded bg-white p-4"></div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Stochastic Gradient Descent (SGD)</h3>
          <p>Uses the same learning rate for all parameters and applies no momentum by default. Near saddle points, all gradients become very small, causing SGD to slow down dramatically or get "stuck" for many iterations.</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold text-green-700 mb-2">Adaptive Moment Estimation (Adam)</h3>
          <p>Maintains separate learning rates for each parameter based on gradient history. These adaptive rates automatically increase when gradients are consistently small, allowing it to escape saddle points faster.</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold text-purple-700 mb-2">Adam with Decoupled Weight Decay (AdamW)</h3>
          <p>Extends Adam by applying weight decay directly to weights rather than to gradients. This decoupling helps break symmetry at saddle points and provides better regularization, often resulting in even faster escape.</p>
        </div>
        
        <div className="col-span-1 md:col-span-3 bg-yellow-50 p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-2">Mathematical Components of Adaptive Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold">How Adam Works:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-semibold">First Moment:</span> m<sub>t</sub> = β<sub>1</sub>·m<sub>t-1</sub> + (1-β<sub>1</sub>)·g<sub>t</sub> (provides momentum)</li>
                <li><span className="font-semibold">Second Moment:</span> v<sub>t</sub> = β<sub>2</sub>·v<sub>t-1</sub> + (1-β<sub>2</sub>)·g<sub>t</sub>² (estimates variance)</li>
                <li><span className="font-semibold">Bias Correction:</span> m̂<sub>t</sub> = m<sub>t</sub>/(1-β<sub>1</sub><sup>t</sup>), v̂<sub>t</sub> = v<sub>t</sub>/(1-β<sub>2</sub><sup>t</sup>)</li>
                <li><span className="font-semibold">Parameter Update:</span> θ<sub>t+1</sub> = θ<sub>t</sub> - α·m̂<sub>t</sub>/(√v̂<sub>t</sub> + ε)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold">How AdamW Differs:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-semibold">Standard Adam:</span> Applies L2 regularization within gradient: g<sub>t</sub> = ∇f(θ<sub>t</sub>) + λθ<sub>t</sub></li>
                <li><span className="font-semibold">AdamW:</span> Decouples weight decay: θ<sub>t+1</sub> = θ<sub>t</sub> - α·m̂<sub>t</sub>/(√v̂<sub>t</sub> + ε) - α·λ·θ<sub>t</sub></li>
                <li><span className="font-semibold">Benefit:</span> More effective regularization that is independent of gradient magnitude</li>
                <li><span className="font-semibold">Saddle Point Impact:</span> Helps overcome symmetrical parameter distributions often found at saddle points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizerComparison;
