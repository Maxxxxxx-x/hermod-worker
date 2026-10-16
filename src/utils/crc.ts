import { crc32 } from "@foxglove/crc";

export function validateChecksum(key: string): boolean {
    const lastUnderscoreIdx = key.lastIndexOf("_");

    if (lastUnderscoreIdx === -1) {
        return false;
    }

    const payload = key.slice(0, lastUnderscoreIdx);
    const providedChecksumStr = key.slice(lastUnderscoreIdx + 1);

    const payloadBytes = new TextEncoder().encode(payload);

    const calculatedChecksum = crc32(payloadBytes);
    const calculatedIdx = calculatedChecksum.toString(16).padStart(8, "0");
    const normalizedProvided = providedChecksumStr.toLowerCase();

    return calculatedIdx === normalizedProvided;
}
