import React from 'react';
import { MapNode } from '../types';
import { VideoIcon, WebsiteIcon, CloseIcon } from './icons';

const NodeDetailSidebar: React.FC<{ node: MapNode | null; onClose: () => void }> = ({ node, onClose }) => {
  const isVisible = !!node;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-800 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {node && (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between p-4 border-b border-slate-700">
              <div className="flex-1">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      node.level === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                      node.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                  }`}>{node.level}</span>
                  <h2 id="sidebar-title" className="text-xl font-bold text-indigo-400 mt-2">{node.label}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Close details panel"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-slate-300 mb-6">{node.description}</p>
              
              {node.resources.length > 0 && (
                  <div>
                      <h3 className="font-semibold text-slate-200 mb-3 text-lg">Learning Resources</h3>
                      <ul className="space-y-2">
                          {node.resources.map((res, i) => {
                              const isVideo = res.type === 'video';
                              const typeClasses = isVideo
                                  ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                                  : 'bg-indigo-500/10 border-indigo-500/50 hover:bg-indigo-500/20';
                              const iconColor = isVideo ? 'text-red-400' : 'text-indigo-400';

                              return (
                                  <li key={i}>
                                  <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`group flex items-center gap-3 text-slate-300 p-3 rounded-lg transition-colors border ${typeClasses}`}
                                  >
                                      <div className="flex-shrink-0">
                                          {isVideo ? (
                                              <VideoIcon className={`h-5 w-5 ${iconColor}`} />
                                          ) : (
                                              <WebsiteIcon className={`h-5 w-5 ${iconColor}`} />
                                          )}
                                      </div>
                                      <span className="font-medium group-hover:underline">{res.title}</span>
                                  </a>
                                  </li>
                              );
                          })}
                      </ul>
                  </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default NodeDetailSidebar;
