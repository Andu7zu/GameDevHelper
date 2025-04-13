import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/auth';

interface GenerateRequest {
  prompt: string;
  filename: string;
  num_of_steps: number;
  duration: number;
}

export default function SoundGenerator() {
  const [prompt, setPrompt] = useState('');
  const [filename, setFilename] = useState('');
  const [numSteps, setNumSteps] = useState(200);
  const [duration, setDuration] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any | null>(null);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);

  // Fetch and create audio blob when response changes
  useEffect(() => {
    const fetchAudio = async () => {
      if (response?.filename) {
        try {
          const audioResponse = await fetchWithAuth(
            `http://localhost:5000/sound/audio/${response.filename}`,
            {
              headers: {
                'Accept': 'audio/wav',
              },
            }
          );
          
          if (!audioResponse.ok) {
            throw new Error(`Failed to load audio: ${audioResponse.statusText}`);
          }
          
          const blob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(blob);
          setAudioBlob(audioUrl);
        } catch (err) {
          console.error('Error loading audio:', err);
          setError('Failed to load audio file');
        }
      }
    };

    fetchAudio();
    
    // Cleanup function to revoke object URL
    return () => {
      if (audioBlob) {
        URL.revokeObjectURL(audioBlob);
      }
    };
  }, [response]);

  const handleGenerateSound = async () => {
    // Reset error state
    setError(null);

    // Validate required fields
    const errors = [];
    if (!prompt.trim()) errors.push('Prompt is required');
    if (!filename.trim()) errors.push('Filename is required');

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setIsLoading(true);

    try {
      const requestData: GenerateRequest = {
        prompt,
        filename,
        num_of_steps: numSteps,
        duration
      };

      const response = await fetchWithAuth('http://localhost:5000/sound/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate sound');
      }

      const data = await response.json();
      setResponse({ ...data, audioUrl: `http://localhost:5000/sound/audio/${data.filename}` });
    } catch (err) {
      if (err instanceof Error && !err.message.includes('Authentication failed')) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: '#343a40',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',  // Increased from 800px to 1200px
        margin: '40px auto',
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          marginBottom: '30px',
          color: 'white',
          fontWeight: '300',
          textAlign: 'center',
        }}>Sound Generator</h1>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: '#495057',
          padding: 'clamp(24px, 4vw, 48px)',  // Slightly increased padding
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Prompt Input */}
          <div style={{ width: '100%' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              color: 'white',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            }}>
              Prompt <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your sound prompt here..."
              required
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${!prompt.trim() && error ? '#ff6b6b' : '#6c757d'}`,
                backgroundColor: '#343a40',
                color: 'white',
                minHeight: '150px',
                width: '100%',
                fontSize: 'clamp(14px, 2vw, 16px)',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filename Input */}
          <div style={{ width: '100%' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              color: 'white',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            }}>
              Filename <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename (without extension)"
              required
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${!filename.trim() && error ? '#ff6b6b' : '#6c757d'}`,
                backgroundColor: '#343a40',
                color: 'white',
                width: '100%',
                fontSize: 'clamp(14px, 2vw, 16px)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Parameters Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Increased from 250px
            gap: '24px',
            width: '100%',
          }}>
            {/* Number of Steps */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                color: 'white',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              }}>
                Number of Steps
              </label>
              <select
                value={numSteps}
                onChange={(e) => setNumSteps(Number(e.target.value))}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #6c757d',
                  backgroundColor: '#343a40',
                  color: 'white',
                  width: '100%',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  cursor: 'pointer',
                }}
              >
                {[200, 250, 300, 350, 400, 500].map(steps => (
                  <option key={steps} value={steps}>{steps}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                color: 'white',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              }}>
                Duration (seconds)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #6c757d',
                  backgroundColor: '#343a40',
                  color: 'white',
                  width: '100%',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  cursor: 'pointer',
                }}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(seconds => (
                  <option key={seconds} value={seconds}>{seconds}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateSound}
            disabled={isLoading}
            style={{
              padding: '16px 32px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: '500',
              marginTop: '20px',
              alignSelf: 'center',
              minWidth: 'min(400px, 60%)',  // Adjusted for wider container
              transition: 'background-color 0.2s',
            }}
          >
            {isLoading ? 'Generating...' : 'Generate Sound'}
          </button>

          {/* Error and Success messages with same styling updates */}
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              color: '#ff6b6b',
              borderRadius: '8px',
              border: '1px solid #ff6b6b',
              fontSize: 'clamp(14px, 2vw, 16px)',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              {error}
            </div>
          )}

          {response && audioBlob && (
            <div style={{
              padding: '24px',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderRadius: '8px',
              border: '1px solid #28a745',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <p style={{ 
                color: '#28a745', 
                marginBottom: '16px',
                fontSize: 'clamp(14px, 2vw, 16px)', 
              }}>
                Sound generated successfully!
              </p>
              <audio 
                controls 
                style={{ 
                  width: '100%',
                  height: '40px'  // Added fixed height for better appearance
                }}
                key={audioBlob}
              >
                <source src={audioBlob} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
