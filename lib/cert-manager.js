import { EventEmitter } from 'events'

import {
  generateCaKeysAndCert,
  generateServerKeysAndCert,
} from './cert-utils.js'

export class CertManager extends EventEmitter {
  constructor(options = {}) {
    super()

    this.defaultCaKeysAndCert =
      options.defaultCaKeysAndCert ||
      generateCaKeysAndCert({ commonName: 'Default CA' })
    this.serverCaKeysAndCert = options.serverCaKeysAndCert || {}
    this.keyLength = options.keyLength || 1024

    this.db = {}
  }

  generateServerKeysAndCert(hostname) {
    let caKeysAndCert = this.defaultCaKeysAndCert

    if (
      Object.prototype.hasOwnProperty.call(this.serverCaKeysAndCert, hostname)
    ) {
      caKeysAndCert = this.serverCaKeysAndCert[hostname]
    }

    return generateServerKeysAndCert({
      commonName: hostname,
      caKeysAndCert,
      keyLength: this.keyLength,
    })
  }

  insertServerKeysAndSert(hostname, serverKeysAndCert) {
    this.emit('entry', { hostname, serverKeysAndCert })

    this.db[hostname] = serverKeysAndCert
  }

  getServerKeysAndCert(hostname) {
    if (!Object.prototype.hasOwnProperty.call(this.dbm, hostname)) {
      const serverKeysAndCert = this.generateServerKeysAndCert(hostname)

      this.emit('entry', { hostname, serverKeysAndCert })

      this.db[hostname] = serverKeysAndCert
    }

    return this.db[hostname]
  }
}

export default CertManager
