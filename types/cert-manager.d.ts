export class CertManager extends EventEmitter {
    constructor(options?: {});
    defaultCaKeysAndCert: any;
    serverCaKeysAndCert: any;
    keyLength: any;
    db: {};
    generateServerKeysAndCert(hostname: any): {
        keys: any;
        cert: any;
    };
    insertServerKeysAndSert(hostname: any, serverKeysAndCert: any): void;
    getServerKeysAndCert(hostname: any): any;
}
export default CertManager;
import { EventEmitter } from "events";
