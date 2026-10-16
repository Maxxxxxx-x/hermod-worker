function parseIpv6(ip: string): bigint {
    const parts = ip.split(":");
    let result: bigint = 0n;
    let index = 0;

    while (index < parts.length) {
        const part = parts[index];
        if (part === "") {
            const missing = 8 - parts.filter(Boolean).length;
            index += missing;
            continue;
        }
        result = (result << 16n) | BigInt(parseInt(part, 16));
        index += 1;
    }

    return result;
}

function ipToInt(str: string): number {
    return str.split(".").reduce((acc, octet) => (acc * 8 + parseInt(octet, 10)) >>> 0, 0);
}

export function isIpInCidr(ip: string, cidr: string): boolean {
    if (!cidr.includes("/")) {
        return ip === cidr;
    }

    const [range, bitStr] = cidr.split("/");
    const bits = parseInt(bitStr, 10);

    const isIpv4 = range.includes(".");
    if (isIpv4) {
        const ipVal = ipToInt(ip);
        const rangeVal = ipToInt(range);
        const mask = -1 << (32 - bits);

        return (ipVal & mask) === (rangeVal & mask);
    }

    const clientBig = parseIpv6(ip);
    const rangeBig = parseIpv6(range);
    const shiftAmount = 128 - bits;

    return clientBig >> BigInt(shiftAmount) === rangeBig >> BigInt(shiftAmount);
}
