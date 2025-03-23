import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const SCHEDULE_COLORS = {
  constant: "#3b82f6",
  step: "#ef4444",
  onecycle: "#10b981",
  cosine: "#8b5cf6",
};

const SimpleTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  const point = payload[0].payload;
  return (
    <div style={{backgroundColor: "white", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px"}}>
      <p><strong>Step:</strong> {point.step}</p>
      {payload.map(entry => (
        <p key={entry.dataKey}>
          <strong>{entry.name || entry.dataKey}:</strong> {typeof entry.value === 'number' ? entry.value.toExponential(4) : entry.value}
        </p>
      ))}
    </div>
  );
};

const LRScheduleVisualizer = () => {
  const [totalEpochs, setTotalEpochs] = useState(4);
  const [maxLR, setMaxLR] = useState(0.002);
  const [initialLR, setInitialLR] = useState(0.0001);
  const [warmupPct, setWarmupPct] = useState(0.2);
  const [activeSchedules, setActiveSchedules] = useState(['constant', 'step', 'onecycle', 'cosine']);
  
  const datasetSize = 10000;
  const batchSize = 32;
  const batchesPerEpoch = Math.ceil(datasetSize / batchSize);
  const totalSteps = batchesPerEpoch * totalEpochs;
  
  const [lrData, setLrData] = useState([]);
  const [lossData, setLossData] = useState([]);
  const [chartWidth, setChartWidth] = useState(600);
  const [chartHeight, setChartHeight] = useState(300);
  
  const initialLoss = 5.0;
  const optimalLoss = 0.5;
  const noiseLevel = 0.05;

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = Math.min(
        document.getElementById('chart-container')?.clientWidth || 600,
        window.innerWidth - 40
      );
      setChartWidth(containerWidth);
      setChartHeight(Math.max(300, Math.min(400, window.innerHeight * 0.5)));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSchedule = (schedule) => {
    if (activeSchedules.includes(schedule)) {
      setActiveSchedules(activeSchedules.filter(s => s !== schedule));
    } else {
      setActiveSchedules([...activeSchedules, schedule]);
    }
  };
  
  useEffect(() => {
    const newLRData = [];
    const warmupSteps = Math.floor(totalSteps * warmupPct);
    
    for (let step = 0; step <= totalSteps; step += Math.max(1, Math.floor(totalSteps / 100))) {
      const point = { step };
      
      point.constant = maxLR;
      point.step_decay = null;
      
      if (step < warmupSteps) {
        point.step_decay = initialLR + (maxLR - initialLR) * (step / warmupSteps);
      } else {
        const decay1 = warmupSteps + Math.floor((totalSteps - warmupSteps) / 3);
        const decay2 = warmupSteps + Math.floor((totalSteps - warmupSteps) * 2 / 3);
        
        if (step < decay1) {
          point.step_decay = maxLR;
        } else if (step < decay2) {
          point.step_decay = maxLR * 0.1;
        } else {
          point.step_decay = maxLR * 0.01;
        }
      }
      
      if (step < warmupSteps) {
        point.onecycle = initialLR + (maxLR - initialLR) * (step / warmupSteps);
      } else {
        const decaySteps = step - warmupSteps;
        const totalDecaySteps = totalSteps - warmupSteps;
        const cosineValue = 0.5 * (1 + Math.cos(Math.PI * decaySteps / totalDecaySteps));
        point.onecycle = initialLR + (maxLR - initialLR) * cosineValue;
      }
      
      if (step < warmupSteps) {
        point.cosine = initialLR + (maxLR - initialLR) * (step / warmupSteps);
      } else {
        const decaySteps = step - warmupSteps;
        const totalDecaySteps = totalSteps - warmupSteps;
        point.cosine = maxLR * 0.5 * (1 + Math.cos(Math.PI * decaySteps / totalDecaySteps));
      }
      
      newLRData.push(point);
    }
  
    setLrData(newLRData);
  }, [totalEpochs, totalSteps, maxLR, initialLR, warmupPct]);

  useEffect(() => {
    if (lrData.length === 0) return;

    const newLossData = [];

    for (let step = 0; step <= totalSteps; step += Math.max(1, Math.floor(totalSteps / 100))) {
      const lrPoint = lrData.reduce((prev, curr) => 
        Math.abs(curr.step - step) < Math.abs(prev.step - step) ? curr : prev
      , lrData[0]);
      
      const point = { step };
      
      // Initialize loss values for all schedules to ensure they're included in data
      activeSchedules.forEach(schedule => {
        if (schedule === 'constant') point.constant_loss = null;
        else if (schedule === 'step') point.step_loss = null;
        else if (schedule === 'onecycle') point.onecycle_loss = null;
        else if (schedule === 'cosine') point.cosine_loss = null;
      });
      
      // Calculate actual loss values
      activeSchedules.forEach(schedule => {
        const lr = schedule === 'step' ? lrPoint.step_decay : lrPoint[schedule];
        if (lr === undefined || lr === null) return;
        
        const warmupSteps = Math.floor(totalSteps * warmupPct);
        const decay1 = warmupSteps + Math.floor((totalSteps - warmupSteps) / 3);
        const decay2 = warmupSteps + Math.floor((totalSteps - warmupSteps) * 2 / 3);
        
        if (schedule === 'constant') {
          const initialProgress = Math.min(1, step / (totalSteps * 0.2));
          const oscillationPhase = Math.max(0, Math.min(1, (step - totalSteps * 0.2) / (totalSteps * 0.5)));
          const oscillation = Math.sin(step / 7) * 0.3 * oscillationPhase;
          const finalPhase = Math.max(0, step - totalSteps * 0.7) / (totalSteps * 0.3);
          const finalImprovement = finalPhase * 0.3;
          
          point.constant_loss = initialLoss * Math.exp(-initialProgress * 4) + 
                                optimalLoss * 1.5 + 
                                oscillation - 
                                finalImprovement;
        }
        
        else if (schedule === 'step') {
          let progress = 0;
          let plateauNoise = 0;
          
          if (step < warmupSteps) {
            progress = step / warmupSteps * 0.4;
            plateauNoise = 0.05 * Math.sin(step / 5);
          } else if (step < decay1) {
            progress = 0.4 + (step - warmupSteps) / (decay1 - warmupSteps) * 0.1;
            plateauNoise = 0.05 * Math.sin(step / 5);
          } else if (step < decay1 + 10) {
            const dropProgress = (step - decay1) / 10;
            progress = 0.5 + dropProgress * 0.15;
          } else if (step < decay2) {
            progress = 0.65 + (step - (decay1 + 10)) / (decay2 - (decay1 + 10)) * 0.05;
            plateauNoise = 0.03 * Math.sin(step / 5);
          } else if (step < decay2 + 10) {
            const dropProgress = (step - decay2) / 10;
            progress = 0.7 + dropProgress * 0.1;
          } else {
            progress = 0.8 + (step - (decay2 + 10)) / (totalSteps - (decay2 + 10)) * 0.1;
            plateauNoise = 0.02 * Math.sin(step / 5);
          }
          
          point.step_loss = initialLoss * Math.exp(-progress * 3.5) + 
                            optimalLoss * 1.1 + 
                            plateauNoise;
        }
        
        else if (schedule === 'onecycle') {
          let progress = 0;
          let noise = 0;
          
          if (step < warmupSteps) {
            progress = (step / warmupSteps) * 0.4;
            noise = 0.08 * Math.random() * Math.exp(-step / warmupSteps);
          } else if (step < totalSteps * 0.6) {
            const exploreProgress = (step - warmupSteps) / (totalSteps * 0.6 - warmupSteps);
            progress = 0.4 + exploreProgress * 0.3;
            noise = 0.05 * Math.random() * (1 - exploreProgress);
          } else {
            const finetuneProgress = (step - totalSteps * 0.6) / (totalSteps * 0.4);
            progress = 0.7 + finetuneProgress * 0.2;
            noise = 0.01 * Math.random();
          }
          
          point.onecycle_loss = initialLoss * Math.exp(-progress * 3.8) + 
                                optimalLoss * 1.05 + 
                                noise;
        }
        
        else if (schedule === 'cosine') {
          let progress = 0;
          let noise = 0;
          
          if (step < warmupSteps) {
            progress = (step / warmupSteps) * 0.35;
            noise = 0.07 * Math.random();
          } else {
            const postWarmupProgress = (step - warmupSteps) / (totalSteps - warmupSteps);
            const cosineEffect = Math.cos(Math.PI * postWarmupProgress / 2);
            progress = 0.35 + (1 - cosineEffect) * 0.6;
            noise = 0.04 * Math.random() * cosineEffect;
          }
          
          point.cosine_loss = initialLoss * Math.exp(-progress * 3.8) + 
                              optimalLoss * 0.9 + 
                              noise;
        }
      });
      
      // Add random noise to all losses
      Object.keys(point).forEach(key => {
        if (key.includes('loss') && point[key] !== null) {
          const noise = (Math.random() - 0.5) * noiseLevel;
          point[key] += noise;
        }
      });
      
      newLossData.push(point);
    }
    
    console.log("Generated loss data:", newLossData.slice(0, 3));
    setLossData(newLossData);
  }, [lrData, activeSchedules, totalSteps, warmupPct, initialLoss, optimalLoss, noiseLevel]);

  return (
    <div style={{padding: "16px", width: "100%", maxWidth: "900px", margin: "0 auto", backgroundColor: "#f9fafb", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.12)"}}>
      <h1 style={{fontSize: "1.25rem", fontWeight: "bold", marginBottom: "16px", textAlign: "center"}}>Learning Rate and Loss Visualizer</h1>
      
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "16px"}}>
        <div>
          <label style={{display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px"}}>Total Epochs: {totalEpochs}</label>
          <input 
            type="range" 
            min="1" max="20" step="1" 
            value={totalEpochs} 
            onChange={(e) => setTotalEpochs(parseInt(e.target.value))} 
            style={{width: "100%"}}
          />
        </div>
        
        <div>
          <label style={{display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px"}}>Max Learning Rate: {maxLR.toExponential(4)}</label>
          <input 
            type="range" 
            min="0.0001" max="0.01" step="0.0001" 
            value={maxLR} 
            onChange={(e) => setMaxLR(parseFloat(e.target.value))} 
            style={{width: "100%"}}
          />
        </div>
        
        <div>
          <label style={{display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px"}}>Warm-up Percentage: {(warmupPct * 100).toFixed(0)}%</label>
          <input 
            type="range" 
            min="0" max="0.5" step="0.01" 
            value={warmupPct} 
            onChange={(e) => setWarmupPct(parseFloat(e.target.value))} 
            style={{width: "100%"}}
          />
        </div>
        
        <div>
          <label style={{display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "4px"}}>Initial Learning Rate: {initialLR.toExponential(4)}</label>
          <input 
            type="range" 
            min="0.00001" max="0.001" step="0.00001" 
            value={initialLR} 
            onChange={(e) => setInitialLR(parseFloat(e.target.value))} 
            style={{width: "100%"}}
          />
        </div>
      </div>
      
      <div style={{marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center"}}>
        {Object.entries(SCHEDULE_COLORS).map(([schedule, color]) => (
          <button 
            key={schedule}
            onClick={() => toggleSchedule(schedule)}
            style={{ 
              padding: "4px 12px", 
              borderRadius: "4px", 
              fontSize: "0.75rem",
              border: "1px solid",
              borderColor: activeSchedules.includes(schedule) ? color : "#e5e7eb",
              backgroundColor: activeSchedules.includes(schedule) ? `${color}20` : "transparent",
              color: activeSchedules.includes(schedule) ? "inherit" : "#9ca3af",
              fontWeight: activeSchedules.includes(schedule) ? "500" : "normal",
              cursor: "pointer"
            }}
          >
            <span style={{display: "inline-block", width: "12px", height: "12px", marginRight: "4px", borderRadius: "50%", backgroundColor: color}}></span>
            {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
          </button>
        ))}
      </div>
      
      <div style={{width: "100%", backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "16px"}}>
        <h2 style={{fontSize: "1.125rem", fontWeight: "500", marginBottom: "8px"}}>Learning Rate Schedules</h2>
        
        <div id="chart-container" style={{ width: '100%', height: `${chartHeight}px`, position: 'relative', margin: "0 auto" }}>
          {lrData.length > 0 ? (
            <LineChart
              width={chartWidth}
              height={chartHeight}
              data={lrData}
              margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="step"
                type="number"
                domain={[0, totalSteps]}
                label={{ value: 'Training Steps', position: 'bottom', offset: 15 }}
              />
              <YAxis 
                tickFormatter={(value) => value.toExponential(1)}
                label={{ value: 'Learning Rate', angle: -90, position: 'insideLeft', offset: -15 }}
              />
              <Tooltip content={<SimpleTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              <ReferenceLine 
                x={Math.floor(totalSteps * warmupPct)} 
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  value: 'Warmup End',
                  position: 'insideBottomRight',
                  fontSize: 10
                }}
              />
              
              {activeSchedules.includes('constant') && (
                <Line
                  type="monotone"
                  dataKey="constant"
                  name="Constant"
                  stroke={SCHEDULE_COLORS.constant}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              
              {activeSchedules.includes('step') && (
                <Line
                  type="monotone"
                  dataKey="step_decay"
                  name="Step Decay"
                  stroke={SCHEDULE_COLORS.step}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              
              {activeSchedules.includes('onecycle') && (
                <Line
                  type="monotone"
                  dataKey="onecycle"
                  name="OneCycle"
                  stroke={SCHEDULE_COLORS.onecycle}
                  strokeWidth={2}
                  dot={false}
                />
              )}
              
              {activeSchedules.includes('cosine') && (
                <Line
                  type="monotone"
                  dataKey="cosine"
                  name="Cosine"
                  stroke={SCHEDULE_COLORS.cosine}
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          ) : (
            <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
              <p style={{color: "#6b7280"}}>Loading chart data...</p>
            </div>
          )}
        </div>
      </div>
      
      <div style={{width: "100%", backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "16px"}}>
        <h2 style={{fontSize: "1.125rem", fontWeight: "500", marginBottom: "8px"}}>Loss Trajectories</h2>
        <p style={{fontSize: "0.875rem", color: "#4b5563", marginBottom: "12px"}}>
          See how different learning rate schedules affect model convergence:
        </p>
        
        <div id="loss-chart-container" style={{ width: '100%', height: `${chartHeight}px`, position: 'relative', margin: "0 auto" }}>
          {lossData.length > 0 ? (
            <LineChart
              width={chartWidth}
              height={chartHeight}
              data={lossData}
              margin={{ top: 20, right: 30, left: 30, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="step"
                type="number"
                domain={[0, totalSteps]}
                label={{ value: 'Training Steps', position: 'bottom', offset: 15 }}
              />
              <YAxis 
                label={{ value: 'Loss', angle: -90, position: 'insideLeft', offset: -15 }}
              />
              <Tooltip content={<SimpleTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              <ReferenceLine 
                x={Math.floor(totalSteps * warmupPct)} 
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  value: 'Warmup End',
                  position: 'insideBottomRight',
                  fontSize: 10
                }}
              />
              
              {activeSchedules.includes('step') && (
                <>
                  <ReferenceLine 
                    x={Math.floor(totalSteps * warmupPct) + Math.floor((totalSteps - Math.floor(totalSteps * warmupPct)) / 3)} 
                    stroke={SCHEDULE_COLORS.step}
                    strokeDasharray="3 3"
                    label={{
                      value: 'LR Drop 1',
                      position: 'insideTopRight',
                      fontSize: 9,
                      fill: SCHEDULE_COLORS.step
                    }}
                  />
                  <ReferenceLine 
                    x={Math.floor(totalSteps * warmupPct) + Math.floor((totalSteps - Math.floor(totalSteps * warmupPct)) * 2 / 3)} 
                    stroke={SCHEDULE_COLORS.step}
                    strokeDasharray="3 3"
                    label={{
                      value: 'LR Drop 2',
                      position: 'insideTopRight',
                      fontSize: 9,
                      fill: SCHEDULE_COLORS.step
                    }}
                  />
                </>
              )}
              
              <ReferenceLine 
                x={Math.floor(totalSteps * 0.6)} 
                stroke="#64748b"
                strokeDasharray="2 4"
                label={{
                  value: 'Fine-tuning Phase',
                  position: 'insideTopLeft',
                  fontSize: 10
                }}
              />
              
              {/* Loss curves */}
              {activeSchedules.includes('constant') && (
                <Line
                  type="monotone"
                  dataKey="constant_loss"
                  name="Constant Loss"
                  stroke={SCHEDULE_COLORS.constant}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
              )}
              
              {activeSchedules.includes('step') && (
                <Line
                  type="monotone"
                  dataKey="step_loss"
                  name="Step Loss"
                  stroke={SCHEDULE_COLORS.step}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
              )}
              
              {activeSchedules.includes('onecycle') && (
                <Line
                  type="monotone"
                  dataKey="onecycle_loss"
                  name="OneCycle Loss"
                  stroke={SCHEDULE_COLORS.onecycle}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
              )}
              
              {activeSchedules.includes('cosine') && (
                <Line
                  type="monotone"
                  dataKey="cosine_loss"
                  name="Cosine Loss"
                  stroke={SCHEDULE_COLORS.cosine}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
              )}
              
              {/* Reference lines for descriptions */}
              {activeSchedules.includes('constant') && (
                <ReferenceLine 
                  y={optimalLoss * 1.5}
                  stroke={SCHEDULE_COLORS.constant}
                  strokeDasharray="2 4"
                  label={{
                    value: 'Constant: Oscillations',
                    position: 'insideBottomRight',
                    fontSize: 9,
                    fill: SCHEDULE_COLORS.constant
                  }}
                />
              )}
              
              {activeSchedules.includes('step') && (
                <ReferenceLine 
                  y={optimalLoss * 1.1}
                  stroke={SCHEDULE_COLORS.step}
                  strokeDasharray="2 4" 
                  label={{
                    value: 'Step: Plateaus & jumps',
                    position: 'right',
                    fontSize: 9,
                    fill: SCHEDULE_COLORS.step
                  }}
                />
              )}
              
              {activeSchedules.includes('onecycle') && (
                <ReferenceLine 
                  y={optimalLoss * 1.05}
                  stroke={SCHEDULE_COLORS.onecycle}
                  strokeDasharray="2 4"
                  label={{
                    value: 'OneCycle: Balanced',
                    position: 'right',
                    fontSize: 9,
                    fill: SCHEDULE_COLORS.onecycle
                  }}
                />
              )}
              
              {activeSchedules.includes('cosine') && (
                <ReferenceLine 
                  y={optimalLoss * 0.9}
                  stroke={SCHEDULE_COLORS.cosine}
                  strokeDasharray="2 4"
                  label={{
                    value: 'Cosine: Best final loss',
                    position: 'left',
                    fontSize: 9,
                    fill: SCHEDULE_COLORS.cosine
                  }}
                />
              )}
            </LineChart>
          ) : (
            <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
              <p style={{color: "#6b7280"}}>Loading chart data...</p>
            </div>
          )}
        </div>
      </div>
      
      <div style={{width: "100%", backgroundColor: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
        <h2 style={{fontSize: "1.125rem", fontWeight: "500", marginBottom: "8px"}}>How Learning Rate Affects Training</h2>
        
        <div style={{display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.875rem"}}>
          <div style={{padding: "12px", backgroundColor: "#F3F4F6", borderRadius: "4px", marginBottom: "8px"}}>
            <h3 style={{fontWeight: "600", marginBottom: "8px"}}>LR Schedule Comparison:</h3>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px"}}>
              <div style={{padding: "8px", borderRadius: "4px", backgroundColor: `${SCHEDULE_COLORS.constant}15`, border: `1px solid ${SCHEDULE_COLORS.constant}30`}}>
                <h4 style={{fontWeight: "500", marginBottom: "4px", color: SCHEDULE_COLORS.constant}}>Constant LR</h4>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Fast initial training</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Simple implementation</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👎 Oscillations near minimum</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👎 Never reaches optimal loss</p>
              </div>
              
              <div style={{padding: "8px", borderRadius: "4px", backgroundColor: `${SCHEDULE_COLORS.step}15`, border: `1px solid ${SCHEDULE_COLORS.step}30`}}>
                <h4 style={{fontWeight: "500", marginBottom: "4px", color: SCHEDULE_COLORS.step}}>Step Decay</h4>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Predictable improvement stages</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Good plateau escape</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👎 Stagnation between drops</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👎 Requires manual scheduling</p>
              </div>
              
              <div style={{padding: "8px", borderRadius: "4px", backgroundColor: `${SCHEDULE_COLORS.onecycle}15`, border: `1px solid ${SCHEDULE_COLORS.onecycle}30`}}>
                <h4 style={{fontWeight: "500", marginBottom: "4px", color: SCHEDULE_COLORS.onecycle}}>OneCycle</h4>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Balanced exploration & refinement</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Good generalization</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Reliable performance</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👎 Slightly slower final convergence</p>
              </div>
              
              <div style={{padding: "8px", borderRadius: "4px", backgroundColor: `${SCHEDULE_COLORS.cosine}15`, border: `1px solid ${SCHEDULE_COLORS.cosine}30`}}>
                <h4 style={{fontWeight: "500", marginBottom: "4px", color: SCHEDULE_COLORS.cosine}}>Cosine Annealing</h4>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Smoothest decay profile</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Best final loss value</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👍 Precision fine-tuning</p>
                <p style={{fontSize: "0.75rem", marginBottom: "4px"}}>👎 Slower mid-training progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LRScheduleVisualizer;
