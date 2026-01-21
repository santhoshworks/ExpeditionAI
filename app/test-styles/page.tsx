export default function TestStylesPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Style Test</h1>
                <div className="bg-slate-100 p-4 rounded-lg mb-4">
                    <p className="text-slate-700">This should have a light gray background</p>
                </div>
                <div className="bg-indigo-600 text-white p-4 rounded-lg mb-4">
                    <p>This should have an indigo background</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-lg mb-4">
                    <p className="text-slate-600">This should have a semi-transparent gray background</p>
                </div>
                <div className="bg-white/60 backdrop-blur-3xl p-4 rounded-lg border">
                    <p className="text-slate-700">This should have a blurred white background</p>
                </div>
            </div>
        </div>
    )
}