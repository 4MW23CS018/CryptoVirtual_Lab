export const toBinary = (val, padding = 8) => {
    return val.toString(2).padStart(padding, '0');
};

export const calculateModuloHash = (message, modulo) => {
    if (!message || modulo <= 0) return { sum: 0, hash: null, chars: [] };
    
    let sum = 0;
    const chars = [];
    
    for (let i = 0; i < message.length; i++) {
        const val = message.charCodeAt(i);
        sum += val;
        chars.push({ char: message[i], val });
    }
    
    return {
        sum,
        hash: sum % modulo,
        chars
    };
};

export const xorEncrypt = (payload, secretKey) => {
    if (!payload || !secretKey) return "";
    let ciphertext = "";
    
    for (let i = 0; i < payload.length; i++) {
        const payloadVal = payload.charCodeAt(i);
        const keyVal = secretKey.charCodeAt(i % secretKey.length);
        const xorVal = payloadVal ^ keyVal;
        
        // Convert to 2-digit hex
        let hexVal = xorVal.toString(16);
        if (hexVal.length < 2) hexVal = "0" + hexVal;
        ciphertext += hexVal;
    }
    
    return ciphertext;
};

export const xorDecrypt = (ciphertext, secretKey) => {
    if (!ciphertext || !secretKey || ciphertext.length % 2 !== 0) return "";
    let plaintext = "";
    
    for (let i = 0; i < ciphertext.length; i += 2) {
        const hexPair = ciphertext.substring(i, i + 2);
        const cipherVal = parseInt(hexPair, 16);
        const keyIndex = (i / 2) % secretKey.length;
        const keyVal = secretKey.charCodeAt(keyIndex);
        
        const decodedVal = cipherVal ^ keyVal;
        plaintext += String.fromCharCode(decodedVal);
    }
    
    return plaintext;
};

export const verifyHash = (message, receivedHash, modulo) => {
    const { hash: recalculatedHash } = calculateModuloHash(message, modulo);
    return recalculatedHash !== null && recalculatedHash.toString() === receivedHash.toString();
};
