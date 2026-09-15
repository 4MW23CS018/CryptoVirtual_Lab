import React, { createContext, useContext, useState, useMemo } from 'react';

export const LAB_STEPS = {
    SETUP: 0,
    HASH_ASCII: 1,
    HASH_SUM: 2,
    HASH_MODULO: 3,
    CREATE_PAYLOAD: 4,
    INSERT_KEY: 5,
    ENCRYPT_XOR: 6,
    ASSEMBLE_CIPHERTEXT: 7,
    TRANSMIT: 8,
    INTERCEPT: 9,
    DECRYPT_XOR: 10,
    EXTRACT_PAYLOAD: 11,
    VERIFY_HASH_ASCII: 12,
    VERIFY_HASH_SUM: 13,
    VERIFY_HASH_MODULO: 14,
    COMPARE_HASHES: 15,
    COMPLETE: 16
};

const LabContext = createContext(null);

export const LabProvider = ({ children }) => {
    // Current step pointer
    const [currentStep, setCurrentStep] = useState(LAB_STEPS.SETUP);

    // Core Data
    const [message, setMessage] = useState("ABC");
    const [secretKey, setSecretKey] = useState("KEY");
    const [modulo, setModulo] = useState(100);

    // Hash Station Data
    const [studentAsciiMap, setStudentAsciiMap] = useState({});
    const [studentSum, setStudentSum] = useState("");
    const [studentModulo, setStudentModulo] = useState("");

    // Payload Station
    const [assembledPayload, setAssembledPayload] = useState("");

    // Encrypt Station
    const [encryptByteIndex, setEncryptByteIndex] = useState(0);
    const [encryptedHexBytes, setEncryptedHexBytes] = useState([]); // Student's successfully XOR'd bytes
    const [finalCiphertext, setFinalCiphertext] = useState("");

    // Transmission & Intercept
    const [interceptedCiphertext, setInterceptedCiphertext] = useState("");
    
    // Decrypt Station
    const [decryptByteIndex, setDecryptByteIndex] = useState(0);
    const [decryptedChars, setDecryptedChars] = useState([]); // Student's successfully decrypted chars
    
    // Verification Station
    const [extractedMessage, setExtractedMessage] = useState("");
    const [extractedHash, setExtractedHash] = useState("");
    const [verifyAsciiMap, setVerifyAsciiMap] = useState({});
    const [verifySum, setVerifySum] = useState("");
    const [verifyModulo, setVerifyModulo] = useState("");

    // Helper to advance state
    const nextStep = () => {
        if (currentStep < LAB_STEPS.COMPLETE) {
            setCurrentStep(s => s + 1);
        }
    };

    const value = {
        currentStep, setCurrentStep, nextStep,
        
        message, setMessage,
        secretKey, setSecretKey,
        modulo, setModulo,

        studentAsciiMap, setStudentAsciiMap,
        studentSum, setStudentSum,
        studentModulo, setStudentModulo,

        assembledPayload, setAssembledPayload,

        encryptByteIndex, setEncryptByteIndex,
        encryptedHexBytes, setEncryptedHexBytes,
        finalCiphertext, setFinalCiphertext,

        interceptedCiphertext, setInterceptedCiphertext,

        decryptByteIndex, setDecryptByteIndex,
        decryptedChars, setDecryptedChars,

        extractedMessage, setExtractedMessage,
        extractedHash, setExtractedHash,
        
        verifyAsciiMap, setVerifyAsciiMap,
        verifySum, setVerifySum,
        verifyModulo, setVerifyModulo
    };

    return (
        <LabContext.Provider value={value}>
            {children}
        </LabContext.Provider>
    );
};

export const useLab = () => useContext(LabContext);
