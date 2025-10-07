'use client';
import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
}

const MathText: React.FC<MathTextProps> = ({ text }) => {
  const renderedParts = useMemo(() => {
    if (!text) {
      return null;
    }

    // Regex to find math expressions delimited by $...$ (inline) or $$...$$ (block).
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(regex)) {
        const isBlock = part.startsWith('$$');
        const math = part.substring(isBlock ? 2 : 1, part.length - (isBlock ? 2 : 1));
        
        try {
          const html = katex.renderToString(math, {
            throwOnError: false,
            displayMode: isBlock,
          });

          // Using dangerouslySetInnerHTML to render the KaTeX output
          return (
            <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
          );

        } catch (error) {
          console.error('KaTeX rendering error:', error);
          // In case of error, just display the raw math text.
          return <code key={index} className="text-red-500">{part}</code>;
        }

      } else {
        // It's a regular text part
        return <span key={index}>{part}</span>;
      }
    });
  }, [text]);

  return <React.Fragment>{renderedParts}</React.Fragment>;
};

export default MathText;
