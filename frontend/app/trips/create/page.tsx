import TripForm from "@/components/TripForm";
import Navigation from "@/components/Navigation";

export default function CreateTripPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Plan Your Trip</h1>
                    <TripForm />
                </div>
            </main>
        </div>
    );
}
