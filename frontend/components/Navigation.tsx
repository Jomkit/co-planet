import Link from "next/link";

export default function Navigation() {
    return (
        <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
            <Link href="/" className="text-xl font-bold text-gray-900">
                Co-Planet
            </Link>
            <div className="flex gap-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                </Link>
                <Link href="/trips" className="text-gray-600 hover:text-gray-900">
                    Trips
                </Link>
            </div>
        </nav>
    );
}
