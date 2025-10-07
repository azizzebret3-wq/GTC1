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
    
    // Le texte est censé arriver déjà formaté avec les délimiteurs ($ et $$) depuis la source (IA ou saisie manuelle).
    // Le composant MathpixMarkdown se charge du rendu.
    return (
        <MathpixLoader>
            <MathpixMarkdown text={text} />
        </MathpixLoader>
    );
};

export default MathText;
