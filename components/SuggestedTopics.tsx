import React from 'react';
import { LightbulbIcon } from './icons';

interface SuggestedTopicsProps {
  topics: string[];
  onTopicClick: (topic: string) => void;
}

const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({ topics, onTopicClick }) => {
  return (
    <div className="w-full mt-6 p-4 bg-slate-800/50 rounded-lg">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-200 mb-3">
        <LightbulbIcon className="h-5 w-5 text-amber-400" />
        Explore Next
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => onTopicClick(topic)}
            className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm hover:bg-slate-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedTopics;