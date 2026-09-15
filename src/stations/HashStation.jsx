import React, { useState, useEffect } from 'react';
import { useLab, LAB_STEPS } from '../context/LabContext';
import { calculateModuloHash } from '../utils/cryptoLogic';

export default function HashStation() {
    const { 
        currentStep, nextStep, message, modulo,
        studentAsciiMap, setStudentAsciiMap,
        studentSum, setStudentSum,
        studentModulo, setStudentModulo
    } = useLab();
    
    const [errorMsg, setErrorMsg] = useState("");
    const [showHint, setShowHint] = useState(false);
    
    const trueHashData = calculateModuloHash(message, modulo);
    
    // Clear errors when stepping
    useEffect(() => { setErrorMsg(""); setShowHint(false); }, [currentStep]);

    const handleAsciiInput = (charIndex, val) => {
        setStudentAsciiMap(prev => ({ ...prev, [charIndex]: val }));
    };

    const checkAscii = () => {
        let allCorrect = true;
        for (let i = 0; i < message.length; i++) {
            const expected = message.charCodeAt(i).toString();
            if (studentAsciiMap[i] !== expected) {
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
        if (parseInt(studentSum) === trueHashData.sum) {
            nextStep();
        } else {
            setErrorMsg("Incorrect sum.");
        }
    };

    const checkModulo = () => {
        if (parseInt(studentModulo) === trueHashData.hash) {
            nextStep();
        } else {
            setErrorMsg("Incorrect modulo result.");
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            
            <div className="text-center mb-8">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Generate Modulo Hash</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Convert the plaintext to ASCII, sum the values, and calculate the remainder modulo {modulo}.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-2xl flex flex-col gap-10">
                
                {/* ASCII STAGE */}
                <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.HASH_ASCII ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">1. ASCII Conversion</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                        {message.split('').map((char, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 flex items-center justify-center border border-osGlassBorder bg-osBg font-mono text-lg text-textPrimary">
                                    {char}
                                </div>
                                <span className="text-textSecondary text-xs">↓</span>
                                <input 
                                    type="text"
                                    className="w-16 text-center os-input"
                                    placeholder="?"
                                    value={studentAsciiMap[i] || ""}
                                    onChange={(e) => handleAsciiInput(i, e.target.value)}
                                    disabled={currentStep > LAB_STEPS.HASH_ASCII}
                                />
                            </div>
                        ))}
                    </div>
                    {currentStep === LAB_STEPS.HASH_ASCII && (
                        <div className="flex gap-4 mt-6">
                            <button onClick={checkAscii} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                Check ASCII Values
                            </button>
                            <button 
                                onClick={() => {
                                    const autoMap = {};
                                    for(let i=0; i<message.length; i++) autoMap[i] = message.charCodeAt(i).toString();
                                    setStudentAsciiMap(autoMap);
                                }} 
                                className="os-button text-textSecondary border-osGlassBorder hover:bg-osGlass hover:text-textPrimary"
                            >
                                Auto-Fill ASCII
                            </button>
                        </div>
                    )}
                </div>

                {/* SUM STAGE */}
                {currentStep >= LAB_STEPS.HASH_SUM && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.HASH_SUM ? 'opacity-100' : 'opacity-30 pointer-events-none'} pt-6 border-t border-osGlassBorder`}>
                        <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">2. Calculate Sum</h3>
                        <div className="flex items-center gap-4 text-sm font-mono flex-wrap">
                            {message.split('').map((_, i) => studentAsciiMap[i]).join(" + ")} = 
                            <input 
                                type="number" 
                                className="w-24 text-center os-input ml-2" 
                                placeholder="?"
                                value={studentSum}
                                onChange={e => setStudentSum(e.target.value)}
                                disabled={currentStep > LAB_STEPS.HASH_SUM}
                            />
                        </div>
                        {currentStep === LAB_STEPS.HASH_SUM && (
                            <button onClick={checkSum} className="os-button mt-6 text-accent border-accent/30 hover:bg-accent/10">
                                Check Sum
                            </button>
                        )}
                    </div>
                )}

                {/* MODULO STAGE */}
                {currentStep >= LAB_STEPS.HASH_MODULO && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.HASH_MODULO ? 'opacity-100' : 'opacity-30 pointer-events-none'} pt-6 border-t border-osGlassBorder`}>
                        <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">3. Apply Modulo {modulo}</h3>
                        <div className="flex items-center gap-4 text-sm font-mono">
                            {studentSum} mod {modulo} = 
                            <input 
                                type="number" 
                                className="w-24 text-center os-input ml-2" 
                                placeholder="?"
                                value={studentModulo}
                                onChange={e => setStudentModulo(e.target.value)}
                                disabled={currentStep > LAB_STEPS.HASH_MODULO}
                            />
                        </div>
                        {currentStep === LAB_STEPS.HASH_MODULO && (
                            <button onClick={checkModulo} className="os-button mt-6 text-accent border-accent/30 hover:bg-accent/10">
                                Check Modulo
                            </button>
                        )}
                    </div>
                )}

                {/* ERROR FEEDBACK */}
                {errorMsg && (
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="text-warning text-xs font-mono bg-warning/10 p-3 border border-warning/20">
                            ✕ {errorMsg}
                        </div>
                        {!showHint && (
                            <button onClick={() => setShowHint(true)} className="text-[10px] uppercase tracking-widest text-textSecondary hover:text-textPrimary self-start">
                                [ Need a Hint? ]
                            </button>
                        )}
                        {showHint && (
                            <div className="text-[10px] text-textSecondary font-mono italic">
                                Hint: {currentStep === LAB_STEPS.HASH_ASCII ? "Look up an ASCII table. 'A' is 65." : 
                                       currentStep === LAB_STEPS.HASH_SUM ? "Simply add all the ASCII numbers together." : 
                                       "Divide the sum by the modulo (N) and find the remainder."}
                            </div>
                        )}
                    </div>
                )}

            </div>
            
        </div>
    );
}
