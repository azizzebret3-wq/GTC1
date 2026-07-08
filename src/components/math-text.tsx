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

    // Support for $$...$$ (block), $...$ (inline), and **...** (bold)
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\*\*[\s\S]*?\*\*)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') || (part.startsWith('$') && !part.startsWith('$$'))) {
        // Handle Math
        const isBlock = part.startsWith('$$');
        const math = part.substring(isBlock ? 2 : 1, part.length - (isBlock ? 2 : 1));
        
        try {
          const html = katex.renderToString(math, {
            throwOnError: false,
            displayMode: isBlock,
          });
          return <span key={index} className="katex-container" dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (error) {
          console.error('KaTeX rendering error:', error);
          return <code key={index} className="text-red-500 font-mono px-1 rounded bg-red-50">{part}</code>;
        }
      } else if (part.startsWith('**') && part.endsWith('**')) {
        // Handle Bold
        const boldText = part.substring(2, part.length - 2);
        return <strong key={index} className="font-black text-foreground">{boldText}</strong>;
      } else {
        // Handle regular text and newlines
        const lines = part.split('\n').map((line, lineIndex, arr) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < arr.length - 1 && <br />}
          </React.Fragment>
        ));
        return <span key={index} className="text-wrap">{lines}</span>;
      }
    });
  }, [text]);

  return <React.Fragment>{renderedContent}</React.Fragment>;
};

export default MathText;
