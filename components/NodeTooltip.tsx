import React from 'react';
import { MapNode } from '../types';
import { VideoIcon, WebsiteIcon } from './icons';

interface NodeTooltipProps {
  node: MapNode | null;
  position: { x: number; y: number };
}

const NodeTooltip: React.FC<NodeTooltipProps> = ({ node, position }) => {
  if (!node) return null;

  return (
    <div
      className="absolute p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-white max-w-xs text-sm pointer-events-none transition-opacity duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(15px, 15px)', // Offset from cursor
        opacity: 1,
      }}
    >
      <h3 className="font-bold text-md text-indigo-400 mb-2">{node.label}</h3>
      <p className="text-slate-300 mb-3">{node.description}</p>
      {node.resources.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-200 mb-2">Learning Resources:</h4>
          <ul className="space-y-1.5">
            {node.resources.map((res, i) => {
              const isVideo = res.type === 'video';
              const typeClasses = isVideo
                ? 'bg-red-500/10 border-red-500 hover:bg-red-500/20'
                : 'bg-indigo-500/10 border-indigo-500 hover:bg-indigo-500/20';
              const iconColor = isVideo ? 'text-red-400' : 'text-indigo-400';

              return (
                <li key={i}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-2 text-slate-300 p-2 rounded-md transition-colors border-l-2 ${typeClasses} pointer-events-auto`}
                  >
                    {isVideo ? (
                      <VideoIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
                    ) : (
                      <WebsiteIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
                    )}
                    <span className="truncate group-hover:underline">{res.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NodeTooltip;
