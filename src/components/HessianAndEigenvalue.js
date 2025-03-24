import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import * as THREE from 'three';

const HessianEigenvalueVisualizer = () => {
  // State for parameters
  const [parameters, setParameters] = useState({
    a: 1,
    b: -1,
    c: 0
  });
  
  // State for visualization
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hessian, setHessian] = useState(null);
  const [eigenvalues, setEigenvalues] = useState(null);
  const [criticalPoints, setCriticalPoints] = useState([]);
  
  // State for camera controls
  const [cameraDistance, setCameraDistance] = useState(4);
  const [cameraRotation, setCameraRotation] = useState(0);
  const [cameraHeight, setCameraHeight] = useState(3);
  
  // Three.js references
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Saddle function definition
  const functionExpression = '(a * x^2) - (b * y^2) + c';
  const functionGradient = {
    x: '2 * a * x',
    y: '-2 * b * y'
  };
  const functionHessian = [
    ['2 * a', '0'],
    ['0', '-2 * b']
  ];
  
  // Camera control handlers
  const handleZoomIn = () => {
    setCameraDistance(prev => Math.max(2, prev - 0.5));
  };
  
  const handleZoomOut = () => {
    setCameraDistance(prev => Math.min(8, prev + 0.5));
  };
  
  const handleRotateLeft = () => {
    setCameraRotation(prev => prev - 0.2);
  };
  
  const handleRotateRight = () => {
    setCameraRotation(prev => prev + 0.2);
  };
  
  const handleMoveUp = () => {
    setCameraHeight(prev => Math.min(6, prev + 0.5));
  };
  
  const handleMoveDown = () => {
    setCameraHeight(prev => Math.max(1, prev - 0.5));
  };
  
  // Find critical points (where gradient is zero)
  const findCriticalPoints = () => {
    // For saddle function, critical point is at origin
    const critPoint = { x: 0, y: 0, type: determinePointType([0, 0]) };
    setCriticalPoints([critPoint]);
    return [critPoint];
  };
  
  // Determine the type of critical point based on eigenvalues
  const determinePointType = (point) => {
    const [x, y] = point;
    const h = calculateHessian(x, y);
    const eigs = calculateEigenvalues(h);
    
    if (eigs.every(val => val > 0)) {
      return 'minimum';
    } else if (eigs.every(val => val < 0)) {
      return 'maximum';
    } else {
      return 'saddle';
    }
  };
  
  // Calculate Hessian matrix at a given point
  const calculateHessian = (x, y) => {
    const scope = {
      x,
      y,
      ...parameters
    };
    
    const hessianMatrix = functionHessian.map(row => 
      row.map(element => math.evaluate(element, scope))
    );
    
    return hessianMatrix;
  };
  
  // Calculate eigenvalues of a 2x2 matrix
  const calculateEigenvalues = (matrix) => {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    
    const trace = a + d;
    const determinant = a * d - b * c;
    
    const discriminant = Math.sqrt(trace * trace - 4 * determinant);
    const eig1 = (trace + discriminant) / 2;
    const eig2 = (trace - discriminant) / 2;
    
    return [eig1, eig2];
  };
  
  // Calculate eigenvectors of a 2x2 matrix
  const calculateEigenvectors = (matrix, eigenvalues) => {
    const eigenvectors = [];
    
    for (let i = 0; i < eigenvalues.length; i++) {
      const lambda = eigenvalues[i];
      
      const a = matrix[0][0];
      const b = matrix[0][1];
      const c = matrix[1][0];
      const d = matrix[1][1];
      
      let eigenvector;
      
      if (Math.abs(b) > 1e-10) {
        eigenvector = [b, lambda - a];
      } else if (Math.abs(c) > 1e-10) {
        eigenvector = [lambda - d, c];
      } else {
        eigenvector = i === 0 ? [1, 0] : [0, 1];
      }
      
      // Normalize the eigenvector
      const length = Math.sqrt(eigenvector[0]*eigenvector[0] + eigenvector[1]*eigenvector[1]);
      eigenvector = [eigenvector[0]/length, eigenvector[1]/length];
      
      eigenvectors.push(eigenvector);
    }
    
    return eigenvectors;
  };
  
  // Handle point selection
  const handlePointSelect = (point) => {
    setSelectedPoint(point);
    
    const h = calculateHessian(point.x, point.y);
    setHessian(h);
    
    const eigs = calculateEigenvalues(h);
    setEigenvalues(eigs);
  };
  
  // Helper function to create text labels for eigenvalues
  const createTextLabel = (text, x, y, z, color) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 50;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '24px Arial';
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(0.8, 0.4, 1);
    
    return sprite;
  };
  
  // Create function surface
  const createFunctionSurface = () => {
    if (!sceneRef.current) return;
    
    // Remove existing surface if any
    const existingSurface = sceneRef.current.getObjectByName('functionSurface');
    if (existingSurface) {
      sceneRef.current.remove(existingSurface);
    }
    
    // Clean up any previous critical point objects
    const objects = sceneRef.current.children.slice();
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj.userData && obj.userData.isCriticalPoint) {
        sceneRef.current.remove(obj);
      }
    }
    
    // Create new surface
    const resolution = 40;
    const size = 4; // -2 to 2
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const indices = [];
    
    // Generate surface points
    let minZ = Infinity;
    let maxZ = -Infinity;
    
    // First pass: calculate min/max Z for color scaling
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = (i / resolution) * size - size / 2;
        const y = (j / resolution) * size - size / 2;
        
        const scope = { x, y, ...parameters };
        const z = math.evaluate(functionExpression, scope);
        
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
    }
    
    // Second pass: create vertices and colors
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = (i / resolution) * size - size / 2;
        const y = (j / resolution) * size - size / 2;
        
        const scope = { x, y, ...parameters };
        const z = math.evaluate(functionExpression, scope);
        
        // Add position
        positions.push(x, z, y); // Note: in Three.js, y is up
        
        // Add color based on height
        const t = (z - minZ) / (maxZ - minZ || 1);
        const r = t; // Red increases with height
        const g = 0.2; // Fixed green
        const b = 1 - t; // Blue decreases with height
        
        colors.push(r, g, b);
        
        // Add indices for triangles
        if (i < resolution && j < resolution) {
          const a = i * (resolution + 1) + j;
          const b = i * (resolution + 1) + (j + 1);
          const c = (i + 1) * (resolution + 1) + j;
          const d = (i + 1) * (resolution + 1) + (j + 1);
          
          // Triangle 1
          indices.push(a, b, c);
          
          // Triangle 2
          indices.push(c, b, d);
        }
      }
    }
    
    // Set attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    
    // Calculate normals for proper lighting
    geometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 30
    });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'functionSurface';
    
    // Add critical points with Hessian direction indicators
    const critPoints = findCriticalPoints();
    critPoints.forEach(point => {
      const scope = { x: point.x, y: point.y, ...parameters };
      const z = math.evaluate(functionExpression, scope);
      
      // Choose color based on point type
      let color;
      if (point.type === 'minimum') color = 0x00ff00; // Green
      else if (point.type === 'maximum') color = 0xff0000; // Red
      else color = 0xffff00; // Yellow (saddle)
      
      // Create sphere for critical point
      const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      // Position sphere
      sphere.position.set(point.x, z, point.y);
      
      // Mark as critical point for cleanup
      sphere.userData = { 
        isCriticalPoint: true,
        point: { x: point.x, y: point.y, z, type: point.type } 
      };
      
      // Add sphere to scene directly for raycasting
      sceneRef.current.add(sphere);
      
      // Calculate Hessian and eigenvalues for this point
      const hessian = calculateHessian(point.x, point.y);
      const eigenvalues = calculateEigenvalues(hessian);
      
      // Calculate eigenvectors (for 2x2 matrix)
      const eigenvectors = calculateEigenvectors(hessian, eigenvalues);
      
      // Add arrow indicators for eigenvectors/Hessian directions
      for (let i = 0; i < eigenvectors.length; i++) {
        const eigenvector = eigenvectors[i];
        const eigenvalue = eigenvalues[i];
        
        // Normalize and scale eigenvector
        const length = Math.sqrt(eigenvector[0]*eigenvector[0] + eigenvector[1]*eigenvector[1]);
        const normalizedVector = [eigenvector[0]/length, eigenvector[1]/length];
        
        // Scale factor for arrows - make them much larger
        const scale = 1.5;
        
        // Direction determines arrow color - use blue/orange to distinguish from critical point colors
        // Using more saturated colors for better visibility
        const arrowColor = eigenvalue > 0 ? 0x00aaff : 0xff9900;
        
        // Create arrow in 3D space (x,z,y coordinates in Three.js) - make arrows thicker
        const arrowHelper = new THREE.ArrowHelper(
          new THREE.Vector3(normalizedVector[0], 0, normalizedVector[1]),
          new THREE.Vector3(point.x, z + 0.2, point.y), // Start slightly above the surface
          scale,
          arrowColor,
          0.5, // Head length - much larger
          0.25  // Head width - much larger
        );
        
        // Add a label for the eigenvalue
        const arrowLabel = createTextLabel(
          eigenvalue.toFixed(2),
          point.x + normalizedVector[0] * (scale + 0.2),
          z + 0.4,
          point.y + normalizedVector[1] * (scale + 0.2),
          arrowColor
        );
        
        // Mark as critical point components for cleanup
        arrowHelper.userData = { isCriticalPoint: true };
        arrowLabel.userData = { isCriticalPoint: true };
        
        // Add arrows to scene directly
        sceneRef.current.add(arrowHelper);
        sceneRef.current.add(arrowLabel);
      }
    });
    
    // Add to scene
    sceneRef.current.add(mesh);
  };
  
  // Initialize and clean up Three.js
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Initialize camera
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    
    // Update camera based on state
    const updateCamera = () => {
      if (!cameraRef.current) return;
      
      cameraRef.current.position.x = Math.sin(cameraRotation) * cameraDistance;
      cameraRef.current.position.z = Math.cos(cameraRotation) * cameraDistance;
      cameraRef.current.position.y = cameraHeight;
      cameraRef.current.lookAt(0, 0, 0);
    };
    
    updateCamera();
    
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    
    // Clear container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add coordinate axes for reference
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);
    
    // Add axis labels
    const addAxisLabel = (text, position, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 32;
      
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 24px Arial';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(...position);
      sprite.scale.set(0.5, 0.25, 1);
      
      scene.add(sprite);
    };
    
    // Add axis labels
    addAxisLabel('X', [2.2, 0, 0], '#ff0000');
    addAxisLabel('Y', [0, 0, 2.2], '#0000ff');
    addAxisLabel('Z', [0, 2.2, 0], '#00aa00');
    
    // Create and add surface
    createFunctionSurface();
    
    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(animate);
      updateCamera();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Clear container
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [cameraDistance, cameraRotation, cameraHeight]);
  
  // Update function visualization when parameters change
  useEffect(() => {
    if (sceneRef.current) {
      createFunctionSurface();
    }
  }, [parameters]);
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hessian Matrix & Eigenvalue Visualization</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">3D Saddle Function Visualization</h2>
          <div className="mb-4 text-sm">
            <p>Function: f(x, y) = {functionExpression.replace(/\*/g, '·')}</p>
            <p className="mt-2">
              <span className="font-medium">Critical Points:</span>
              <span className="ml-2 p-1 bg-green-500 text-white rounded">Minimum</span>
              <span className="ml-2 p-1 bg-red-500 text-white rounded">Maximum</span>
              <span className="ml-2 p-1 bg-yellow-500 text-white rounded">Saddle</span>
            </p>
            <p className="mt-1">
              <span className="font-medium">Arrows:</span>
              <span className="ml-2 p-1 bg-blue-500 text-white rounded">Positive eigenvalue</span>
              <span className="ml-2 p-1 bg-orange-500 text-white rounded">Negative eigenvalue</span>
            </p>
          </div>
          
          <div className="flex justify-center space-x-4 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium mb-1">Zoom</span>
              <div className="flex flex-col space-y-2">
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleZoomIn}
                >
                  Zoom In
                </button>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleZoomOut}
                >
                  Zoom Out
                </button>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium mb-1">Rotate</span>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleRotateLeft}
                  >
                    ←
                  </button>
                  <button 
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleRotateRight}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium mb-1">Height</span>
              <div className="flex flex-col space-y-2">
                <button 
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  onClick={handleMoveUp}
                >
                  Up
                </button>
                <button 
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  onClick={handleMoveDown}
                >
                  Down
                </button>
              </div>
            </div>
          </div>
          
          <div 
            ref={containerRef} 
            className="w-full h-64 md:h-96 border border-gray-300"
            style={{ minHeight: "300px" }}
          ></div>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Parameters</h2>
          
          <div className="mt-4 p-3 border border-blue-300 rounded-lg">
            <h3 className="font-medium mb-2 text-center">Fine-Tuning Controls</h3>
            
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Parameter a:</label>
                <input
                  type="number"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={parameters.a}
                  onChange={(e) => setParameters({...parameters, a: parseFloat(e.target.value)})}
                  className="w-20 p-1 border rounded text-right"
                />
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={parameters.a}
                onChange={(e) => setParameters({...parameters, a: parseFloat(e.target.value)})}
                className="w-full mt-1"
              />
              <p className="text-xs mt-1 text-gray-600">Controls curvature in x-direction. Positive values create upward curvature.</p>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Parameter b:</label>
                <input
                  type="number"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={parameters.b}
                  onChange={(e) => setParameters({...parameters, b: parseFloat(e.target.value)})}
                  className="w-20 p-1 border rounded text-right"
                />
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={parameters.b}
                onChange={(e) => setParameters({...parameters, b: parseFloat(e.target.value)})}
                className="w-full mt-1"
              />
              <p className="text-xs mt-1 text-gray-600">Controls curvature in y-direction. Negative values create downward curvature.</p>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Parameter c:</label>
                <input
                  type="number"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={parameters.c}
                  onChange={(e) => setParameters({...parameters, c: parseFloat(e.target.value)})}
                  className="w-20 p-1 border rounded text-right"
                />
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.1"
                value={parameters.c}
                onChange={(e) => setParameters({...parameters, c: parseFloat(e.target.value)})}
                className="w-full mt-1"
              />
              <p className="text-xs mt-1 text-gray-600">Vertical shift of the function (constant term).</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() => setParameters({ a: 1, b: -1, c: 0 })}
              >
                Perfect Saddle
              </button>
              <button
                className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() => setParameters({ a: 2, b: -0.5, c: 0 })}
              >
                Stretched Saddle
              </button>
              <button
                className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() => setParameters({ a: 1, b: 1, c: 0 })}
              >
                Bowl (Minimum)
              </button>
              <button
                className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                onClick={() => setParameters({ a: -1, b: -1, c: 0 })}
              >
                Hill (Maximum)
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Hessian & Eigenvalues: Physical Meaning</h3>
            <p className="text-sm mb-2">
              The <strong>Hessian matrix</strong> contains the second-order partial derivatives that measure the function's curvature in different directions.
            </p>
            <p className="text-sm mb-2">
              <strong>Eigenvalues</strong> represent the principal curvatures of the function at a point, regardless of coordinate system:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1 mb-2">
              <li><span className="text-blue-600 font-medium">Positive eigenvalue</span>: Upward curvature (valley/bowl shape)</li>
              <li><span className="text-orange-600 font-medium">Negative eigenvalue</span>: Downward curvature (hill/dome shape)</li>
              <li><span className="text-gray-600 font-medium">Zero eigenvalue</span>: Flat direction (no curvature)</li>
            </ul>
            <p className="text-sm">
              At a <strong>saddle point</strong>, eigenvalues have opposite signs, creating a surface that curves upward in some directions and downward in others - like a saddle or mountain pass.
            </p>
          </div>
        </div>
      </div>
      
      {selectedPoint && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Point Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-md font-medium mb-1">Selected Point:</h3>
              <p>x: {selectedPoint.x.toFixed(2)}, y: {selectedPoint.y.toFixed(2)}, z: {selectedPoint.z.toFixed(2)}</p>
            </div>
            
            {hessian && (
              <div>
                <h3 className="text-md font-medium mb-1">Hessian Matrix:</h3>
                <div className="flex justify-center items-center">
                  <div className="border-2 border-gray-400 px-4 py-2">
                    <div className="flex">
                      <div className="w-16 text-center">{hessian[0][0].toFixed(2)}</div>
                      <div className="w-16 text-center">{hessian[0][1].toFixed(2)}</div>
                    </div>
                    <div className="flex">
                      <div className="w-16 text-center">{hessian[1][0].toFixed(2)}</div>
                      <div className="w-16 text-center">{hessian[1][1].toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {eigenvalues && (
              <div>
                <h3 className="text-md font-medium mb-1">Eigenvalues:</h3>
                <p>λ₁: {eigenvalues[0].toFixed(2)}, λ₂: {eigenvalues[1].toFixed(2)}</p>
                
                <h3 className="text-md font-medium mt-2 mb-1">Critical Point Type:</h3>
                {eigenvalues[0] > 0 && eigenvalues[1] > 0 && (
                  <p className="text-green-600 font-medium">Minimum (Both eigenvalues positive)</p>
                )}
                {eigenvalues[0] < 0 && eigenvalues[1] < 0 && (
                  <p className="text-red-600 font-medium">Maximum (Both eigenvalues negative)</p>
                )}
                {eigenvalues[0] * eigenvalues[1] < 0 && (
                  <p className="text-yellow-600 font-medium">Saddle Point (Eigenvalues have opposite signs)</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Understanding the Visualization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="mb-2 text-center font-medium text-blue-600">Positive Eigenvalue</div>
            <div className="bg-blue-50 h-24 rounded-lg flex items-center justify-center mb-2">
              <svg width="100" height="80" viewBox="0 0 100 80">
                <path d="M 10 40 Q 50 70 90 40" stroke="#0088ff" fill="none" strokeWidth="3" />
                <text x="35" y="25" fill="#0088ff" fontSize="12">Upward curve</text>
              </svg>
            </div>
            <p className="text-sm">The function curves <strong>upward</strong> in this direction (shown by blue arrows), creating a valley-like shape where the function increases as you move away from the critical point.</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="mb-2 text-center font-medium text-orange-600">Negative Eigenvalue</div>
            <div className="bg-orange-50 h-24 rounded-lg flex items-center justify-center mb-2">
              <svg width="100" height="80" viewBox="0 0 100 80">
                <path d="M 10 40 Q 50 10 90 40" stroke="#ff8800" fill="none" strokeWidth="3" />
                <text x="35" y="55" fill="#ff8800" fontSize="12">Downward curve</text>
              </svg>
            </div>
            <p className="text-sm">The function curves <strong>downward</strong> in this direction (shown by orange arrows), creating a hill-like shape where the function decreases as you move away from the critical point.</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="mb-2 text-center font-medium text-yellow-600">Saddle Point</div>
            <div className="bg-yellow-50 h-24 rounded-lg flex items-center justify-center mb-2">
              <svg width="100" height="80" viewBox="0 0 100 80">
                <path d="M 10 40 Q 50 10 90 40" stroke="#ff8800" fill="none" strokeWidth="3" transform="rotate(90 50 40)" />
                <path d="M 10 40 Q 50 70 90 40" stroke="#0088ff" fill="none" strokeWidth="3" />
                <circle cx="50" cy="40" r="4" fill="#ffcc00" />
              </svg>
            </div>
            <p className="text-sm">A saddle point occurs when the Hessian has <strong>eigenvalues with opposite signs</strong> - the function curves upward in some directions and downward in others, creating a saddle-like shape.</p>
          </div>
        </div>
        
        <div className="mt-4 bg-purple-50 p-3 rounded-lg">
          <h3 className="text-md font-medium mb-1">The Hessian Matrix in a Nutshell</h3>
          <p>The Hessian matrix at a point contains the second derivatives that describe how the function <strong>curves</strong> in different directions. The eigenvalues of this matrix determine whether a critical point is a minimum, maximum, or saddle point, regardless of which coordinate system we use.</p>
        </div>
      </div>
    </div>
  );
};

export default HessianEigenvalueVisualizer;
