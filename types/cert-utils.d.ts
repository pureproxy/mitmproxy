export function generateSerialNumber(): string;
export function generateDateOffsetByYears(years: any): Date;
export function generateGenericKeysAndCert(options?: {
    serialNumber?: number;
    keyLength?: number;
    notBefore?: Date;
    notAfter?: Date;
}): {
    keys: any;
    cert: any;
};
export function generateCaKeysAndCert(options: {
    commonName: string;
    serialNumber?: number;
    keyLength?: number;
    notBefore?: Date;
    notAfter?: Date;
}): {
    keys: any;
    cert: any;
};
export function generateServerKeysAndCert(options: {
    commonName: string;
    caKeysAndCert: Record<string, any>;
    serialNumber?: number;
    keyLength?: number;
    notBefore?: Date;
    notAfter?: Date;
}): {
    keys: any;
    cert: any;
};
export function dumpPrivateKey(keys: any): any;
export function dumpPublicKey(keys: any): any;
export function dumpCertificate(cert: any): any;
export function loadPrivateKey(buff: any): any;
export function loadPublicKey(buff: any): any;
export function loadCertificate(buff: any): any;
