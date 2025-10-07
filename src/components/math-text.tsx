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
    
    return (
        <MathpixLoader>
            <MathpixMarkdown
                text={text}
                htmlTags={true} // Allow HTML tags in the input, which also enables more lenient math parsing
                key={text}
            />
        </MathpixLoader>
    );
};

export default MathText;
