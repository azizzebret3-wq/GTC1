import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group" passHref>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-mauve-500 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg]">
            <span className="text-white font-black text-lg tracking-tighter drop-shadow-lg">GTC</span>
        </div>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-lg font-black gradient-text tracking-tight">
          Gagne ton concours
        </h1>
      </div>
    </Link>
  );
}
