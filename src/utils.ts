export function stringBuffer(str: string): ArrayBuffer {
    return new TextEncoder()
        .encode(str);
}

export function hexBuffer(hex: string): ArrayBuffer {
    const bytes = hex.match(/.{1,2}/g) ?? [];
    return Uint8Array.from(bytes.map(byte => parseInt(byte, 16)));
}

export function requestHeader(request: Request, header: string): string {
    return request.headers.get(header) ?? "";
}
