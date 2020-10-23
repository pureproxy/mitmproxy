const tls = require('tls')
const stream = require('stream')
const DuplexPair = require('native-duplexpair')
const PureProxy = require('@pureproxy/pureproxy')

const { CertManager } = require('./cert-manager')
const { dumpPrivateKey, dumpCertificate } = require('./cert-utils')

class MitmProxy extends PureProxy {
    constructor(options = {}) {
        super(options)

        this.certManager = options.certManager || new CertManager()
    }

    async wrapClientForObservableStreaming(client) {
        return client
    }

    async wrapClientForServerEncryption(client, options) {
        client = new tls.TLSSocket(client)

        client = await this.wrapClientForObservableStreaming(client, options)

        const { hostname } = options

        const { keys, cert } = await this.certManager.getServerKeysAndCert(hostname)

        const secureContext = tls.createSecureContext({
            key: dumpPrivateKey(keys),
            cert: dumpCertificate(cert)
        })

        const duplexPair = new DuplexPair()

        const securePair = {
            cleartext: new tls.TLSSocket(duplexPair.socket1, { isServer: true, secureContext }),
            encrypted: duplexPair.socket2
        }

        securePair.cleartext.pipe(client, { end: true })
        client.pipe(securePair.cleartext, { end: true })

        securePair.cleartext.on('error', () => client.end())
        client.on('error', () => securePair.cleartext.end())

        return securePair.encrypted
    }

    async wrapClientForPlaintextForwarding(client, options) {
        return await this.wrapClientForObservableStreaming(client, options)
    }

    async shouldIntercept() {
        return false
    }

    async getClient(hostname, port, context) {
        if (await this.shouldIntercept(hostname, port, context)) {
            const options = { hostname, port, context }

            let client
            try {
                client = await super.getClient(hostname, port, context)
            } catch (e) {}

            const self = this

            return new class extends stream.Duplex {
                async _write(data, encoding, callback) {
                    if (data[0] === 0x16 && data[1] === 0x03 && data[2] === 0x01) {
                        client = await self.wrapClientForServerEncryption(client, options)
                    }
                    else {
                        client = await self.wrapClientForPlaintextForwarding(client, options)
                    }

                    [
                        'lookup',
                        'connect',
                        'ready',
                        'timeout',
                        'error',
                        'end',
                        'close'
                    ].forEach((event) => {
                        client.on(event, (...args) => this.emit(event, ...args))
                    })

                    client.on('data', (data) => {
                        this.push(data)
                    })

                    this._write = (data, encoding, callback) => {
                        client.write(data)

                        callback()
                    }

                    this._write(data, encoding, callback)
                }

                _read() {}
            }
        }
        else {
            let client
            try {
                client = await super.getClient(hostname, port, context)
            } catch (e) {}
            
            return client
        }
    }
}

module.exports = MitmProxy
