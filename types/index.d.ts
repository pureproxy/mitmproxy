export class MitmProxy extends PureProxy {
    certManager: any;
    wrapClientForObservableStreaming(client: any): Promise<any>;
    wrapClientForServerEncryption(client: any, options: any): Promise<any>;
    wrapClientForPlaintextForwarding(client: any, options: any): Promise<any>;
    shouldIntercept(): Promise<boolean>;
    getClient(hostname: any, port: any, context: any): Promise<any>;
}
export default MitmProxy;
import PureProxy from "@pureproxy/pureproxy";
