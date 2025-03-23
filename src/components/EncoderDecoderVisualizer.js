import React, { useState } from 'react';

const NeuralNetworkVisualizer = () => {
  // Basic styles as objects to ensure they apply without relying on Tailwind
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    },
    heading: {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '24px'
    },
    compareContainer: {
      backgroundColor: '#f1f5f9',
      padding: '24px',
      borderRadius: '8px'
    },
    section: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#3b82f6',
      fontSize: '14px',
      marginBottom: '16px'
    },
    description: {
      fontSize: '12px',
      color: '#4b5563',
      marginTop: '16px'
    },
    keyPoints: {
      marginTop: '32px',
      fontSize: '14px'
    },
    keyPointsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    keyComponentsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginTop: '24px',
      marginBottom: '8px'
    },
    detailsContainer: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    componentTitle: {
      color: '#4f46e5',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    termList: {
      marginTop: '16px'
    },
    term: {
      color: '#ca8a04',
      fontSize: '14px',
      fontWeight: '500'
    },
    definition: {
      marginLeft: '16px',
      marginBottom: '16px'
    },
    // Architecture component styles
    architectureContainer: {
      display: 'flex',
      marginBottom: '24px'
    },
    architectureSimpleContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    flowContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    verticalColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    box: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      textAlign: 'center',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      margin: '0 8px',
      position: 'relative',
      fontSize: '12px',
      fontWeight: '600'
    },
    inputBox: {
      backgroundColor: '#dbeafe',
      width: '80px',
      height: '160px',
    },
    encoderBox: {
      backgroundColor: '#dcfce7',
      width: '96px',
      height: '128px',
      border: '2px solid transparent'
    },
    latentBox: {
      backgroundColor: '#fef9c3',
      width: '64px',
      height: '64px'
    },
    decoderBox: {
      backgroundColor: '#f3e8ff',
      width: '96px',
      height: '128px',
      border: '2px solid transparent'
    },
    outputBox: {
      backgroundColor: '#dbeafe',
      width: '80px',
      height: '160px'
    },
    meanBox: {
      backgroundColor: '#fef9c3',
      width: '48px',
      height: '48px',
      border: '2px solid #22c55e'
    },
    varBox: {
      backgroundColor: '#fef08a',
      width: '48px',
      height: '48px',
      border: '2px solid #22c55e'
    },
    samplingBox: {
      backgroundColor: '#fef9c3',
      width: '64px',
      height: '64px',
      border: '2px solid #22c55e'
    },
    contractingBox: {
      backgroundColor: '#dcfce7',
      width: '96px',
      height: '112px',
      border: '2px solid #6366f1'
    },
    deeperBox: {
      backgroundColor: '#86efac',
      width: '64px',
      height: '80px',
      border: '2px solid #6366f1'
    },
    bottleneckBox: {
      backgroundColor: '#fef9c3',
      width: '48px',
      height: '48px'
    },
    expandingBox: {
      backgroundColor: '#e9d5ff',
      width: '64px',
      height: '80px',
      border: '2px solid #6366f1'
    },
    furtherBox: {
      backgroundColor: '#f3e8ff',
      width: '96px',
      height: '112px',
      border: '2px solid #6366f1'
    },
    arrow: {
      margin: '0 8px',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#6b7280'
    },
    downArrow: {
      margin: '8px 0',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#6b7280'
    },
    skipConnectionsLabel: {
      backgroundColor: '#dbeafe',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '2px solid #3b82f6',
      color: '#1d4ed8',
      fontSize: '12px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: '16px'
    }
  };

  const renderAutoencoder = () => {
    return (
      <div style={styles.flowContainer}>
        <div style={{...styles.box, ...styles.inputBox}}>Input</div>
        <div style={styles.arrow}>→</div>
        <div style={{...styles.box, ...styles.encoderBox}}>Encoder</div>
        <div style={styles.arrow}>→</div>
        <div style={{...styles.box, ...styles.latentBox}}>Latent Space</div>
        <div style={styles.arrow}>→</div>
        <div style={{...styles.box, ...styles.decoderBox}}>Decoder</div>
        <div style={styles.arrow}>→</div>
        <div style={{...styles.box, ...styles.outputBox}}>Output</div>
      </div>
    );
  };

  const renderVAE = () => {
    return (
      <div style={styles.architectureSimpleContainer}>
        {/* First row: Input to Encoder */}
        <div style={styles.flowContainer}>
          <div style={{...styles.box, ...styles.inputBox}}>Input</div>
          <div style={styles.arrow}>→</div>
          <div style={{...styles.box, ...styles.encoderBox}}>Encoder</div>
        </div>
        
        {/* Second row: Down arrow */}
        <div style={styles.downArrow}>↓</div>
        
        {/* Third row: Mean and Variance */}
        <div style={styles.flowContainer}>
          <div style={{...styles.box, ...styles.meanBox}}>μ (Mean)</div>
          <div style={{marginLeft: '16px', marginRight: '16px'}}></div>
          <div style={{...styles.box, ...styles.varBox}}>σ² (Var)</div>
        </div>
        
        {/* Fourth row: Curved arrow (rendered as text for simplicity) */}
        <div style={{margin: '12px 0', fontSize: '20px', color: '#6b7280'}}>⟲</div>
        
        {/* Fifth row: Sampling */}
        <div style={{...styles.box, ...styles.samplingBox, marginBottom: '16px'}}>Sampling</div>
        
        {/* Sixth row: Decoder to Output */}
        <div style={styles.flowContainer}>
          <div style={{...styles.box, ...styles.decoderBox}}>Decoder</div>
          <div style={styles.arrow}>→</div>
          <div style={{...styles.box, ...styles.outputBox}}>Output</div>
        </div>
      </div>
    );
  };

  const renderUNet = () => {
    return (
      <div style={styles.architectureSimpleContainer}>
        {/* Top row: Input to Bottleneck */}
        <div style={styles.flowContainer}>
          <div style={{...styles.box, ...styles.inputBox}}>Input</div>
          <div style={styles.arrow}>→</div>
          <div style={{...styles.box, ...styles.contractingBox}}>Contracting Path</div>
          <div style={styles.arrow}>→</div>
          <div style={{...styles.box, ...styles.deeperBox}}>Deeper Contraction</div>
          <div style={styles.arrow}>→</div>
          <div style={{...styles.box, ...styles.bottleneckBox}}>Bottleneck</div>
        </div>
        
        {/* Skip connections representation (simplified) */}
        <div style={styles.skipConnectionsLabel}>Skip Connections (New in U-Net)</div>
        
        {/* Bottom row: Output back to before bottleneck */}
        <div style={styles.flowContainer}>
          <div style={{...styles.box, ...styles.outputBox}}>Output</div>
          <div style={styles.arrow}>←</div>
          <div style={{...styles.box, ...styles.furtherBox}}>Further Expansion</div>
          <div style={styles.arrow}>←</div>
          <div style={{...styles.box, ...styles.expandingBox}}>Expanding Path</div>
          <div style={styles.arrow}>←</div>
          <div style={{opacity: 0, width: '48px'}}></div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Neural Network Architecture Comparison</h1>
      
      <div style={styles.compareContainer}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Autoencoder (Base Architecture)</h3>
          <div>{renderAutoencoder()}</div>
          <p style={styles.description}>Basic autoencoder: Encodes input to a compressed representation, then decodes it back.</p>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Variational Autoencoder (VAE)</h3>
          <p style={styles.subtitle}>Modified by replacing the latent vector with a probabilistic distribution</p>
          <div>{renderVAE()}</div>
          <p style={styles.description}>Difference from autoencoder: Encodes to distribution parameters (mean & variance) instead of fixed vector, enables sampling for generation.</p>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>U-Net</h3>
          <p style={styles.subtitle}>Modified by splitting encoder/decoder and adding skip connections</p>
          <div>{renderUNet()}</div>
          <p style={styles.description}>Difference from autoencoder: Splits encoder/decoder into multiple stages and adds skip connections to preserve spatial information.</p>
        </div>
      </div>
      
      <div style={styles.keyPoints}>
        <h2 style={styles.keyPointsTitle}>Key Points:</h2>
        <ul style={{paddingLeft: '20px'}}>
          <li><span style={{fontWeight: '600'}}>Autoencoder</span>: Basic encoder-bottleneck-decoder structure</li>
          <li><span style={{fontWeight: '600'}}>VAE</span>: Adds probabilistic sampling through mean and variance parameters</li>
          <li><span style={{fontWeight: '600'}}>U-Net</span>: Adds skip connections between corresponding encoder and decoder layers</li>
        </ul>
        
        <h2 style={styles.keyComponentsTitle}>Key Component Differences:</h2>
        <div style={styles.detailsContainer}>
          <h3 style={styles.componentTitle}>Latent Space vs Distribution vs Bottleneck</h3>
          <div style={styles.termList}>
            <div style={styles.term}>Latent Space (Autoencoder)</div>
            <div style={styles.definition}>A fixed, deterministic compressed representation of the input. Each input maps to exactly one point in the latent space.</div>
            
            <div style={styles.term}>Mean & Variance (VAE)</div>
            <div style={styles.definition}>Instead of encoding to a fixed vector, VAEs encode to parameters of a probability distribution (usually Gaussian). This creates a <em>distribution</em> over the latent space rather than a single point.</div>
            
            <div style={styles.term}>Sampling (VAE)</div>
            <div style={styles.definition}>The VAE randomly samples from the probability distribution to generate a latent vector. This enables the generative capability: different samples give different outputs even for the same input.</div>
            
            <div style={styles.term}>Bottleneck (U-Net)</div>
            <div style={styles.definition}>Similar to the latent space but usually preserves spatial structure. The bottleneck in U-Net is the most compressed representation but typically retains spatial dimensions, unlike the flattened vector in standard autoencoders.</div>
          </div>
          
          <h3 style={styles.componentTitle}>Skip Connections (U-Net)</h3>
          <p>Direct paths that allow information to flow from encoder to decoder layers at the same level. They help preserve fine spatial details that would otherwise be lost during compression, making U-Net excellent for tasks requiring precise localization (like image segmentation).</p>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetworkVisualizer;
