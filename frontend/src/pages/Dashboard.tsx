import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

interface Sound {
  filename: string;
  prompt: string;
  created_at: string;
}

// Update the helper function to format the filename (for title)
const formatDisplayName = (filename: string): string => {
  // Remove the .wav extension and show just the filename
  return filename.replace('.wav', '');
};

export default function Dashboard() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [playingFile, setPlayingFile] = useState<string | null>(null);
//   const navigate = useNavigate();

  useEffect(() => {
    fetchUserSounds();
  }, []);

  const fetchUserSounds = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/sound/my-sounds', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch sounds');
      
      const data = await response.json();
      setSounds(data.sounds);
    } catch (err) {
      setError('Failed to load sounds');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (filename: string) => {
    try {
      // If the same file is playing, pause it
      if (playingFile === filename && audioElement) {
        audioElement.pause();
        setPlayingFile(null);
        setSelectedSound(null);
        setAudioElement(null);
        return;
      }

      // If a different file is playing, stop it
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/sound/audio/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'audio/wav'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load audio');
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Create and configure new audio element
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setPlayingFile(null);
        setSelectedSound(null);
        setAudioElement(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      // Start playing
      await audio.play();
      
      // Update state
      setSelectedSound(audioUrl);
      setAudioElement(audio);
      setPlayingFile(filename);
    } catch (err) {
      console.error('Error playing sound:', err);
      setError('Failed to play sound');
    }
  };

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        if (selectedSound) {
          URL.revokeObjectURL(selectedSound);
        }
      }
    };
  }, [audioElement, selectedSound]);

  const handleDownload = async (filename: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/sound/audio/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'audio/wav'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to download audio');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading sound:', err);
      setError('Failed to download sound');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '80px auto 0',
    }}>
      <h1>My Sounds</h1>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
      }}>
        {sounds.length === 0 ? (
          <p>No sounds generated yet. Go to the Sound Generator to create some!</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Increased width for better layout
            gap: '20px',
          }}>
            {sounds.map((sound) => (
              <div
                key={sound.filename}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{
                  marginBottom: '10px',
                }}>
                  {/* Display Filename as Title */}
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.1em',
                    fontWeight: 'bold',
                    color: '#333',
                  }}>
                    {formatDisplayName(sound.filename)}
                  </h3>
                  
                  {/* Prompt */}
                  <div style={{
                    fontSize: '0.9em',
                    color: '#666',
                    wordBreak: 'break-word',
                    backgroundColor: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    maxHeight: '80px',
                    overflow: 'auto',
                    lineHeight: '1.4',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}>
                    {sound.prompt || 'No prompt provided'}
                  </div>
                </div>

                {/* Controls */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                }}>
                  <button
                    onClick={() => handlePlay(sound.filename)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: playingFile === sound.filename ? '#dc3545' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{playingFile === sound.filename ? '■' : '▶'}</span>
                    {playingFile === sound.filename ? 'Stop' : 'Play'}
                  </button>
                  <button
                    onClick={() => handleDownload(sound.filename)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>↓</span> Download
                  </button>
                </div>

                {/* Creation Date */}
                {sound.created_at && (
                  <div style={{
                    fontSize: '0.8em',
                    color: '#666',
                    marginTop: '8px',
                    textAlign: 'right',
                  }}>
                    Created: {new Date(sound.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
