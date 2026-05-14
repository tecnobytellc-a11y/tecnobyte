import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const LegalPage = ({ title, content }) => {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold mb-8 transition-colors">
                    <ArrowLeft size={20} /> Volver a la Tienda
                </Link>
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-600 p-8 text-center sm:text-left flex items-center gap-4">
                        <ShieldCheck className="text-white hidden sm:block" size={40} />
                        <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
                    </div>
                    
                    <div className="p-8 sm:p-12 prose prose-indigo max-w-none text-slate-600 whitespace-pre-line leading-relaxed">
                        {content || "Cargando información legal..."}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;