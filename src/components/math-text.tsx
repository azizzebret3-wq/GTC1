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

    // This regex looks for $$...$$ (block) or $...$ (inline) delimiters.
    // It will split the text into an array of strings, separating the math parts.
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
          // dangerouslySetInnerHTML is safe here because we are using KaTeX to generate the HTML,
          // which sanitizes the input.
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (error) {
          console.error('KaTeX rendering error:', error);
          // If there's an error, display the raw math code in a noticeable way.
          return <code key={index} className="text-red-500 font-mono">{part}</code>;
        }
      } else {
        // This is a regular text part. We need to render newlines as <br> tags.
        // We can split by newline and join with <br />.
        const lines = part.split('\n').map((line, lineIndex, arr) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < arr.length - 1 && <br />}
          </React.Fragment>
        ));
        return <span key={index}>{lines}</span>;
      }
    });
  }, [text]);

  return <React.Fragment>{renderedContent}</React.Fragment>;
};

export default MathText;
