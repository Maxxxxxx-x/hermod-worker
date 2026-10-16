export async function hashApiKey(key: string): Promise<string> {
    const keyBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    return Buffer.from(new Uint8Array(keyBuffer)).toString("hex");
}
