import React from 'react';
import {
  CloseIcon,
  DocumentTextIcon,
  GitHubIcon,
  LinkedInIcon,
  ContactMailIcon,
} from './icons';

const SkillBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-green-500/10 text-green-300 border border-green-500/30 text-sm font-medium px-3 py-1 rounded-full">
        {children}
    </span>
);

const ContactPage: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      <div
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-slate-700 animate-[slideIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors z-10"
          aria-label="Close contact information"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="p-8 pt-12 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 text-center">
                    <h1 className="text-3xl font-bold text-white">Kuldeep Prajapati</h1>
                    <p className="text-indigo-400 font-medium mt-1">Speclised AL & Ml and Full Stack Development</p>
                    <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors"
                    >
                        <DocumentTextIcon className="h-5 w-5" />
                        <span>View Resume</span>
                    </a>
                </div>
                <div className="flex-1 border-t-2 md:border-t-0 md:border-l-2 border-slate-700 pt-6 md:pt-0 md:pl-8">
                    <h2 className="text-2xl font-semibold text-slate-200 mb-4">About Me</h2>
                    <div className="space-y-4 text-slate-400 leading-relaxed">
                        <p>
                          I build ideas into experiences. I enjoy shaping concepts into smooth, 
                          functional, and thoughtful digital journeys that feel natural to the user.
                        </p>
                        <p>
                          My approach is rooted in clarity, patience, and curiosity. I like to understand 
                          how things fit together, refine them, and bring them to life in a way that is both 
                          meaningful and intuitive.
                        </p>
                        <p>
                          I believe that good work isn’t just about features, 
                          but how it feels to use them. Every project is a chance to create something that 
                          works well, looks clean, and makes someone’s day just a little easier.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t-2 border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-200 mb-6 text-center">My Skills</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    <SkillBadge>React</SkillBadge>
                    <SkillBadge>TypeScript</SkillBadge>
                    <SkillBadge>Node.js</SkillBadge>
                    <SkillBadge>Tailwind CSS</SkillBadge>
                    <SkillBadge>D3.js</SkillBadge>
                    <SkillBadge>Python</SkillBadge>
                    <SkillBadge>Machine Learning</SkillBadge>
                    <SkillBadge>Gemini API</SkillBadge>
                </div>
            </div>
            
            <div className="mt-10 pt-8 border-t-2 border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-200 mb-6 text-center">Contact & Links</h2>
                <div className="flex justify-center items-center gap-4">
                    <a href="https://www.linkedin.com/in/kuldeep023/" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                        <LinkedInIcon className="h-7 w-7" />
                    </a>
                    <a href="https://github.com/kuldeep456789" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                        <GitHubIcon className="h-7 w-7" />
                    </a>
                    <a href="mailto:kuldeep.prajapati@example.com" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                        <ContactMailIcon className="h-7 w-7" />
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;