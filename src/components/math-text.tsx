// src/components/math-text.tsx
'use client';
import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
}

const MathText: React.FC<MathTextProps> = ({ text }) => {
  const renderedContent = useMemo(() => {
    if (!text) {
      return null;
    }

    // Split the input text by newlines to process each line separately.
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // For each line, find math expressions.
      const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
      const parts = line.split(regex);

      const renderedParts = parts.map((part, partIndex) => {
        if (part.match(regex)) {
          const isBlock = part.startsWith('$$');
          const math = part.substring(isBlock ? 2 : 1, part.length - (isBlock ? 2 : 1));
          
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: isBlock,
            });
            return <span key={partIndex} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (error) {
            console.error('KaTeX rendering error:', error);
            return <code key={partIndex} className="text-red-500">{part}</code>;
          }
        } else {
          // It's a regular text part.
          return <span key={partIndex}>{part}</span>;
        }
      });
      
      // Render each line in its own div to preserve line breaks.
      return <div key={lineIndex}>{renderedParts}</div>;
    });
  }, [text]);

  return <React.Fragment>{renderedContent}</React.Fragment>;
};

export default MathText;
