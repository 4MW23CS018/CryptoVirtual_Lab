import React, { useState, useEffect } from 'react';
import { useLab, LAB_STEPS } from '../context/LabContext';
import { toBinary } from '../utils/cryptoLogic';

export default function DecryptionStation() {
    const { 
        currentStep, nextStep, 
        secretKey, interceptedCiphertext,
        decryptByteIndex, setDecryptByteIndex,
        decryptedChars, setDecryptedChars,
        extractedMessage, setExtractedMessage,
        extractedHash, setExtractedHash
    } = useLab();
    
    // State for ENCRYPT_XOR bit toggles (Byte 01 only)
    const [bitToggles, setBitToggles] = useState(Array(8).fill(0));
    const [charInput, setCharInput] = useState("");
    
    const [errorMsg, setErrorMsg] = useState("");
    const [showHint, setShowHint] = useState(false);

    // Derived properties for current byte
    const hexPair = interceptedCiphertext.substring(decryptByteIndex * 2, (decryptByteIndex * 2) + 2);
    const cipherVal = parseInt(hexPair, 16) || 0;
    const keyChar = secretKey[decryptByteIndex % secretKey.length] || "";
    const keyVal = keyChar.charCodeAt(0) || 0;
    const trueDecryptedVal = cipherVal ^ keyVal;
    const trueDecryptedChar = String.fromCharCode(trueDecryptedVal);

    const totalBytes = Math.floor(interceptedCiphertext.length / 2);

    useEffect(() => { setErrorMsg(""); setShowHint(false); }, [currentStep, decryptByteIndex]);

    const toggleBit = (idx) => {
        const newBits = [...bitToggles];
        newBits[idx] = newBits[idx] === 0 ? 1 : 0;
        setBitToggles(newBits);
    };

    const checkBitXor = () => {
        const studentBinary = bitToggles.join('');
        const trueBinary = toBinary(trueDecryptedVal);
        
        if (studentBinary === trueBinary) {
            handleByteSuccess(trueDecryptedChar);
        } else {
            setErrorMsg("Incorrect binary result. Remember the XOR rules.");
        }
    };

    const checkCharInput = () => {
        if (charInput === trueDecryptedChar) {
            handleByteSuccess(trueDecryptedChar);
        } else {
            setErrorMsg(`Incorrect character. The decimal result is ${trueDecryptedVal}. Look that up on an ASCII table.`);
        }
    };

    const handleByteSuccess = (charResult) => {
        const newChars = [...decryptedChars, charResult];
        setDecryptedChars(newChars);
        
        if (decryptByteIndex + 1 < totalBytes) {
            setDecryptByteIndex(i => i + 1);
            setBitToggles(Array(8).fill(0));
            setCharInput("");
        } else {
            nextStep(); // to EXTRACT_PAYLOAD
        }
    };

    const handleExtract = () => {
        const fullDecrypted = decryptedChars.join('');
        const parts = fullDecrypted.split('|');
        if (parts.length >= 2) {
            setExtractedMessage(parts[0]);
            setExtractedHash(parts[1]);
        } else {
            // Tampering might have destroyed the separator
            setExtractedMessage(fullDecrypted);
            setExtractedHash("");
        }
        nextStep(); // to VERIFY_HASH_ASCII
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            
            <div className="text-center mb-8">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Decryption Station</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Receiver node is decrypting the ciphertext packet and extracting the payload components.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-3xl flex flex-col gap-10">
                
                {/* 1. DECRYPTION ENGINE */}
                {currentStep >= LAB_STEPS.DECRYPT_XOR && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.DECRYPT_XOR ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">
                                1. XOR Decryptor (Byte {decryptByteIndex + 1} of {totalBytes})
                            </h3>
                            <span className="text-[10px] uppercase tracking-widest font-mono text-accent bg-accent/10 px-2 py-1">
                                Using Shared Secret Key: {secretKey}
                            </span>
                        </div>

                        {currentStep === LAB_STEPS.DECRYPT_XOR && (
                            <div className="bg-osBg border border-osGlassBorder p-6 mb-8 flex flex-col gap-6">
                                
                                <div className="flex justify-between items-center w-full px-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-textSecondary uppercase tracking-widest">Ciphertext Byte</span>
                                        <span className="font-mono text-xl text-textPrimary">{hexPair}</span>
                                        <span className="font-mono text-xs text-textSecondary">(Dec: {cipherVal})</span>
                                        {decryptByteIndex === 0 && <span className="font-mono text-xs tracking-widest mt-2">{toBinary(cipherVal)}</span>}
                                    </div>
                                    <div className="font-mono text-2xl text-accent">⊕</div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-textSecondary uppercase tracking-widest">Key Byte</span>
                                        <span className="font-mono text-xl text-textPrimary">{keyChar}</span>
                                        <span className="font-mono text-xs text-textSecondary">(Dec: {keyVal})</span>
                                        {decryptByteIndex === 0 && <span className="font-mono text-xs tracking-widest mt-2">{toBinary(keyVal)}</span>}
                                    </div>
                                </div>
                                
                                <div className="w-full h-[1px] bg-osGlassBorder" />
                                
                                {decryptByteIndex === 0 ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-[10px] text-accent uppercase tracking-widest">Toggle Bits to solve XOR Decryption</span>
                                        <div className="flex gap-2">
                                            {bitToggles.map((b, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => toggleBit(i)}
                                                    className={`w-10 h-10 font-mono text-lg border transition-colors ${b ? 'bg-accent text-osBg border-accent' : 'bg-osSurface text-textSecondary border-osGlassBorder hover:border-textSecondary'}`}
                                                >
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={checkBitXor} className="os-button mt-4 text-accent border-accent/30 hover:bg-accent/10">
                                            Check Binary Result
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-[10px] text-accent uppercase tracking-widest">ASCII Character Result</span>
                                        <div className="flex items-center gap-4 font-mono">
                                            <span>{cipherVal} ⊕ {keyVal} = {trueDecryptedVal} →</span>
                                            <input 
                                                type="text" 
                                                value={charInput}
                                                onChange={e => setCharInput(e.target.value)}
                                                className="os-input w-16 text-center uppercase"
                                                maxLength={1}
                                                placeholder="?"
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-4">
                                            <button onClick={checkCharInput} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                                Check Character
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    let fastForwardChars = [...decryptedChars];
                                                    for (let i = decryptByteIndex; i < totalBytes; i++) {
                                                        const hPair = interceptedCiphertext.substring(i * 2, (i * 2) + 2);
                                                        const cVal = parseInt(hPair, 16);
                                                        const kVal = secretKey.charCodeAt(i % secretKey.length);
                                                        fastForwardChars.push(String.fromCharCode(cVal ^ kVal));
                                                    }
                                                    setDecryptedChars(fastForwardChars);
                                                    setDecryptByteIndex(totalBytes);
                                                    nextStep();
                                                }} 
                                                className="os-button text-textSecondary border-osGlassBorder hover:bg-osGlass hover:text-textPrimary"
                                            >
                                                Fast-Forward Remaining Bytes
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Completed Bytes Tracker */}
                        <div className="flex flex-wrap gap-2">
                            {Array.from({length: totalBytes}).map((_, i) => {
                                const isComplete = i < decryptedChars.length;
                                const isActive = i === decryptByteIndex && currentStep === LAB_STEPS.DECRYPT_XOR;
                                const cPair = interceptedCiphertext.substring(i * 2, (i * 2) + 2);
                                return (
                                    <div key={i} className={`flex flex-col items-center border ${isComplete ? 'border-success/50 bg-success/10' : isActive ? 'border-accent bg-accent/10 shadow-[0_0_10px_rgba(13,148,136,0.3)]' : 'border-osGlassBorder opacity-50'} p-2 w-16`}>
                                        <span className="font-mono text-xs text-textSecondary mb-1">{cPair}</span>
                                        <span className="font-mono text-sm text-textPrimary">{isComplete ? decryptedChars[i] : '..'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. EXTRACT PAYLOAD */}
                {currentStep >= LAB_STEPS.EXTRACT_PAYLOAD && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.EXTRACT_PAYLOAD ? 'opacity-100' : 'opacity-30 pointer-events-none'} pt-6 border-t border-osGlassBorder`}>
                        <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">2. Extract Payload Components</h3>
                        
                        {currentStep === LAB_STEPS.EXTRACT_PAYLOAD ? (
                            <button onClick={handleExtract} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                Split by '|' Separator
                            </button>
                        ) : (
                            <div className="flex gap-12 w-full justify-center animate-in zoom-in-95">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Extracted Message</span>
                                    <div className="bg-osBg border border-osGlassBorder px-6 py-3 font-mono text-textPrimary text-lg">
                                        {extractedMessage || <span className="text-warning text-sm">CORRUPTED</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Extracted Hash</span>
                                    <div className="bg-osBg border border-osGlassBorder px-6 py-3 font-mono text-textPrimary text-lg">
                                        {extractedHash || <span className="text-warning text-sm">CORRUPTED</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {currentStep > LAB_STEPS.EXTRACT_PAYLOAD && (
                            <button onClick={nextStep} className="os-button mt-8 text-success border-success/30 hover:bg-success/10 w-full">
                                Proceed to Hash Verification →
                            </button>
                        )}
                    </div>
                )}

                {/* ERROR FEEDBACK */}
                {errorMsg && (
                    <div className="mt-2 flex flex-col gap-2">
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
                                {decryptByteIndex === 0 ? "XOR produces 1 only when the two bits are different. 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0." :
                                 "Once you calculate the decimal XOR result, use an ASCII table to find the character."}
                            </div>
                        )}
                    </div>
                )}

            </div>
            
        </div>
    );
}
