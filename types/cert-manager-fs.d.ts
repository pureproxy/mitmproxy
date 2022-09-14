/// <reference types="node" />
export class CertManagerFs extends EventEmitter {
    constructor(root: any);
    caKeyLength: number;
    serverKeyLength: number;
    defaultCaCommonName: string;
    mkdir(pathname: any): void;
    readfile(pathname: any): Buffer;
    writefile(pathname: any, data: any): void;
    reset(root: any): void;
    permRoot: string;
    tempRoot: string;
    permCaRoot: string;
    permServerRoot: string;
    tempCaRoot: string;
    tempServerRoot: string;
    permCaStore: {};
    permServerStore: {};
    tempCaStore: {};
    tempServerStore: {};
    getStoreItem(root: any, store: any, name: any): any;
    setStoreItem(root: any, store: any, name: any, item: any): void;
    getCaKeysAndCert(hostname: any, port: any): any;
    getServerKeysAndCert(hostname: any, port: any): any;
}
export class CachingCertManagerFs extends CertManagerFs {
    constructor(root: any, timeDelta?: number);
    timeDelta: number;
    refreshStore(store: any): void;
    refresh(): void;
    cachingGetStoreItem(root: any, store: any, name: any): any;
}
export default CertManagerFs;
import EventEmitter from "events";
