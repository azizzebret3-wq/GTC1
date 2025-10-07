// src/components/math-text.tsx
'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
}

const MathText: React.FC<MathTextProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  // Regex to split the text into segments of regular text, inline math, and block math.
  // It handles $, $$, \( \), and \[ \] delimiters.
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\)|[^$\\]+)/g;
  const parts = text.match(regex) || [];

  return (
    <>
      {parts.map((part, index) => {
        try {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            return <BlockMath key={index}>{part.slice(2, -2)}</BlockMath>;
          }
          if (part.startsWith('\\[') && part.endsWith('\\]')) {
            return <BlockMath key={index}>{part.slice(2, -2)}</BlockMath>;
          }
          if (part.startsWith('$') && part.endsWith('$')) {
            // This is a special case to avoid rendering single "$" as math
            if(part.trim().length > 2) {
              return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>;
            }
          }
          if (part.startsWith('\\(') && part.endsWith('\\)')) {
            return <InlineMath key={index}>{part.slice(2, -2)}</InlineMath>;
          }
          // It's a regular text part, we can render it as a span or fragment
          return <span key={index}>{part}</span>;
        } catch (error) {
           // If KaTeX fails to parse, render the part as plain text with an error indicator
           return <span key={index} style={{ color: 'red', fontStyle: 'italic' }}>{part}</span>;
        }
      })}
    </>
  );
};

export default MathText;
