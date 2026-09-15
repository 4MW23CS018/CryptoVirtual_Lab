import React from 'react';
import { useLab, LAB_STEPS } from './context/LabContext';
import SetupStation from './stations/SetupStation';
import HashStation from './stations/HashStation';
import PayloadAssembler from './stations/PayloadAssembler';
import EncryptionStation from './stations/EncryptionStation';
import TransmissionStation from './stations/TransmissionStation';
import DecryptionStation from './stations/DecryptionStation';
import VerificationStation from './stations/VerificationStation';

function App() {
    const { currentStep } = useLab();

    return (
        <div className="min-h-screen bg-osBg text-textPrimary flex flex-col font-sans selection:bg-accent/30 overflow-hidden">
            
            {/* Header: CRYPTO.OS Identity */}
            <header className="flex items-center justify-between px-6 py-3 bg-osSurface border-b border-osGlassBorder shadow-md relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
                    <div>
                        <h1 className="font-mono text-sm tracking-widest font-bold uppercase">CRYPTO.OS</h1>
                        <p className="text-[10px] text-textSecondary uppercase tracking-widest mt-0.5">Cryptography Virtual Laboratory</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 font-mono text-[10px] text-textSecondary uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span>Status:</span>
                        <span className={currentStep === LAB_STEPS.COMPLETE ? "text-success" : "text-accent"}>
                            {currentStep === LAB_STEPS.COMPLETE ? "COMPLETE" : "IN_PROGRESS"}
                        </span>
                    </div>
                    <div>Session ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar Navigation / Process List */}
                <nav className="w-64 bg-osSurface border-r border-osGlassBorder p-6 flex flex-col gap-6 relative z-10 shrink-0">
                    <h2 className="font-mono text-[10px] uppercase tracking-widest text-textSecondary border-b border-osGlassBorder pb-2">Active Processes</h2>
                    <ul className="flex flex-col gap-3 font-mono text-xs">
                        <ProcessItem label="Prepare Message" activeRange={[LAB_STEPS.SETUP]} currentStep={currentStep} />
                        <ProcessItem label="Generate Hash" activeRange={[LAB_STEPS.HASH_ASCII, LAB_STEPS.HASH_SUM, LAB_STEPS.HASH_MODULO]} currentStep={currentStep} />
                        <ProcessItem label="Assemble Payload" activeRange={[LAB_STEPS.CREATE_PAYLOAD]} currentStep={currentStep} />
                        <ProcessItem label="Encrypt Data" activeRange={[LAB_STEPS.INSERT_KEY, LAB_STEPS.ENCRYPT_XOR, LAB_STEPS.ASSEMBLE_CIPHERTEXT]} currentStep={currentStep} />
                        <ProcessItem label="Transmit" activeRange={[LAB_STEPS.TRANSMIT, LAB_STEPS.INTERCEPT]} currentStep={currentStep} />
                        <ProcessItem label="Decrypt Data" activeRange={[LAB_STEPS.DECRYPT_XOR, LAB_STEPS.EXTRACT_PAYLOAD]} currentStep={currentStep} />
                        <ProcessItem label="Verify Hash" activeRange={[LAB_STEPS.VERIFY_HASH_ASCII, LAB_STEPS.VERIFY_HASH_SUM, LAB_STEPS.VERIFY_HASH_MODULO, LAB_STEPS.COMPARE_HASHES, LAB_STEPS.COMPLETE]} currentStep={currentStep} />
                    </ul>
                </nav>

                {/* Main Workspace Area */}
                <main className="flex-1 relative bg-osBg p-8 overflow-y-auto overflow-x-hidden flex justify-center items-start">
                    {currentStep === LAB_STEPS.SETUP && <SetupStation />}
                    {currentStep >= LAB_STEPS.HASH_ASCII && currentStep <= LAB_STEPS.HASH_MODULO && <HashStation />}
                    {currentStep === LAB_STEPS.CREATE_PAYLOAD && <PayloadAssembler />}
                    {currentStep >= LAB_STEPS.INSERT_KEY && currentStep <= LAB_STEPS.ASSEMBLE_CIPHERTEXT && <EncryptionStation />}
                    {currentStep >= LAB_STEPS.TRANSMIT && currentStep <= LAB_STEPS.INTERCEPT && <TransmissionStation />}
                    {currentStep >= LAB_STEPS.DECRYPT_XOR && currentStep <= LAB_STEPS.EXTRACT_PAYLOAD && <DecryptionStation />}
                    {currentStep >= LAB_STEPS.VERIFY_HASH_ASCII && currentStep <= LAB_STEPS.COMPLETE && <VerificationStation />}
                </main>

            </div>
        </div>
    );
}

// Helper component for the navigation
const ProcessItem = ({ label, activeRange, currentStep }) => {
    const isCompleted = currentStep > Math.max(...activeRange);
    const isActive = activeRange.includes(currentStep);
    
    let colorClass = "text-textSecondary/50";
    let icon = "○";
    
    if (isCompleted) {
        colorClass = "text-textSecondary line-through opacity-50";
        icon = "✓";
    } else if (isActive) {
        colorClass = "text-textPrimary font-bold";
        icon = "●";
    }

    return (
        <li className={`flex items-center gap-3 transition-colors ${colorClass}`}>
            <span className={isActive ? "text-accent" : ""}>{icon}</span>
            <span>{label}</span>
        </li>
    );
};

export default App;
