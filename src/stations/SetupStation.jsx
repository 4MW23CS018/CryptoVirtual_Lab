import React, { useState } from 'react';
import { useLab, LAB_STEPS } from '../context/LabContext';

export default function SetupStation() {
    const { message, setMessage, secretKey, setSecretKey, modulo, setModulo, nextStep } = useLab();
    
    // Local state to safely handle input before checking
    const [localMsg, setLocalMsg] = useState(message);
    const [localKey, setLocalKey] = useState(secretKey);
    const [errorMsg, setErrorMsg] = useState("");

    const handleConfirm = () => {
        if (!localMsg || !localKey) {
            setErrorMsg("Message and Key are required.");
            return;
        }
        if (localMsg.length > 8) {
            setErrorMsg("Keep the message 8 characters or fewer to avoid calculation fatigue.");
            return;
        }
        if (localMsg.includes("|")) {
            setErrorMsg("The pipe '|' character is reserved as a payload separator. Please remove it.");
            return;
        }
        
        setErrorMsg("");
        setMessage(localMsg);
        setSecretKey(localKey);
        nextStep();
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
            
            <div className="text-center mb-10">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Initialize Parameters</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Define the plaintext message, the secret key, and the modulo constant N used for hashing.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-sm flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Plaintext Message</label>
                    <input 
                        type="text" 
                        value={localMsg}
                        onChange={(e) => setLocalMsg(e.target.value.toUpperCase())}
                        className="os-input"
                        placeholder="e.g. ABC"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Secret Key</label>
                    <input 
                        type="text" 
                        value={localKey}
                        onChange={(e) => setLocalKey(e.target.value.toUpperCase())}
                        className="os-input"
                        placeholder="e.g. KEY"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Modulo (N)</label>
                    <input 
                        type="number" 
                        value={modulo}
                        onChange={(e) => setModulo(parseInt(e.target.value) || 0)}
                        className="os-input"
                        placeholder="100"
                    />
                </div>
                
                {errorMsg && (
                    <div className="text-warning text-xs font-mono bg-warning/10 p-2 border border-warning/20">
                        {errorMsg}
                    </div>
                )}

                <button onClick={handleConfirm} className="os-button mt-4 text-accent border-accent/30 hover:bg-accent/10">
                    Initialize System
                </button>
            </div>
            
        </div>
    );
}
