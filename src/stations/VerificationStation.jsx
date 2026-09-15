import React, { useState, useEffect } from 'react';
import { useLab, LAB_STEPS } from '../context/LabContext';
import { calculateModuloHash } from '../utils/cryptoLogic';

export default function VerificationStation() {
    const { 
        currentStep, nextStep, modulo,
        extractedMessage, extractedHash,
        verifyAsciiMap, setVerifyAsciiMap,
        verifySum, setVerifySum,
        verifyModulo, setVerifyModulo
    } = useLab();
    
    const [errorMsg, setErrorMsg] = useState("");
    const [showHint, setShowHint] = useState(false);
    
    // We calculate the true hash of whatever message was extracted (even if tampered)
    const trueHashData = calculateModuloHash(extractedMessage || "", modulo);
    
    useEffect(() => { setErrorMsg(""); setShowHint(false); }, [currentStep]);

    const handleAsciiInput = (charIndex, val) => {
        setVerifyAsciiMap(prev => ({ ...prev, [charIndex]: val }));
    };

    const checkAscii = () => {
        let allCorrect = true;
        for (let i = 0; i < extractedMessage.length; i++) {
            const expected = extractedMessage.charCodeAt(i).toString();
            if (verifyAsciiMap[i] !== expected) {
                allCorrect = false;
                break;
            }
        }
        if (allCorrect) {
            nextStep();
        } else {
            setErrorMsg("One or more ASCII values are incorrect.");
        }
    };

    const checkSum = () => {
        if (parseInt(verifySum) === trueHashData.sum) {
            nextStep();
        } else {
            setErrorMsg("Incorrect sum.");
        }
    };

    const checkModulo = () => {
        if (parseInt(verifyModulo) === trueHashData.hash) {
            nextStep();
        } else {
            setErrorMsg("Incorrect modulo result.");
        }
    };

    const isMatch = verifyModulo.toString() === extractedHash;

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300 mb-24">
            
            <div className="text-center mb-8">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Integrity Verification</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Receiver node must independently calculate the hash of the extracted message and compare it to the extracted hash.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-2xl flex flex-col gap-10">
                
                {/* 1. RECALCULATE HASH */}
                <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.VERIFY_HASH_ASCII ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">1. Recalculate Modulo Hash</h3>
                    
                    <div className="bg-osBg border border-osGlassBorder p-6 flex flex-col gap-6">
                        <div className="text-xs font-mono uppercase tracking-widest text-textSecondary mb-2">
                            Extracted Message: <span className="text-textPrimary text-sm">{extractedMessage}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-center">
                            {extractedMessage && extractedMessage.split('').map((char, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 flex items-center justify-center border border-osGlassBorder bg-osSurface font-mono text-md text-textPrimary">
                                        {char}
                                    </div>
                                    <span className="text-textSecondary text-[10px]">↓</span>
                                    <input 
                                        type="text"
                                        className="w-12 text-center os-input text-xs px-1"
                                        placeholder="?"
                                        value={verifyAsciiMap[i] || ""}
                                        onChange={(e) => handleAsciiInput(i, e.target.value)}
                                        disabled={currentStep > LAB_STEPS.VERIFY_HASH_ASCII}
                                    />
                                </div>
                            ))}
                        </div>
                        
                        {currentStep === LAB_STEPS.VERIFY_HASH_ASCII && (
                            <div className="flex gap-4 mt-2">
                                <button onClick={checkAscii} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                    Check ASCII
                                </button>
                                <button 
                                    onClick={() => {
                                        const autoMap = {};
                                        for(let i=0; i<extractedMessage.length; i++) autoMap[i] = extractedMessage.charCodeAt(i).toString();
                                        setVerifyAsciiMap(autoMap);
                                    }} 
                                    className="os-button text-textSecondary border-osGlassBorder hover:bg-osGlass hover:text-textPrimary"
                                >
                                    Auto-Fill
                                </button>
                            </div>
                        )}

                        {/* SUM STAGE */}
                        {currentStep >= LAB_STEPS.VERIFY_HASH_SUM && (
                            <div className="flex items-center gap-4 text-sm font-mono flex-wrap pt-4 border-t border-osGlassBorder">
                                {extractedMessage && extractedMessage.split('').map((_, i) => verifyAsciiMap[i]).join(" + ")} = 
                                <input 
                                    type="number" 
                                    className="w-20 text-center os-input ml-2" 
                                    placeholder="?"
                                    value={verifySum}
                                    onChange={e => setVerifySum(e.target.value)}
                                    disabled={currentStep > LAB_STEPS.VERIFY_HASH_SUM}
                                />
                                {currentStep === LAB_STEPS.VERIFY_HASH_SUM && (
                                    <button onClick={checkSum} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                        Check
                                    </button>
                                )}
                            </div>
                        )}

                        {/* MODULO STAGE */}
                        {currentStep >= LAB_STEPS.VERIFY_HASH_MODULO && (
                            <div className="flex items-center gap-4 text-sm font-mono pt-4 border-t border-osGlassBorder">
                                {verifySum} mod {modulo} = 
                                <input 
                                    type="number" 
                                    className="w-20 text-center os-input ml-2" 
                                    placeholder="?"
                                    value={verifyModulo}
                                    onChange={e => setVerifyModulo(e.target.value)}
                                    disabled={currentStep > LAB_STEPS.VERIFY_HASH_MODULO}
                                />
                                {currentStep === LAB_STEPS.VERIFY_HASH_MODULO && (
                                    <button onClick={checkModulo} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                        Check
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. COMPARE HASHES */}
                {currentStep >= LAB_STEPS.COMPARE_HASHES && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.COMPARE_HASHES ? 'opacity-100' : 'opacity-30 pointer-events-none'} pt-6 border-t border-osGlassBorder`}>
                        <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">2. Compare Hashes</h3>
                        
                        <div className="flex gap-8 justify-center items-center w-full my-8">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Recalculated Hash</span>
                                <div className="bg-osBg border border-osGlassBorder px-6 py-3 font-mono text-textPrimary text-xl">
                                    {verifyModulo}
                                </div>
                            </div>
                            
                            <div className="font-mono text-2xl text-textSecondary opacity-50">vs</div>
                            
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Extracted Hash</span>
                                <div className="bg-osBg border border-osGlassBorder px-6 py-3 font-mono text-textPrimary text-xl">
                                    {extractedHash}
                                </div>
                            </div>
                        </div>

                        {currentStep === LAB_STEPS.COMPARE_HASHES ? (
                            <button onClick={nextStep} className="os-button text-accent border-accent/30 hover:bg-accent/10 w-full">
                                Perform Final Verification
                            </button>
                        ) : (
                            <div className={`w-full p-6 text-center animate-in zoom-in-95 font-mono ${isMatch ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'}`}>
                                <h3 className={`text-xl font-bold mb-2 ${isMatch ? 'text-success' : 'text-warning'}`}>
                                    {isMatch ? "✓ HASH MATCH" : "✕ HASH MISMATCH"}
                                </h3>
                                <p className={`text-sm ${isMatch ? 'text-success' : 'text-warning'}`}>
                                    {isMatch 
                                        ? "Hash values match. No modification was detected by this check." 
                                        : "Hash values differ. The message was modified or corrupted in transit."}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ERROR FEEDBACK */}
                {errorMsg && (
                    <div className="text-warning text-xs font-mono bg-warning/10 p-3 border border-warning/20">
                        ✕ {errorMsg}
                    </div>
                )}

            </div>
            
        </div>
    );
}
