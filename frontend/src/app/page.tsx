import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <nav className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">RAMS Platform</span>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/login">
                            <Button variant="ghost">Log In</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Professional RAMS Generation for
                        <span className="text-blue-600"> UK Steel & Construction</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Create compliant Risk Assessment & Method Statements in minutes. Built specifically for steel fabricators, erectors, and construction contractors.
                    </p>

                    <div className="flex gap-4 justify-center mb-16">
                        <Link href="/register">
                            <Button size="lg" className="text-lg px-8">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="text-lg px-8">
                                Sign In
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                            <p className="text-gray-600">Generate complete RAMS in minutes, not hours. Guided workflows ensure nothing is missed.</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">UK Compliant</h3>
                            <p className="text-gray-600">Built-in HSE standards and construction guidance. Automatic hospital lookup for emergency arrangements.</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Reuse & Learn</h3>
                            <p className="text-gray-600">Build on previous RAMS. Our knowledge base learns from your work to speed up future projects.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
