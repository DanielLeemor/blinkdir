
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        // If not logged in, only allow access to login page
        // We can't easily check pathname in server component layout without headers helper
        // Easier to handle protection in page.tsx or middleware
        // But for this layout, we render header/footer? No, admin usually has different layout
        // Let's keep it simple: no header/footer for admin, just child content
    }

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f] border-b border-white/10 px-8 py-4 flex justify-between items-center">
                <Link href="/admin" className="font-bold text-lg text-white">BlinkDir Admin</Link>
                <Link href="/" className="text-sm text-gray-400 hover:text-white">View Site</Link>
            </nav>
            {children}
        </>
    );
}
