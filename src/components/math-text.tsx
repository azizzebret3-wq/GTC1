// src/components/math-text.tsx
'use client';
import React from 'react';
import { MathpixLoader, MathpixMarkdown } from 'mathpix-markdown-it';

interface MathTextProps {
  text: string;
}

const MathText: React.FC<MathTextProps> = ({ text }) => {
    if (!text) {
        return null;
    }
    
    // The text is passed directly to MathpixMarkdown.
    // It will handle finding and rendering LaTeX formulas automatically.
    // We add a key to force re-render when text changes, which can help with some update issues.
    return (
        <MathpixLoader>
            <MathpixMarkdown
                text={text}
                key={text}
            />
        </MathpixLoader>
    );
};

export default MathText;
