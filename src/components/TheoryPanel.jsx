import PropTypes from 'prop-types';
import { useLab, LAB_STEPS } from '../context/LabContext';
import { calculateModuloHash, toBinary } from '../utils/cryptoLogic';

export default function TheoryPanel() {
    const {
        currentStep,
        message,
        secretKey,
        modulo,
        studentAsciiMap,
        studentSum,
        studentModulo,
        assembledPayload,
        encryptByteIndex,
        encryptedHexBytes,
        finalCiphertext,
        interceptedCiphertext,
        decryptByteIndex,
        decryptedChars,
        extractedMessage,
        extractedHash,
        verifyAsciiMap,
        verifySum,
        verifyModulo
    } = useLab();

    // 1. SETUP STAGE
    if (currentStep === LAB_STEPS.SETUP) {
        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader title="INITIALIZE PARAMETERS" subtitle="Station 01 • Parameter Setup" />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        Configure the cryptographic session parameters. The <span className="font-mono text-accent">Plaintext Message</span> is your confidential input, the <span className="font-mono text-accent">Secret Key</span> is applied repeatedly for symmetric XOR encryption, and positive modulus <span className="font-mono text-accent">N</span> bounds the hash function output range.
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm text-accent">
                        H(M) = (Σ ASCII(Mᵢ)) mod N
                    </div>
                    <p className="text-xs text-textSecondary mt-2">
                        Hash function maps arbitrary message characters to an integer in the interval <span className="font-mono text-textPrimary">[0, N - 1]</span> by accumulating 7-bit/8-bit ASCII ordinal values.
                    </p>
                </Section>

                <Section label="LIVE VALUES">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                        <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block">Plaintext (M)</span>
                            <span className="text-textPrimary text-sm font-semibold">{message || "—"}</span>
                            <span className="text-[10px] text-textSecondary block mt-0.5">{message.length} byte(s)</span>
                        </div>
                        <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block">Secret Key (K)</span>
                            <span className="text-textPrimary text-sm font-semibold">{secretKey || "—"}</span>
                            <span className="text-[10px] text-textSecondary block mt-0.5">{secretKey.length} byte(s)</span>
                        </div>
                        <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block">Modulus (N)</span>
                            <span className="text-textPrimary text-sm font-semibold">{modulo > 0 ? modulo : "—"}</span>
                            <span className="text-[10px] text-textSecondary block mt-0.5">Range: 0 to {Math.max(0, modulo - 1)}</span>
                        </div>
                    </div>
                </Section>

                <Section label="RESULT & OVERVIEW">
                    <div className="text-xs font-mono text-textSecondary bg-osBg/70 border border-osGlassBorder p-3 rounded leading-relaxed">
                        Workflow: Plaintext <span className="text-accent">{message}</span> will be hashed modulo <span className="text-accent">{modulo}</span>, assembled into payload <span className="text-textPrimary">{message}|H(M)</span>, XOR-encrypted with key <span className="text-accent">{secretKey}</span> into hex bytes, transmitted, decrypted, and verified against tampering.
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        The hash used here is a deliberately simple sum-based pedagogical algorithm. It is collision-prone (e.g. anagrams like &quot;AB&quot; and &quot;BA&quot; generate identical sums) and is not a cryptographically secure hash function like SHA-256.
                    </div>
                </Section>
            </aside>
        );
    }

    // 2. HASH STATIONS (ASCII, SUM, MODULO)
    if (currentStep >= LAB_STEPS.HASH_ASCII && currentStep <= LAB_STEPS.HASH_MODULO) {
        const trueHashData = calculateModuloHash(message, modulo);
        const stageName = currentStep === LAB_STEPS.HASH_ASCII
            ? "Stage 1/3: ASCII Conversion"
            : currentStep === LAB_STEPS.HASH_SUM
                ? "Stage 2/3: Summation"
                : "Stage 3/3: Modulo Remainder";

        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader title="GENERATE MODULO HASH" subtitle={`Station 02 • ${stageName}`} />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        {currentStep === LAB_STEPS.HASH_ASCII && (
                            <>Every character of plaintext <span className="font-mono text-accent">&quot;{message}&quot;</span> is mapped to its numerical 8-bit ASCII / UTF-8 code point before arithmetic operations can be performed.</>
                        )}
                        {currentStep === LAB_STEPS.HASH_SUM && (
                            <>Accumulate all individual character ASCII code points into a single composite integer sum <span className="font-mono text-accent">Σ ASCII(Mᵢ)</span>.</>
                        )}
                        {currentStep === LAB_STEPS.HASH_MODULO && (
                            <>Compute the Euclidean remainder of the accumulated ASCII sum divided by modulus <span className="font-mono text-accent">N = {modulo}</span> to produce the final digest.</>
                        )}
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm space-y-1.5">
                        <div className={currentStep === LAB_STEPS.HASH_ASCII ? "text-accent font-bold" : "text-textSecondary"}>
                            1. ASCII(c) = Ordinal value of character c
                        </div>
                        <div className={currentStep === LAB_STEPS.HASH_SUM ? "text-accent font-bold" : "text-textSecondary"}>
                            2. S = Σᵢ ASCII(M[i]) = {trueHashData.chars.map(c => c.val).join(' + ') || "0"}
                        </div>
                        <div className={currentStep === LAB_STEPS.HASH_MODULO ? "text-accent font-bold" : "text-textSecondary"}>
                            3. H(M) = S mod N = {trueHashData.sum} mod {modulo}
                        </div>
                    </div>
                </Section>

                <Section label="LIVE VALUES">
                    <div className="space-y-3 font-mono text-xs">
                        <div className="bg-osBg border border-osGlassBorder p-3 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block mb-2">Character ASCII Mapping</span>
                            <div className="flex flex-wrap gap-2">
                                {trueHashData.chars.map((item, idx) => {
                                    const entered = studentAsciiMap[idx];
                                    const isCorrect = entered !== undefined && entered === item.val.toString();
                                    return (
                                        <div key={idx} className={`px-2.5 py-1.5 rounded border text-center ${currentStep === LAB_STEPS.HASH_ASCII ? 'border-accent/40 bg-accent/10' : 'border-osGlassBorder bg-osSurface'}`}>
                                            <span className="text-textPrimary font-bold block">{item.char}</span>
                                            <span className="text-[10px] text-textSecondary block">ASCII: {item.val}</span>
                                            {entered !== undefined && (
                                                <span className={`text-[10px] block font-semibold ${isCorrect ? 'text-success' : 'text-warning'}`}>
                                                    input: {entered || "—"}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className={`p-2.5 rounded border ${currentStep === LAB_STEPS.HASH_SUM ? 'border-accent/40 bg-accent/10' : 'border-osGlassBorder bg-osBg'}`}>
                                <span className="text-[10px] text-textSecondary uppercase block">Expected Sum (S)</span>
                                <span className="text-sm font-semibold text-textPrimary">{trueHashData.sum}</span>
                                {studentSum && (
                                    <span className={`text-[10px] block mt-0.5 ${parseInt(studentSum) === trueHashData.sum ? 'text-success' : 'text-warning'}`}>
                                        Active Input: {studentSum}
                                    </span>
                                )}
                            </div>
                            <div className={`p-2.5 rounded border ${currentStep === LAB_STEPS.HASH_MODULO ? 'border-accent/40 bg-accent/10' : 'border-osGlassBorder bg-osBg'}`}>
                                <span className="text-[10px] text-textSecondary uppercase block">Hash: S mod {modulo}</span>
                                <span className="text-sm font-semibold text-textPrimary">{trueHashData.hash}</span>
                                {studentModulo && (
                                    <span className={`text-[10px] block mt-0.5 ${parseInt(studentModulo) === trueHashData.hash ? 'text-success' : 'text-warning'}`}>
                                        Active Input: {studentModulo}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                <Section label="RESULT">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-xs flex items-center justify-between">
                        <span className="text-textSecondary">Calculated Digest H(&quot;{message}&quot;):</span>
                        <span className="text-accent text-sm font-bold">
                            {currentStep === LAB_STEPS.HASH_MODULO && studentModulo === trueHashData.hash?.toString()
                                ? studentModulo
                                : `${trueHashData.hash} (expected)`}
                        </span>
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        A modulus operation compresses an arbitrarily large integer sum into a fixed range [0, N - 1]. However, because addition is commutative, any permutation of the characters (e.g., &quot;ABC&quot; vs &quot;CBA&quot;) produces the exact same hash value.
                    </div>
                </Section>
            </aside>
        );
    }

    // 3. PAYLOAD ASSEMBLY
    if (currentStep === LAB_STEPS.CREATE_PAYLOAD) {
        const expectedHash = studentModulo !== "" ? studentModulo : (calculateModuloHash(message, modulo).hash ?? "");
        const expectedPayload = `${message}|${expectedHash}`;

        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader title="PAYLOAD ASSEMBLY" subtitle="Station 03 • Serialization & Delimiting" />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        To enable the receiver to verify message integrity upon arrival, both the plaintext message and its generated checksum must travel together in a single packet. They are serialized with an unambiguous delimiter character <span className="font-mono text-accent">&apos;|&apos;</span>.
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm text-accent">
                        PAYLOAD = MESSAGE || &quot;|&quot; || HASH
                    </div>
                    <p className="text-xs text-textSecondary mt-2">
                        String concatenation ensures both data and authenticator are protected under the symmetric cipher stream.
                    </p>
                </Section>

                <Section label="LIVE VALUES">
                    <div className="space-y-2 font-mono text-xs">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-osBg border border-osGlassBorder p-2 rounded">
                                <span className="text-[10px] text-textSecondary uppercase block">MESSAGE</span>
                                <span className="text-textPrimary font-semibold">{message}</span>
                            </div>
                            <div className="bg-osBg border border-accent/40 p-2 rounded text-center">
                                <span className="text-[10px] text-accent uppercase block">DELIMITER</span>
                                <span className="text-accent font-bold text-base">|</span>
                            </div>
                            <div className="bg-osBg border border-osGlassBorder p-2 rounded">
                                <span className="text-[10px] text-textSecondary uppercase block">HASH</span>
                                <span className="text-textPrimary font-semibold">{expectedHash}</span>
                            </div>
                        </div>

                        <div className="bg-osBg border border-osGlassBorder p-3 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block mb-1">Target Assembled Payload</span>
                            <span className="text-textPrimary text-sm font-semibold tracking-wider">{expectedPayload}</span>
                            <span className="text-[10px] text-textSecondary block mt-1">Total Payload Length: {expectedPayload.length} bytes</span>
                        </div>
                    </div>
                </Section>

                <Section label="RESULT">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-xs flex items-center justify-between">
                        <span className="text-textSecondary">Active Tray Payload:</span>
                        <span className={assembledPayload ? "text-success font-bold" : "text-textSecondary"}>
                            {assembledPayload || "Awaiting assembly..."}
                        </span>
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        The delimiter <span className="font-mono text-accent">&apos;|&apos;</span> is reserved and disallowed in plaintext input so the receiver can reliably separate payload tokens. Notice the delimiter itself will also be encrypted byte-by-byte during the next phase.
                    </div>
                </Section>
            </aside>
        );
    }

    // 4. ENCRYPTION STATION (INSERT_KEY, ENCRYPT_XOR, ASSEMBLE_CIPHERTEXT)
    if (currentStep >= LAB_STEPS.INSERT_KEY && currentStep <= LAB_STEPS.ASSEMBLE_CIPHERTEXT) {
        const payloadToEncrypt = assembledPayload || `${message}|${studentModulo || calculateModuloHash(message, modulo).hash || 0}`;
        const totalPayloadLen = payloadToEncrypt.length;
        const validByteIdx = Math.min(encryptByteIndex, Math.max(0, totalPayloadLen - 1));

        const payloadChar = payloadToEncrypt[validByteIdx] || "";
        const payloadVal = payloadChar.charCodeAt(0) || 0;
        const keyIndex = secretKey.length > 0 ? (validByteIdx % secretKey.length) : 0;
        const keyChar = secretKey[keyIndex] || "";
        const keyVal = keyChar.charCodeAt(0) || 0;
        const xorResultVal = payloadVal ^ keyVal;
        let hexVal = xorResultVal.toString(16).toUpperCase();
        if (hexVal.length < 2) hexVal = "0" + hexVal;

        const payloadBinary = toBinary(payloadVal, 8);
        const keyBinary = toBinary(keyVal, 8);
        const xorBinary = toBinary(xorResultVal, 8);

        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader
                    title="ENCRYPTION STATION"
                    subtitle={`Station 04 • Byte ${validByteIdx + 1} of ${totalPayloadLen || 1}`}
                />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        Symmetric bitwise XOR encryption is applied to each byte of the serialized payload against the repeating secret key stream.
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm space-y-1">
                        <div className="text-accent font-bold">P ⊕ K = C</div>
                        <div className="text-xs text-textSecondary font-normal">
                            Key schedule index: <span className="text-textPrimary font-mono">i mod len(K) = {validByteIdx} mod {secretKey.length || 1} = {keyIndex}</span> (&apos;{keyChar}&apos;)
                        </div>
                    </div>
                </Section>

                <Section label="LIVE VALUES (ACTIVE BYTE)">
                    <div className="space-y-3 font-mono text-xs">
                        <div className="bg-osBg border border-osGlassBorder p-3 rounded space-y-2">
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Payload byte [idx {validByteIdx}]:</span>
                                <span className="text-textPrimary font-semibold">&apos;{payloadChar}&apos; (dec: {payloadVal})</span>
                            </div>
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Binary Payload:</span>
                                <span className="text-accent">{payloadBinary}</span>
                            </div>
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Repeating Key [idx {keyIndex}]:</span>
                                <span className="text-textPrimary font-semibold">&apos;{keyChar}&apos; (dec: {keyVal})</span>
                            </div>
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Binary Key:</span>
                                <span className="text-accent">{keyBinary}</span>
                            </div>
                            <div className="border-t border-osGlassBorder pt-2 flex justify-between items-center">
                                <span className="text-textSecondary">XOR Output (Binary):</span>
                                <span className="text-success font-bold tracking-wider">{xorBinary}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-textSecondary">XOR Decimal & Hex:</span>
                                <span className="text-success font-bold">{payloadVal} ⊕ {keyVal} = {xorResultVal} (0x{hexVal})</span>
                            </div>
                        </div>

                        {/* Repeating key stream visualization */}
                        <div className="bg-osBg border border-osGlassBorder p-3 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block mb-1.5">Key Repetition Stream</span>
                            <div className="flex flex-wrap gap-1">
                                {payloadToEncrypt.split('').map((ch, i) => {
                                    const kCh = secretKey[i % secretKey.length] || "?";
                                    const isCurrent = i === validByteIdx;
                                    const isDone = i < encryptedHexBytes.length;
                                    return (
                                        <div
                                            key={i}
                                            className={`px-1.5 py-1 text-center rounded border ${
                                                isCurrent
                                                    ? 'border-accent bg-accent/20 text-accent font-bold'
                                                    : isDone
                                                        ? 'border-success/30 bg-success/5 text-textSecondary'
                                                        : 'border-osGlassBorder text-textSecondary/60'
                                            }`}
                                        >
                                            <div className="text-[10px]">{ch}</div>
                                            <div className="text-[10px] text-accent/80">⊕{kCh}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Section>

                <Section label="RESULT">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-xs space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-textSecondary">Encrypted Bytes:</span>
                            <span className="text-textPrimary">{encryptedHexBytes.join(' ') || "None yet"}</span>
                        </div>
                        {finalCiphertext && (
                            <div className="flex justify-between items-center pt-1 border-t border-osGlassBorder">
                                <span className="text-textSecondary">Final Ciphertext Hex:</span>
                                <span className="text-accent font-bold">{finalCiphertext}</span>
                            </div>
                        )}
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        XOR evaluates to 1 when the input bits disagree, and 0 when they match. Re-using short repeating keys (the Vigenère/Vernam weakness) allows cryptanalysts to discover key length and recover plaintext through frequency analysis.
                    </div>
                </Section>
            </aside>
        );
    }

    // 5. TRANSMISSION STATION (TRANSMIT, INTERCEPT)
    if (currentStep >= LAB_STEPS.TRANSMIT && currentStep <= LAB_STEPS.INTERCEPT) {
        const isModified = Boolean(interceptedCiphertext && finalCiphertext && interceptedCiphertext !== finalCiphertext);

        // Find changed byte pairs if determinable
        const diffList = [];
        if (finalCiphertext && interceptedCiphertext) {
            const maxLen = Math.max(finalCiphertext.length, interceptedCiphertext.length);
            for (let i = 0; i < maxLen; i += 2) {
                const origByte = finalCiphertext.substring(i, i + 2) || "--";
                const tamperedByte = interceptedCiphertext.substring(i, i + 2) || "--";
                if (origByte !== tamperedByte) {
                    diffList.push({
                        byteIndex: Math.floor(i / 2),
                        orig: origByte,
                        tampered: tamperedByte
                    });
                }
            }
        }

        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader
                    title="TRANSMISSION STATION"
                    subtitle={`Station 05 • ${currentStep === LAB_STEPS.TRANSMIT ? "Packet in Flight" : "Packet Interception"}`}
                />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        The sender node dispatches the ciphertext packet across an insecure communication channel. A man-in-the-middle adversary can intercept, inspect, and tamper with the hex payload before it reaches the receiver.
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm text-accent space-y-1">
                        <div>C_transmitted = C</div>
                        <div className="text-xs text-textSecondary font-normal">
                            Channel Integrity Check: <span className="text-textPrimary font-mono">C_received = C_transmitted ⊕ e</span> (where <span className="font-mono text-accent">e</span> is channel noise or adversary tamper vector)
                        </div>
                    </div>
                </Section>

                <Section label="LIVE VALUES">
                    <div className="space-y-3 font-mono text-xs">
                        <div className="bg-osBg border border-osGlassBorder p-3 rounded space-y-2">
                            <div>
                                <span className="text-[10px] text-textSecondary uppercase block">Original Ciphertext Sent</span>
                                <span className="text-textPrimary font-semibold break-all">{finalCiphertext || "—"}</span>
                            </div>
                            <div className="pt-2 border-t border-osGlassBorder">
                                <span className="text-[10px] text-textSecondary uppercase block">Intercepted / In-Transit Ciphertext</span>
                                <span className={`font-semibold break-all ${isModified ? 'text-warning' : 'text-accent'}`}>
                                    {interceptedCiphertext || finalCiphertext || "—"}
                                </span>
                            </div>
                        </div>

                        {diffList.length > 0 && (
                            <div className="bg-warning/10 border border-warning/30 p-3 rounded space-y-1">
                                <span className="text-[10px] text-warning font-bold uppercase block">Detected Alterations</span>
                                {diffList.map((diff, idx) => (
                                    <div key={idx} className="text-xs text-textPrimary flex justify-between">
                                        <span>Byte position {diff.byteIndex}:</span>
                                        <span>
                                            <span className="line-through text-textSecondary">{diff.orig}</span>
                                            {" → "}
                                            <span className="text-warning font-bold">{diff.tampered}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>

                <Section label="RESULT">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-xs flex items-center justify-between">
                        <span className="text-textSecondary">Packet Integrity State:</span>
                        <span className={`font-bold ${isModified ? 'text-warning' : 'text-success'}`}>
                            {isModified ? "TAMPERED / MODIFIED" : "UNMODIFIED"}
                        </span>
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        XOR stream ciphers offer confidentiality but zero message authentication or non-malleability on their own. Modifying bit <span className="font-mono text-accent">k</span> of the ciphertext flips exactly bit <span className="font-mono text-accent">k</span> of the decrypted plaintext at the receiver.
                    </div>
                </Section>
            </aside>
        );
    }

    // 6. DECRYPTION STATION (DECRYPT_XOR, EXTRACT_PAYLOAD)
    if (currentStep >= LAB_STEPS.DECRYPT_XOR && currentStep <= LAB_STEPS.EXTRACT_PAYLOAD) {
        const totalBytes = Math.floor(interceptedCiphertext.length / 2);
        const validByteIdx = Math.min(decryptByteIndex, Math.max(0, totalBytes - 1));

        const hexPair = interceptedCiphertext.substring(validByteIdx * 2, (validByteIdx * 2) + 2) || "00";
        const cipherVal = parseInt(hexPair, 16) || 0;
        const keyIndex = secretKey.length > 0 ? (validByteIdx % secretKey.length) : 0;
        const keyChar = secretKey[keyIndex] || "";
        const keyVal = keyChar.charCodeAt(0) || 0;
        const decryptedVal = cipherVal ^ keyVal;
        const recoveredChar = String.fromCharCode(decryptedVal);

        const cipherBinary = toBinary(cipherVal, 8);
        const keyBinary = toBinary(keyVal, 8);
        const xorBinary = toBinary(decryptedVal, 8);

        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader
                    title="DECRYPTION STATION"
                    subtitle={`Station 06 • Byte ${validByteIdx + 1} of ${totalBytes || 1}`}
                />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        The receiver applies the shared secret key to decrypt incoming ciphertext bytes via XOR. Once all bytes are deciphered, the payload string is parsed across the delimiter to recover message and hash.
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm space-y-1">
                        <div className="text-accent font-bold">C ⊕ K = P</div>
                        <div className="text-xs text-textSecondary font-normal">
                            Self-inverse property: <span className="text-textPrimary font-mono">(P ⊕ K) ⊕ K = P ⊕ (K ⊕ K) = P ⊕ 0 = P</span>
                        </div>
                    </div>
                </Section>

                <Section label="LIVE VALUES (ACTIVE BYTE)">
                    <div className="space-y-3 font-mono text-xs">
                        <div className="bg-osBg border border-osGlassBorder p-3 rounded space-y-2">
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Ciphertext Hex Pair:</span>
                                <span className="text-textPrimary font-semibold">0x{hexPair} (dec: {cipherVal})</span>
                            </div>
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Ciphertext Binary:</span>
                                <span className="text-accent">{cipherBinary}</span>
                            </div>
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Key Character [idx {keyIndex}]:</span>
                                <span className="text-textPrimary font-semibold">&apos;{keyChar}&apos; (dec: {keyVal})</span>
                            </div>
                            <div className="flex justify-between items-center text-textSecondary">
                                <span>Binary Key:</span>
                                <span className="text-accent">{keyBinary}</span>
                            </div>
                            <div className="border-t border-osGlassBorder pt-2 flex justify-between items-center">
                                <span className="text-textSecondary">XOR Output (Binary):</span>
                                <span className="text-success font-bold tracking-wider">{xorBinary}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-textSecondary">Recovered Character:</span>
                                <span className="text-success font-bold">
                                    {cipherVal} ⊕ {keyVal} = {decryptedVal} &rarr; &apos;{recoveredChar}&apos;
                                </span>
                            </div>
                        </div>

                        {/* Extracted Payload Separation */}
                        {(extractedMessage || extractedHash || currentStep === LAB_STEPS.EXTRACT_PAYLOAD) && (
                            <div className="bg-osBg border border-osGlassBorder p-3 rounded space-y-2">
                                <span className="text-[10px] text-textSecondary uppercase block">Payload Parsing</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-osSurface p-2 rounded border border-osGlassBorder">
                                        <span className="text-[10px] text-textSecondary block">Extracted Message</span>
                                        <span className="text-textPrimary font-bold text-sm">{extractedMessage || (decryptedChars.join('').split('|')[0] ?? "—")}</span>
                                    </div>
                                    <div className="bg-osSurface p-2 rounded border border-osGlassBorder">
                                        <span className="text-[10px] text-textSecondary block">Received Hash</span>
                                        <span className="text-textPrimary font-bold text-sm">{extractedHash || (decryptedChars.join('').split('|')[1] ?? "—")}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                <Section label="RESULT">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-xs flex items-center justify-between">
                        <span className="text-textSecondary">Decrypted Characters:</span>
                        <span className="text-accent font-bold">
                            &quot;{decryptedChars.join('')}&quot;
                        </span>
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        Because XOR is its own algebraic inverse, both encryption and decryption execute identical hardware and software instructions. If an attacker tampered with the ciphertext, the decrypted character will differ from the original plaintext byte.
                    </div>
                </Section>
            </aside>
        );
    }

    // 7. VERIFICATION STATION (VERIFY_HASH_*, COMPARE_HASHES, COMPLETE)
    if (currentStep >= LAB_STEPS.VERIFY_HASH_ASCII && currentStep <= LAB_STEPS.COMPLETE) {
        const trueRecalcData = calculateModuloHash(extractedMessage || "", modulo);
        const stageName = currentStep === LAB_STEPS.VERIFY_HASH_ASCII
            ? "Stage 1/4: ASCII Mapping"
            : currentStep === LAB_STEPS.VERIFY_HASH_SUM
                ? "Stage 2/4: Message Sum"
                : currentStep === LAB_STEPS.VERIFY_HASH_MODULO
                    ? "Stage 3/4: Recalculate Modulo"
                    : "Stage 4/4: Authenticity Comparison";

        // Equality check: authority matches existing verification station logic
        const recalculatedFinalHash = verifyModulo.toString();
        const hasVerified = currentStep === LAB_STEPS.COMPLETE;
        const isMatch = verifyModulo !== "" && recalculatedFinalHash === extractedHash;

        return (
            <aside className="w-full h-full flex flex-col gap-5 p-6 font-sans">
                <PanelHeader
                    title="INTEGRITY VERIFICATION"
                    subtitle={`Station 07 • ${stageName}`}
                />

                <Section label="OPERATION">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        To verify packet integrity, the receiver independently hashes the extracted message and compares the recalculated value against the extracted hash received over the wire.
                    </p>
                </Section>

                <Section label="FORMULA">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-sm space-y-1.5">
                        <div className={currentStep === LAB_STEPS.VERIFY_HASH_ASCII ? "text-accent font-bold" : "text-textSecondary"}>
                            1. Recalculate: H(M_recovered) = (Σ ASCII(M_recovered[i])) mod {modulo}
                        </div>
                        <div className={currentStep >= LAB_STEPS.COMPARE_HASHES ? "text-accent font-bold" : "text-textSecondary"}>
                            2. Compare: H(M_recovered) =?= H_extracted
                        </div>
                    </div>
                </Section>

                <Section label="LIVE VALUES">
                    <div className="space-y-3 font-mono text-xs">
                        <div className="bg-osBg border border-osGlassBorder p-3 rounded">
                            <span className="text-[10px] text-textSecondary uppercase block mb-1">Recovered Message Used</span>
                            <span className="text-textPrimary font-bold text-sm tracking-wide">&quot;{extractedMessage}&quot;</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {trueRecalcData.chars.map((item, idx) => {
                                    const entered = verifyAsciiMap[idx];
                                    const isCorrect = entered !== undefined && entered === item.val.toString();
                                    return (
                                        <div key={idx} className={`bg-osSurface px-2 py-1 rounded border ${currentStep === LAB_STEPS.VERIFY_HASH_ASCII ? 'border-accent/40 bg-accent/10' : 'border-osGlassBorder'} text-[10px]`}>
                                            <span className="text-textPrimary font-semibold">{item.char}</span> &rarr; {item.val}
                                            {entered !== undefined && (
                                                <span className={`block font-semibold ${isCorrect ? 'text-success' : 'text-warning'}`}>
                                                    input: {entered || "—"}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                                <span className="text-[10px] text-textSecondary uppercase block">Recalculated Sum</span>
                                <span className="text-textPrimary font-semibold">{trueRecalcData.sum}</span>
                                {verifySum && (
                                    <span className={`text-[10px] block mt-0.5 ${parseInt(verifySum) === trueRecalcData.sum ? 'text-success' : 'text-warning'}`}>
                                        Student sum: {verifySum}
                                    </span>
                                )}
                            </div>
                            <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                                <span className="text-[10px] text-textSecondary uppercase block">Recalculated Hash</span>
                                <span className="text-textPrimary font-semibold">{trueRecalcData.hash ?? "—"}</span>
                                {verifyModulo && (
                                    <span className={`text-[10px] block mt-0.5 ${parseInt(verifyModulo) === trueRecalcData.hash ? 'text-success' : 'text-warning'}`}>
                                        Student hash: {verifyModulo}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                                <span className="text-[10px] text-textSecondary uppercase block">Recalculated H(M)</span>
                                <span className="text-sm font-bold text-textPrimary">{verifyModulo !== "" ? verifyModulo : (trueRecalcData.hash ?? "—")}</span>
                            </div>
                            <div className="bg-osBg border border-osGlassBorder p-2.5 rounded">
                                <span className="text-[10px] text-textSecondary uppercase block">Received Hash</span>
                                <span className="text-sm font-bold text-textPrimary">{extractedHash || "—"}</span>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section label="RESULT">
                    <div className="bg-osBg border border-osGlassBorder p-3 rounded font-mono text-xs flex items-center justify-between">
                        <span className="text-textSecondary">Integrity Verdict:</span>
                        {hasVerified ? (
                            <span className={`font-bold text-sm ${isMatch ? 'text-success' : 'text-warning'}`}>
                                {isMatch ? "✓ INTEGRITY VERIFIED (MATCH)" : "✕ CORRUPTION DETECTED (MISMATCH)"}
                            </span>
                        ) : (
                            <span className="text-textSecondary font-semibold">
                                {verifyModulo !== "" ? (isMatch ? "Matches expected hash" : "Mismatch detected") : "Awaiting calculation..."}
                            </span>
                        )}
                    </div>
                </Section>

                <Section label="WHY IT MATTERS">
                    <div className="text-xs text-textSecondary border-l-2 border-accent pl-3 py-1">
                        This simple sum-based modulo hash can miss deliberate or accidental modifications because modular addition is prone to collisions. A matching hash is never a guarantee of authenticity without a keyed cryptographic MAC (e.g. HMAC-SHA256).
                    </div>
                </Section>
            </aside>
        );
    }

    return null;
}

// Reusable micro-components for consistent panel structure
function PanelHeader({ title, subtitle }) {
    return (
        <div className="border-b border-osGlassBorder pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold block">
                THEORY &amp; LIVE CALCULATIONS
            </span>
            <h2 className="text-base font-mono uppercase tracking-wider font-bold text-textPrimary mt-0.5">
                {title}
            </h2>
            <p className="text-xs font-mono text-textSecondary mt-0.5">
                {subtitle}
            </p>
        </div>
    );
}

PanelHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired
};

function Section({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-textSecondary font-semibold">
                {label}
            </span>
            {children}
        </div>
    );
}

Section.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node
};

