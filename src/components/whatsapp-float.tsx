// src/components/whatsapp-float.tsx
'use client';

import Link from 'next/link';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        {...props}
    >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.225 4.485 4.574-1.196z"/>
    </svg>
);


export default function WhatsAppFloat() {
    const whatsAppGroupLink = "https://chat.whatsapp.com/DtLzTRGATeJ22L3tuTGWhf?mode=ems_copy_t";

    return (
        <Link 
            href={whatsAppGroupLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-20 lg:bottom-6 right-5 z-50 bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform duration-300 hover:scale-110"
            title="Rejoindre le groupe WhatsApp"
        >
            <WhatsAppIcon className="w-6 h-6" />
        </Link>
    );
}
