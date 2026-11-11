import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThreeShowcase from './components/ThreeShowcase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const roomOptions = ['bedroom', 'living room', 'kitchen', 'bathroom', 'dining room'];
const styleOptions = ['Modern', 'Minimalist', 'Scandinavian', 'Industrial', 'Traditional', 'Contemporary'];

const CompareSlider = ({ before, after }) => {
  const [position, setPosition] = useState(50);

  return (
    <div className="compare-box">
      <div className="compare-base">
        <img src={before} alt="Before redesign" />
      </div>
      <div className="compare-overlay" style={{ width: `${position}%` }}>
        <img src={after} alt="After redesign" />
      </div>
      <input
        className="compare-range"
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [resultImage, setResultImage] = useState('');
  const [designText, setDesignText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [roomType, setRoomType] = useState('bedroom');
  const [style, setStyle] = useState('Modern');
  const [backgroundColor, setBackgroundColor] = useState('#F5F1EB');
  const [foregroundColor, setForegroundColor] = useState('#1F2937');
  const [instructions, setInstructions] = useState('Keep it airy and cozy, with layered lighting and balanced storage.');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready for a new room concept.');

  const stats = useMemo(
    () => [
      { label: 'Room analysis', value: analysis ? 'Ready' : 'Pending' },
      { label: 'Furniture detections', value: analysis?.detections?.length || 0 },
      { label: 'Design style', value: style },
      { label: 'Service mode', value: resultImage ? 'Generated' : 'Fallback' },
    ],
    [analysis, resultImage, style]
  );

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/designs`);
      setHistory(response.data || []);
    } catch (error) {
      console.error('History fetch failed:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const analyzeImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('place_image', file);

    try {
      const response = await axios.post(`${API_BASE}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(response.data);
      setRoomType(response.data.room_category || roomType);
      setStatusMessage(`Analysis complete: ${response.data.room_category}.`);
    } catch (error) {
      console.error('Analyze failed:', error);
      toast.error('Room analysis failed. Please try another image.');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    analyzeImage(file);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error('Please upload a room image first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('place_image', selectedFile);
    formData.append('room_type', roomType);
    formData.append('style', style);
    formData.append('background_color', backgroundColor);
    formData.append('foreground_color', foregroundColor);
    formData.append('instructions', instructions);

    try {
      const response = await axios.post(`${API_BASE}/api/try-on`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const rawImage = response.data.image || previewUrl;
      setResultImage(rawImage);
      setDesignText(response.data.text || response.data.recommendations || 'Recommendations ready.');
      setStatusMessage(response.data.mode === 'fallback' ? 'Fallback mode active: using original image with recommendations.' : 'AI redesign generated successfully.');
      toast.success(response.data.mode === 'fallback' ? 'Fallback mode completed' : 'Redesign generated');
      await fetchHistory();
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Design generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveDesign = async () => {
    if (!designText) return;

    try {
      const payload = {
        room_category: roomType,
        style,
        color_palette: `${backgroundColor} / ${foregroundColor}`,
        furniture_detections: JSON.stringify(analysis?.detections || []),
        recommendations: designText,
        original_image_path: previewUrl || '',
        generated_image_path: resultImage || '',
      };
      await axios.post(`${API_BASE}/api/designs/save`, payload);
      await fetchHistory();
      toast.success('Saved to design history.');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Save failed.');
    }
  };

  const handleUploadDemo = () => {
    const trigger = document.getElementById('room-upload');
    if (trigger) trigger.click();
  };

  return (
    <>
      <ToastContainer />
      <div className={`app-shell ${isDarkMode ? 'dark' : ''}`}>
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-dot">AI</div>
            <div>
              <div className="brand-title">Smart Interior Studio</div>
              <div className="brand-subtitle">AI Room Analysis + Redesign</div>
            </div>
          </div>
          <div className="top-actions">
            <button className="ghost-button" onClick={() => setIsDarkMode((value) => !value)}>
              {isDarkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <button className="primary-button" onClick={handleUploadDemo}>Get started</button>
          </div>
        </header>

        <main className="page-content">
          <section className="hero-panel">
            <div className="hero-copy">
              <span className="eyebrow">Visualize smarter interiors</span>
              <h1>Turn any room into a polished AI-designed space.</h1>
              <p>
                Upload an indoor room photo, detect furniture, choose a style, and generate an interior redesign with
                AI-powered recommendations.
              </p>
              <div className="cta-row">
                <button className="primary-button" onClick={handleUploadDemo}>Upload room</button>
                <button className="ghost-button" onClick={handleGenerate} disabled={loading || !selectedFile}>
                  {loading ? 'Generating...' : 'Generate design'}
                </button>
              </div>
              <div className="status-pill">{statusMessage}</div>
            </div>

            <div className="upload-card">
              <input id="room-upload" type="file" accept="image/*" onChange={handleFileChange} hidden />
              <div className="upload-dropzone" onClick={handleUploadDemo}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Uploaded room" className="uploaded-image" />
                ) : (
                  <>
                    <div className="upload-icon">⬆</div>
                    <strong>Upload room image</strong>
                    <span>Bedroom, living room, kitchen, or studio</span>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="stats-grid">
            {stats.map((item) => (
              <div className="stat-card" key={item.label}>
                <div className="stat-label">{item.label}</div>
                <div className="stat-value">{item.value}</div>
              </div>
            ))}
          </section>

          <section className="workspace-grid">
            <div className="panel">
              <h3>Design workspace</h3>
              <label>
                Room type
                <select value={roomType} onChange={(event) => setRoomType(event.target.value)}>
                  {roomOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Interior style
                <select value={style} onChange={(event) => setStyle(event.target.value)}>
                  {styleOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <div className="color-row">
                <label>
                  Background
                  <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} />
                </label>
                <label>
                  Foreground
                  <input type="color" value={foregroundColor} onChange={(event) => setForegroundColor(event.target.value)} />
                </label>
              </div>

              <label>
                Design notes
                <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={5} />
              </label>

              <button className="primary-button full-width" onClick={handleGenerate} disabled={loading || !selectedFile}>
                {loading ? 'Generating redesign...' : 'Generate design'}
              </button>
            </div>

            <div className="panel">
              <h3>Analysis results</h3>
              {analysis ? (
                <>
                  <div className="analysis-summary">
                    <div>
                      <span>Predicted room</span>
                      <strong>{analysis.room_category}</strong>
                    </div>
                    <div>
                      <span>Confidence</span>
                      <strong>{analysis.confidence}</strong>
                    </div>
                  </div>
                  <div className="detection-list">
                    {analysis.detections?.length ? (
                      analysis.detections.map((item, index) => (
                        <div className="detection-item" key={`${item.class_name}-${index}`}>
                          <span>{item.class_name}</span>
                          <b>{item.confidence}</b>
                        </div>
                      ))
                    ) : (
                      <p>No furniture was detected in this image.</p>
                    )}
                  </div>
                </>
              ) : (
                <p>Upload an image to see room classification and furniture detection.</p>
              )}
            </div>
          </section>

          <section className="results-grid">
            <div className="panel">
              <h3>AI redesign results</h3>
              {previewUrl && (
                <div className="image-stack">
                  {resultImage ? (
                    <CompareSlider before={previewUrl} after={resultImage} />
                  ) : (
                    <img src={previewUrl} alt="Original room" className="result-image" />
                  )}
                </div>
              )}

              {resultImage && (
                <div className="generated-image-wrap">
                  <img src={resultImage} alt="Redesigned room" className="result-image" />
                </div>
              )}
            </div>

            <div className="panel">
              <h3>3D preview</h3>
              {resultImage ? <ThreeShowcase imageUrl={resultImage} width={640} height={420} isDarkMode={isDarkMode} /> : <div className="placeholder-3d">Generate a redesign to preview the concept in 3D.</div>}
            </div>
          </section>

          <section className="recommendation-grid">
            <div className="panel">
              <h3>Personalized recommendations</h3>
              <div className="markdown-box">
                {designText ? <ReactMarkdown>{designText}</ReactMarkdown> : <p>No recommendations yet. Generate a redesigned concept.</p>}
              </div>
              <button className="primary-button full-width" onClick={saveDesign} disabled={!designText}>Save design</button>
            </div>
          </section>

          <section className="panel history-panel">
            <h3>Design history</h3>
            <div className="history-list">
              {history.length ? (
                history.map((item) => (
                  <div className="history-item" key={item.id}>
                    <div className="history-head">
                      <strong>{item.room_category}</strong>
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <div className="history-meta">{item.style} • {item.color_palette}</div>
                    <div className="history-summary">{item.recommendations.slice(0, 120)}...</div>
                  </div>
                ))
              ) : (
                <p>No designs saved yet.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
