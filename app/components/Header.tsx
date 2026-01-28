
import Link from 'next/link';

export default function Header() {
    return (
        <nav className="navbar border-b border-white/5 bg-opacity-50 backdrop-blur-md sticky top-0 z-50">
            <div className="container flex items-center justify-between h-20">
                <Link href="/" className="logo flex items-center gap-2 group">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="eyeGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#9945FF" />
                                    <stop offset="100%" stopColor="#14F195" />
                                </linearGradient>
                            </defs>
                            {/* Outer Eye Shape */}
                            <path
                                d="M16 8C9 8 4 16 4 16C4 16 9 24 16 24C23 24 28 16 28 16C28 16 23 8 16 8Z"
                                stroke="url(#eyeGradient)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="blink-lid"
                                style={{ transformOrigin: 'center' }}
                            />
                            {/* Pupil/Iris */}
                            <circle cx="16" cy="16" r="4" fill="url(#eyeGradient)" className="blink-pupil" style={{ transformOrigin: 'center' }} />
                            {/* Spark/Reflection */}
                            <path d="M22 6L23.5 9L25 6" stroke="#14F195" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="logo-text font-bold text-xl tracking-tight">BlinkDir</span>
                </Link>
                <Link href="/submit" className="btn-primary py-2 px-4 text-sm whitespace-nowrap">
                    Submit Blink
                </Link>
            </div>
        </nav>
    );
}
