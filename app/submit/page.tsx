
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubmitForm from "../components/SubmitForm";

export default function SubmitPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen pt-32 pb-20">
                <div className="container">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">
                            Submit a <span className="gradient-text">Blink</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Add your Solana Action to the directory. We verify all submissions to ensure they are valid and safe.
                        </p>
                    </div>

                    <SubmitForm />
                </div>
            </main>

            <Footer />
        </>
    );
}
