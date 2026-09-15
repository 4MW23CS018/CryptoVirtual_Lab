import React, { useState } from 'react';
import { useLab, LAB_STEPS } from '../context/LabContext';

export default function TransmissionStation() {
    const { 
        currentStep, nextStep, 
        finalCiphertext, 
        interceptedCiphertext, setInterceptedCiphertext 
    } = useLab();
    
    // Set intercept to final by default when entering the stage
    React.useEffect(() => {
        if (!interceptedCiphertext && finalCiphertext) {
            setInterceptedCiphertext(finalCiphertext);
        }
    }, [finalCiphertext, interceptedCiphertext, setInterceptedCiphertext]);

    const [isTampering, setIsTampering] = useState(false);
    const [tamperValue, setTamperValue] = useState("");

    const handleTransmit = () => {
        nextStep(); // moves to INTERCEPT
    };

    const handleRelease = () => {
        // If not tampering, just release original. If tampering, use modified.
        if (isTampering && tamperValue) {
            setInterceptedCiphertext(tamperValue);
        }
        nextStep(); // moves to DECRYPT_XOR
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            
            <div className="text-center mb-8">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Network Transmission</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Send the encrypted packet across the network. You may intercept it to test integrity verification.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-2xl flex flex-col items-center gap-10">
                
                {/* Visual transmission line */}
                <div className="flex flex-col items-center w-full relative">
                    
                    <div className="flex justify-between w-full font-mono text-[10px] uppercase tracking-widest text-textSecondary px-8">
                        <span>Sender Node</span>
                        <span>Receiver Node</span>
                    </div>
                    
                    <div className="flex items-center w-full mt-4 justify-between relative px-12">
                        {/* Sender Node */}
                        <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_rgba(13,148,136,0.5)] z-10"></div>
                        
                        {/* Line */}
                        <div className="absolute top-1/2 left-16 right-16 h-[2px] bg-osGlassBorder -translate-y-1/2">
                            {currentStep === LAB_STEPS.INTERCEPT && (
                                <div className="absolute top-1/2 left-1/2 w-32 h-[2px] bg-warning -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse"></div>
                            )}
                        </div>
                        
                        {/* Receiver Node */}
                        <div className={`w-4 h-4 rounded-full z-10 transition-colors ${currentStep > LAB_STEPS.INTERCEPT ? 'bg-success shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'bg-osGlassBorder'}`}></div>
                        
                        {/* Packet Graphic */}
                        <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center bg-osSurface border ${currentStep === LAB_STEPS.INTERCEPT ? 'border-warning shadow-[0_0_15px_rgba(220,38,38,0.3)] text-warning left-1/2 -translate-x-1/2' : 'border-accent shadow-[0_0_15px_rgba(13,148,136,0.3)] text-accent left-16'} transition-all duration-1000 px-4 py-2 font-mono text-xs font-bold`}>
                            {currentStep === LAB_STEPS.TRANSMIT ? finalCiphertext : interceptedCiphertext}
                        </div>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-osGlassBorder" />

                {/* Controls */}
                {currentStep === LAB_STEPS.TRANSMIT && (
                    <div className="flex gap-4">
                        <button onClick={handleTransmit} className="os-button text-accent border-accent/30 hover:bg-accent/10 w-48">
                            Send Packet
                        </button>
                    </div>
                )}

                {currentStep === LAB_STEPS.INTERCEPT && (
                    <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95">
                        <div className="text-warning font-mono text-sm uppercase tracking-widest text-center">
                            Packet Intercepted in Transit
                        </div>
                        
                        {!isTampering ? (
                            <div className="flex gap-4">
                                <button onClick={handleRelease} className="os-button text-success border-success/30 hover:bg-success/10">
                                    Release Untampered
                                </button>
                                <button onClick={() => { setIsTampering(true); setTamperValue(interceptedCiphertext); }} className="os-button text-warning border-warning/30 hover:bg-warning/10">
                                    Modify Ciphertext
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <span className="text-[10px] uppercase tracking-widest text-textSecondary font-mono">Original: {finalCiphertext}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-warning">MODIFIED:</span>
                                    <input 
                                        type="text" 
                                        value={tamperValue}
                                        onChange={e => setTamperValue(e.target.value.toUpperCase())}
                                        className="os-input w-64 text-center border-warning focus:ring-warning"
                                    />
                                </div>
                                <button onClick={handleRelease} className="os-button mt-4 text-warning border-warning/30 hover:bg-warning/10 w-full max-w-sm">
                                    Release Tampered Packet
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
            </div>
            
        </div>
    );
}
