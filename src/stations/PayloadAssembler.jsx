import React, { useState } from 'react';
import { useLab } from '../context/LabContext';

export default function PayloadAssembler() {
    const { message, studentModulo, assembledPayload, setAssembledPayload, nextStep } = useLab();
    
    const [msgSlot, setMsgSlot] = useState("");
    const [hashSlot, setHashSlot] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleAssemble = () => {
        if (msgSlot !== message || hashSlot !== studentModulo.toString()) {
            setErrorMsg("Incorrect payload components. Review the message and generated hash.");
            return;
        }
        
        setErrorMsg("");
        setAssembledPayload(`${message}|${studentModulo}`);
        nextStep();
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            
            <div className="text-center mb-8">
                <h2 className="text-xl font-mono uppercase tracking-widest text-textPrimary">Assemble Payload</h2>
                <p className="text-sm text-textSecondary mt-2 max-w-md">
                    Construct the final payload packet that will be transmitted.
                </p>
            </div>

            <div className="os-panel p-8 w-full max-w-2xl flex flex-col items-center gap-8">
                
                <div className="flex gap-12 w-full justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Source Message</span>
                        <div className="bg-osBg border border-osGlassBorder px-4 py-2 font-mono text-textPrimary">
                            {message}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Generated Hash</span>
                        <div className="bg-osBg border border-osGlassBorder px-4 py-2 font-mono text-textPrimary">
                            {studentModulo}
                        </div>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-osGlassBorder my-2" />

                <div className="flex flex-col items-center w-full gap-4">
                    <h3 className="text-[10px] uppercase tracking-widest font-mono text-textSecondary">Payload Assembly Tray</h3>
                    
                    {!assembledPayload ? (
                        <div className="flex items-center gap-4">
                            <input 
                                type="text"
                                className="os-input w-24 text-center"
                                placeholder="[MSG]"
                                value={msgSlot}
                                onChange={e => setMsgSlot(e.target.value)}
                            />
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-accent font-bold text-xl">|</span>
                                <span className="text-[8px] uppercase tracking-widest font-mono text-accent">Separator</span>
                            </div>
                            <input 
                                type="text"
                                className="os-input w-24 text-center"
                                placeholder="[HASH]"
                                value={hashSlot}
                                onChange={e => setHashSlot(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 animate-in zoom-in-95 duration-300">
                            <div className="bg-textPrimary text-osBg font-mono text-lg px-6 py-3 font-bold tracking-widest shadow-[0_0_15px_rgba(13,148,136,0.3)]">
                                {assembledPayload}
                            </div>
                        </div>
                    )}
                </div>

                {errorMsg && (
                    <div className="text-warning text-xs font-mono bg-warning/10 p-3 border border-warning/20">
                        ✕ {errorMsg}
                    </div>
                )}

                {!assembledPayload && (
                    <button onClick={handleAssemble} className="os-button mt-4 text-accent border-accent/30 hover:bg-accent/10">
                        Create Payload Packet
                    </button>
                )}

                {assembledPayload && (
                    <button onClick={nextStep} className="os-button mt-4 text-success border-success/30 hover:bg-success/10">
                        Proceed to Encryption →
                    </button>
                )}

            </div>
            
        </div>
    );
}
