export function generateSerialNumber(): string;
export function generateDateOffsetByYears(years: any): Date;
export function generateGenericKeysAndCert({ serialNumber, keyLength, notBefore, notAfter, }?: {
    serialNumber?: string;
    keyLength?: number;
    notBefore?: Date;
    notAfter?: Date;
}): {
    keys: any;
    cert: any;
};
export function generateCaKeysAndCert({ commonName, serialNumber, keyLength, notBefore, notAfter, }?: {
    commonName: any;
    serialNumber: any;
    keyLength: any;
    notBefore: any;
    notAfter: any;
}): {
    keys: any;
    cert: any;
};
export function generateServerKeysAndCert({ commonName, caKeysAndCert, serialNumber, keyLength, notBefore, notAfter, }?: {
    commonName: any;
    caKeysAndCert: any;
    serialNumber: any;
    keyLength: any;
    notBefore: any;
    notAfter: any;
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
