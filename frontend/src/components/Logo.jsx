import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = "h-8", showSubtitle = true }) => {
  return (
    <Link to="/" className={`inline-flex flex-col items-start justify-center group focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 rounded-xl outline-none ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Modern Vector SVG Emblem */}
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-coral-500 to-coral-600 p-0.5 shadow-md shadow-coral-500/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-white dark:bg-neutral-900 rounded-[10px] flex items-center justify-center transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-coral-500"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                fillOpacity="0.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Brand Text SVG / Typography */}
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tight text-charcoal-900 dark:text-white transition-colors leading-none flex items-center gap-0.5">
            TECHNODHA
            <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse"></span>
          </span>
          {showSubtitle && (
            <span className="text-[8px] font-extrabold tracking-widest text-coral-500 uppercase mt-1 leading-none">
              Inventory & Store
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Logo;
