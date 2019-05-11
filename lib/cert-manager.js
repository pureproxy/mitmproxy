const EventEmitter = require('events')

const { generateCaKeysAndCert, generateServerKeysAndCert } = require('./cert-utils')

class CertManager extends EventEmitter {
    constructor(options = {}) {
        super()

        this.defaultCaKeysAndCert = options.defaultCaKeysAndCert || generateCaKeysAndCert({ commonName: 'Default CA' })
        this.serverCaKeysAndCert = options.serverCaKeysAndCert || {}
        this.keyLength = options.keyLength || 1024

        this.db = {}
    }

    generateServerKeysAndCert(hostname) {
        let caKeysAndCert = this.defaultCaKeysAndCert

        if (this.serverCaKeysAndCert.hasOwnProperty(hostname)) {
            caKeysAndCert = this.serverCaKeysAndCert[hostname]
        }

        return generateServerKeysAndCert({ commonName: hostname, caKeysAndCert, keyLength: this.keyLength })
    }

    insertServerKeysAndSert(hostname, serverKeysAndCert) {
        this.emit('entry', { hostname, serverKeysAndCert })

        this.db[hostname] = serverKeysAndCert
    }

    getServerKeysAndCert(hostname) {
        if (!this.db.hasOwnProperty(hostname)) {
            const serverKeysAndCert = this.generateServerKeysAndCert(hostname)

            this.emit('entry', { hostname, serverKeysAndCert })

            this.db[hostname] = serverKeysAndCert
        }

        return this.db[hostname]
    }
}

module.exports = {
    CertManager
}
