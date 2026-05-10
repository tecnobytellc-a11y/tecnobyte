import React, { useState } from 'react';
import { CreditCard, Euro, ShoppingCart, ArrowRight, ShieldCheck, Info } from 'lucide-react';

const CardTestPage = ({ addToCart, setIsCartOpen }) => {
    const [amount, setAmount] = useState('');
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val < 1 || val > 10000) {
            alert('Por favor ingresa un monto válido entre 1 y 10,000 EUR.');
            return;
        }

        addToCart({
            id: 22,
            title: `Card Test (${val.toFixed(2)} EUR)`,
            price: val,
            faceValue: val,
            category: 'Card Test',
            isCardTest: true,
            currencyCode: 'EUR'
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
    };

    const handleGoToCart = () => {
        setIsCartOpen(true);
    };

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
                        <Euro size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">
                        Card Test
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Prueba de tarjeta — Pago exclusivo en Euros (EUR)
                    </p>
                </div>

                {/* Card principal */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

                    {/* Info bar */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <Info size={18} className="text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-slate-600 font-medium">
                                Ingresa el monto que deseas pagar. La transacción se procesará <strong className="text-blue-700">exclusivamente en Euros (EUR)</strong> a través de PayPal o tarjeta de débito/crédito.
                            </p>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Campo de monto */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                                Monto a pagar
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-black text-blue-600">€</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    max="10000"
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-12 pr-20 py-5 text-slate-800 text-3xl font-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-bold text-slate-400">EUR</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-medium text-center">Mínimo: €1.00 — Máximo: €10,000.00</p>
                        </div>

                        {/* Resumen del producto */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <CreditCard size={20} className="text-indigo-600" />
                                <span className="font-bold text-slate-800">Detalle del Producto</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Producto:</span>
                                    <span className="text-slate-800 font-bold">Card Test</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Descripción:</span>
                                    <span className="text-slate-800 font-medium">Prueba de tarjeta</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Moneda:</span>
                                    <span className="text-blue-600 font-bold">EUR (Euros)</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-slate-200 mt-3">
                                    <span className="text-slate-800 font-black uppercase tracking-wider text-xs">Total:</span>
                                    <span className="text-2xl font-black text-blue-600">
                                        €{amount ? parseFloat(amount).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={!amount || parseFloat(amount) < 1}
                                className={`w-full font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-lg ${
                                    added
                                        ? 'bg-emerald-500 text-white scale-[1.02]'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed'
                                }`}
                            >
                                {added ? (
                                    <>✓ Agregado al carrito</>
                                ) : (
                                    <><ShoppingCart size={22} /> Agregar al Carrito</>
                                )}
                            </button>

                            <button
                                onClick={handleGoToCart}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm border border-slate-200"
                            >
                                Ver Carrito <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Footer de seguridad */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Pago seguro procesado por PayPal. Fondos recibidos en balance EUR.
                        </p>
                    </div>
                </div>

                {/* Métodos de pago aceptados */}
                <div className="flex justify-center items-center gap-4 mt-8">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                        <img src="/icons/paypal.png" alt="PayPal" className="h-6 object-contain" />
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                        <img src="/icons/visa.png" alt="Visa" className="h-6 w-auto object-contain" />
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6 object-contain" />
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                        <img src="/icons/amex.png" alt="Amex" className="h-6 object-contain" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardTestPage;
