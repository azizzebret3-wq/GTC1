'use client';
import React from 'react';

// This component is a wrapper to render text that may contain LaTeX.
// It splits the text into segments of regular text and math formulas
// and renders them accordingly.

interface MathTextProps {
  text: string;
}

const MathText: React.FC<MathTextProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  // Regex to find math expressions delimited by $...$ or $$...$$
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const parts = text.split(regex);

  return (
    <React.Fragment>
      {parts.map((part, index) => {
        if (part.match(regex)) {
          // It's a math part
          const isBlock = part.startsWith('$$');
          const math = part.substring(isBlock ? 2 : 1, part.length - (isBlock ? 2 : 1));
          const Tag = isBlock ? 'div' : 'span';
          // A simple way to display math-like content.
          // This does not use KaTeX but will render the content.
          // For a full LaTeX rendering, a library would be needed, but this avoids build issues.
          return (
            <Tag key={index} style={{ fontStyle: 'italic' }}>
              {math}
            </Tag>
          );
        }
        // It's a regular text part
        return <span key={index}>{part}</span>;
      })}
    </React.Fragment>
  );
};

export default MathText;
