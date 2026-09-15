import React, { useState, useEffect } from 'react';
import { useLab, LAB_STEPS } from '../context/LabContext';
import { toBinary } from '../utils/cryptoLogic';

export default function EncryptionStation() {
    const { 
        currentStep, nextStep, assembledPayload, secretKey,
        encryptByteIndex, setEncryptByteIndex,
        encryptedHexBytes, setEncryptedHexBytes,
        finalCiphertext, setFinalCiphertext
    } = useLab();
    
    // State for INSERT_KEY
    const [insertedKey, setInsertedKey] = useState("");
    
    // State for ENCRYPT_XOR bit toggles (Byte 01 only)
    const [bitToggles, setBitToggles] = useState(Array(8).fill(0));
    
    // State for ENCRYPT_XOR manual byte entry (subsequent bytes)
    const [byteInput, setByteInput] = useState("");
    
    const [errorMsg, setErrorMsg] = useState("");
    const [showHint, setShowHint] = useState(false);

    // Derived properties for current byte
    const payloadChar = assembledPayload[encryptByteIndex] || "";
    const payloadVal = payloadChar.charCodeAt(0) || 0;
    const keyChar = secretKey[encryptByteIndex % secretKey.length] || "";
    const keyVal = keyChar.charCodeAt(0) || 0;
    const trueXorResult = payloadVal ^ keyVal;

    useEffect(() => { setErrorMsg(""); setShowHint(false); }, [currentStep, encryptByteIndex]);

    const handleInsertKey = () => {
        if (insertedKey === secretKey) {
            nextStep();
        } else {
            setErrorMsg("Incorrect secret key. Review your initialization parameters.");
        }
    };

    const toggleBit = (idx) => {
        const newBits = [...bitToggles];
        newBits[idx] = newBits[idx] === 0 ? 1 : 0;
        setBitToggles(newBits);
    };

    const checkBitXor = () => {
        const studentBinary = bitToggles.join('');
        const trueBinary = toBinary(trueXorResult);
        
        if (studentBinary === trueBinary) {
            handleByteSuccess(trueXorResult);
        } else {
            setErrorMsg("Incorrect binary result. Remember the XOR rules.");
        }
    };

    const checkByteInput = () => {
        if (parseInt(byteInput) === trueXorResult) {
            handleByteSuccess(trueXorResult);
        } else {
            setErrorMsg(`Incorrect XOR result for ${payloadVal} ⊕ ${keyVal}.`);
        }
    };

    const handleByteSuccess = (resultVal) => {
        let hexVal = resultVal.toString(16);
        if (hexVal.length < 2) hexVal = "0" + hexVal;
        
        const newBytes = [...encryptedHexBytes, hexVal];
        setEncryptedHexBytes(newBytes);
        
        if (encryptByteIndex + 1 < assembledPayload.length) {
            setEncryptByteIndex(i => i + 1);
            setBitToggles(Array(8).fill(0));
            setByteInput("");
        } else {
            nextStep();
        }
    };

    const assembleCiphertext = () => {
        setFinalCiphertext(encryptedHexBytes.join(''));
        nextStep();
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            
            <div className="text-center mb-8">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Encryption Station</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Perform byte-by-byte XOR encryption using the payload and secret key.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-3xl flex flex-col gap-10">
                
                {/* 1. KEY INSERTION */}
                <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.INSERT_KEY ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">1. Load Secret Key</h3>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-sm text-textPrimary bg-osBg border border-osGlassBorder px-4 py-2">
                            Payload: {assembledPayload}
                        </span>
                        <span className="text-textSecondary font-mono">⊕</span>
                        <input 
                            type="text"
                            className="os-input w-32 text-center uppercase"
                            placeholder="SECRET KEY"
                            value={insertedKey}
                            onChange={e => setInsertedKey(e.target.value.toUpperCase())}
                            disabled={currentStep > LAB_STEPS.INSERT_KEY}
                        />
                    </div>
                    {currentStep === LAB_STEPS.INSERT_KEY && (
                        <button onClick={handleInsertKey} className="os-button mt-6 text-accent border-accent/30 hover:bg-accent/10">
                            Insert Key
                        </button>
                    )}
                </div>

                {/* 2. XOR ENGINE */}
                {currentStep >= LAB_STEPS.ENCRYPT_XOR && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.ENCRYPT_XOR ? 'opacity-100' : 'opacity-30 pointer-events-none'} pt-6 border-t border-osGlassBorder`}>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">
                                2. XOR Encryptor (Byte {encryptByteIndex + 1} of {assembledPayload.length})
                            </h3>
                            {secretKey.length < assembledPayload.length && (
                                <span className="text-[9px] uppercase tracking-widest font-mono text-accent bg-accent/10 px-2 py-1">
                                    Key repeats across payload
                                </span>
                            )}
                        </div>

                        {currentStep === LAB_STEPS.ENCRYPT_XOR && (
                            <div className="bg-osBg border border-osGlassBorder p-6 mb-8 flex flex-col gap-6">
                                
                                <div className="flex justify-between items-center w-full px-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-textSecondary uppercase tracking-widest">Plaintext Byte</span>
                                        <span className="font-mono text-xl text-textPrimary">{payloadChar}</span>
                                        <span className="font-mono text-xs text-textSecondary">(Dec: {payloadVal})</span>
                                        {encryptByteIndex === 0 && <span className="font-mono text-xs tracking-widest mt-2">{toBinary(payloadVal)}</span>}
                                    </div>
                                    <div className="font-mono text-2xl text-accent">⊕</div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-textSecondary uppercase tracking-widest">Key Byte</span>
                                        <span className="font-mono text-xl text-textPrimary">{keyChar}</span>
                                        <span className="font-mono text-xs text-textSecondary">(Dec: {keyVal})</span>
                                        {encryptByteIndex === 0 && <span className="font-mono text-xs tracking-widest mt-2">{toBinary(keyVal)}</span>}
                                    </div>
                                </div>
                                
                                <div className="w-full h-[1px] bg-osGlassBorder" />
                                
                                {encryptByteIndex === 0 ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-[10px] text-accent uppercase tracking-widest">Toggle Bits to solve XOR</span>
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
                                        <span className="text-[10px] text-accent uppercase tracking-widest">Calculate XOR Result (Decimal)</span>
                                        <div className="flex items-center gap-4 font-mono">
                                            <span>{payloadVal} ⊕ {keyVal} =</span>
                                            <input 
                                                type="number" 
                                                value={byteInput}
                                                onChange={e => setByteInput(e.target.value)}
                                                className="os-input w-24 text-center"
                                                placeholder="?"
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-4">
                                            <button onClick={checkByteInput} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                                Check Byte
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    let fastForwardHex = [...encryptedHexBytes];
                                                    for (let i = encryptByteIndex; i < assembledPayload.length; i++) {
                                                        const pVal = assembledPayload.charCodeAt(i);
                                                        const kVal = secretKey.charCodeAt(i % secretKey.length);
                                                        let h = (pVal ^ kVal).toString(16);
                                                        if (h.length < 2) h = "0" + h;
                                                        fastForwardHex.push(h);
                                                    }
                                                    setEncryptedHexBytes(fastForwardHex);
                                                    setEncryptByteIndex(assembledPayload.length);
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
                            {assembledPayload.split('').map((char, i) => {
                                const isComplete = i < encryptedHexBytes.length;
                                const isActive = i === encryptByteIndex && currentStep === LAB_STEPS.ENCRYPT_XOR;
                                return (
                                    <div key={i} className={`flex flex-col items-center border ${isComplete ? 'border-success/50 bg-success/10' : isActive ? 'border-accent bg-accent/10 shadow-[0_0_10px_rgba(13,148,136,0.3)]' : 'border-osGlassBorder opacity-50'} p-2 w-16`}>
                                        <span className="font-mono text-xs text-textSecondary mb-1">{char}</span>
                                        <span className="font-mono text-sm text-textPrimary">{isComplete ? encryptedHexBytes[i] : '..'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. ASSEMBLE CIPHERTEXT */}
                {currentStep >= LAB_STEPS.ASSEMBLE_CIPHERTEXT && (
                    <div className={`transition-opacity duration-300 ${currentStep >= LAB_STEPS.ASSEMBLE_CIPHERTEXT ? 'opacity-100' : 'opacity-30 pointer-events-none'} pt-6 border-t border-osGlassBorder`}>
                        <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary mb-4">3. Assemble Ciphertext</h3>
                        
                        {currentStep === LAB_STEPS.ASSEMBLE_CIPHERTEXT ? (
                            <button onClick={assembleCiphertext} className="os-button text-accent border-accent/30 hover:bg-accent/10">
                                Combine Bytes into Packet
                            </button>
                        ) : (
                            <div className="bg-textPrimary text-osBg font-mono text-lg px-6 py-3 font-bold tracking-widest shadow-[0_0_15px_rgba(13,148,136,0.3)] text-center break-all">
                                {finalCiphertext}
                            </div>
                        )}
                        
                        {currentStep > LAB_STEPS.ASSEMBLE_CIPHERTEXT && (
                            <button onClick={nextStep} className="os-button mt-6 text-success border-success/30 hover:bg-success/10 w-full">
                                Proceed to Transmission →
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
                                {currentStep === LAB_STEPS.INSERT_KEY ? "The secret key must match what you typed in Setup." : 
                                 encryptByteIndex === 0 ? "XOR produces 1 only when the two bits are different. 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0." :
                                 "You can convert decimal to binary mentally or using a calculator, XOR the bits, and convert back."}
                            </div>
                        )}
                    </div>
                )}

            </div>
            
        </div>
    );
}
