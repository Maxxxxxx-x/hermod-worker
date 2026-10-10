export async function hashApiKey(key: string): Promise<string> {
    const keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    return new Uint8Array(keyBuffer).toHex();
}
