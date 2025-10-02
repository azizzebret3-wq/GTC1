// src/components/math-text.tsx
'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
  isBlock?: boolean;
}

const MathText: React.FC<MathTextProps> = ({ text, isBlock = false }) => {
  if (!text) {
    return null;
  }

  // Simple check for LaTeX syntax.
  // This can be improved, but for now we look for common LaTeX characters.
  const hasLatex = /[\\{}^_]/.test(text) || /\$\$.*\$\$/.test(text) || /\\\(.*\\\)/.test(text);

  if (hasLatex) {
    try {
      // If it looks like LaTeX, try to render it.
      if (isBlock) {
        return <BlockMath math={text} />;
      }
      return <InlineMath math={text} />;
    } catch (error) {
      // If KaTeX fails to parse, just render as plain text.
      return <span>{text}</span>;
    }
  }

  // If no LaTeX detected, render as plain text.
  return <span>{text}</span>;
};

export default MathText;
