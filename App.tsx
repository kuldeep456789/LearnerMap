import React, { useState, useCallback, useRef } from 'react';
import { generateLearningMap, generateRelatedTopics, generateTopicImage } from './services/geminiService';
import { MapData, LearningLevel, MapNode } from './types';
import LearningMap, { LearningMapRef } from './components/LearningMap';
import LoadingSpinner from './components/LoadingSpinner';
import { DownloadIcon } from './components/icons';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MapControls from './components/MapControls';
import MapLegend from './components/MapLegend';
import SuggestedTopics from './components/SuggestedTopics';
import NodeDetailSidebar from './components/NodeDetailSidebar';
import ContactPage from './components/ContactPage';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [learningLevel, setLearningLevel] = useState<LearningLevel>('Beginner');
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const mapRef = useRef<LearningMapRef>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [mapBackground, setMapBackground] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const generateMapForTopic = useCallback(async (currentTopic: string) => {
    if (!currentTopic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMapData(null);
    setSuggestedTopics([]);
    setMapBackground(null);
    setSelectedNode(null);

    try {
      const data = await generateLearningMap(currentTopic, learningLevel);
      setMapData(data);

      // After successfully generating a map, get related topics
      const suggestions = await generateRelatedTopics(currentTopic);
      setSuggestedTopics(suggestions);

    // Fix: Added curly braces to the catch block to fix a syntax error that caused all subsequent code to be out of scope.
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [learningLevel]);

  const handleFormSubmit = () => {
    generateMapForTopic(topic);
  };

  const handleGenerateImage = useCallback(async () => {
    if (!topic) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
        const base64Image = await generateTopicImage(topic);
        setMapBackground(`data:image/png;base64,${base64Image}`);
    } catch (err: any) {
        setError(err.message || 'Failed to generate image.');
    } finally {
        setIsGeneratingImage(false);
    }
  }, [topic]);

  const handleSuggestionClick = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    generateMapForTopic(suggestedTopic);
  };

  const handleExport = () => {
    if (!mapData) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(mapData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `learning_map_${sanitizedTopic}.json`;
    link.click();
  };

  const renderMainContent = () => (
    <main className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
          <p className="mt-2 mb-6 text-lg text-center text-slate-400">
            Turn any topic into a visual, interactive learning journey.
          </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-slate-800/50 rounded-lg mb-6 shadow-md">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleFormSubmit()}
            placeholder="Enter a topic (e.g., Web Development)"
            className="flex-grow w-full sm:w-auto px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <select
            value={learningLevel}
            onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <button
            onClick={handleFormSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>Generating...</span>
              </>
            ) : 'Generate Map'}
          </button>
        </div>
        
        {error && (
            <div className="text-center text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{error}</div>
        )}

        <div 
          className="w-full h-[70vh] flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800 relative bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: mapBackground ? `url(${mapBackground})` : 'none' }}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 ${mapBackground ? 'bg-slate-900/70' : 'bg-transparent'} rounded-lg`}></div>

          {!isLoading && !mapData && (
            <div className="text-center text-slate-500 z-10">
              <h2 className="text-2xl font-semibold">Your Learning Map Awaits</h2>
              <p className="mt-2">Enter a topic above to visualize your interactive learning journey.</p>
            </div>
          )}
          <LearningMap
            data={mapData}
            ref={mapRef}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id || null}
          />
          {isLoading && <div className="absolute inset-0 bg-slate-800/50 flex items-center justify-center"><LoadingSpinner /></div>}
          {mapData && (
            <>
              <MapControls
                onZoomIn={() => mapRef.current?.zoomIn()}
                onZoomOut={() => mapRef.current?.zoomOut()}
                onReset={() => mapRef.current?.resetZoom()}
                onGenerateImage={handleGenerateImage}
                isGeneratingImage={isGeneratingImage}
              />
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                  <MapLegend />
                  <button
                      onClick={handleExport}
                      className="p-2 bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 rounded-md transition-colors backdrop-blur-sm flex items-center gap-2"
                      aria-label="Export as JSON"
                      >
                      <DownloadIcon className="h-5 w-5" />
                      <span className="text-xs font-semibold">Export</span>
                  </button>
              </div>
            </>
          )}
        </div>

        {!isLoading && suggestedTopics.length > 0 && (
          <SuggestedTopics
              topics={suggestedTopics}
              onTopicClick={handleSuggestionClick}
          />
        )}

      </div>
    </main>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200">
      <Navbar onContactClick={() => setIsContactModalOpen(true)} />
      {renderMainContent()}
      <Footer />
      <NodeDetailSidebar node={selectedNode} onClose={() => setSelectedNode(null)} />
      <ContactPage isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default App;
