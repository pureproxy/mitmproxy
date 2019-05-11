const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')

const { generateCaKeysAndCert, generateServerKeysAndCert, dumpPrivateKey, loadPrivateKey, dumpCertificate, loadCertificate } = require('./cert-utils')

class CertManagerFs extends EventEmitter {
    constructor(root) {
        super()

        this.caKeyLength = 1024
        this.serverKeyLength = 1024

        this.defaultCaCommonName = 'Default CA'

        this.reset(root)
    }

    mkdir(pathname) {
        try {
            return fs.mkdirSync(pathname)
        }
        catch (e) {
            // pass
        }
    }

    readfile(pathname) {
        try {
            return fs.readFileSync(pathname)
        }
        catch (e) {
            // pass
        }
    }

    writefile(pathname, data) {
        try {
            return fs.writeFileSync(pathname, data)
        }
        catch (e) {
            // pass
        }
    }

    reset(root) {
        this.permRoot = path.join(root, 'perm')
        this.tempRoot = path.join(root, 'temp')

        this.mkdir(this.permRoot)
        this.mkdir(this.tempRoot)

        this.permCaRoot = path.join(this.permRoot, 'ca')
        this.permServerRoot = path.join(this.permRoot, 'server')

        this.mkdir(this.permCaRoot)
        this.mkdir(this.permServerRoot)

        this.tempCaRoot = path.join(this.tempRoot, 'ca')
        this.tempServerRoot = path.join(this.tempRoot, 'server')

        this.mkdir(this.tempCaRoot)
        this.mkdir(this.tempServerRoot)

        this.permCaStore = {}
        this.permServerStore = {}

        this.tempCaStore = {}
        this.tempServerStore = {}

        // TODO: watch the fs for changes and update the stores
    }

    getStoreItem(root, store, name) {
        if (store.hasOwnProperty(name)) {
            return store[name]
        }

        const certPathname = path.join(root, `${name}-cert.pem`)
        const privateKeyPathname = path.join(root, `${name}-key.pem`)

        const certBuff = this.readfile(certPathname)
        const privateKeyBuff = this.readfile(privateKeyPathname)

        if (!certBuff || !privateKeyBuff) {
            return
        }

        const cert = loadCertificate(certBuff)
        const privateKey = loadPrivateKey(privateKeyBuff)

        store[name] = { keys: { privateKey }, cert }

        return store[name]
    }

    setStoreItem(root, store, name, item) {
        store[name] = item

        const certPathname = path.join(root, `${name}-cert.pem`)
        const privateKeyPathname = path.join(root, `${name}-key.pem`)

        const { keys, cert } = item

        this.writefile(certPathname, dumpCertificate(cert))
        this.writefile(privateKeyPathname, dumpPrivateKey(keys))
    }

    getCaKeysAndCert(hostname, port) {
        const name = `${hostname}:${port}`

        let caItem

        caItem = this.getStoreItem(this.permCaRoot, this.permCaStore, name)

        if (caItem) {
            return caItem
        }

        caItem = this.getStoreItem(this.permCaRoot, this.permCaStore, 'default')

        if (caItem) {
            return caItem
        }

        caItem = this.getStoreItem(this.tempCaRoot, this.tempCaStore, name)

        if (caItem && caItem.cert.validity.notAfter.getTime() > Date.now()) {
            return caItem
        }

        caItem = this.getStoreItem(this.tempCaRoot, this.tempCaStore, 'default')

        if (caItem && caItem.cert.validity.notAfter.getTime() > Date.now()) {
            return caItem
        }

        caItem = generateCaKeysAndCert({ commonName: this.defaultCaCommonName, keyLength: this.caKeyLength })

        this.setStoreItem(this.tempCaRoot, this.tempCaStore, 'default', caItem)

        return caItem
    }

    getServerKeysAndCert(hostname, port) {
        const name = `${hostname}:${port}`

        let serverItem

        serverItem = this.getStoreItem(this.permServerRoot, this.permServerStore, name)

        if (serverItem) {
            return serverItem
        }

        serverItem = this.getStoreItem(this.tempServerRoot, this.tempServerStore, name)

        if (serverItem && serverItem.cert.validity.notAfter.getTime() > Date.now()) {
            return serverItem
        }

        const caKeysAndCert = this.getCaKeysAndCert(hostname, port)

        serverItem = generateServerKeysAndCert({ commonName: hostname, caKeysAndCert, keyLength: this.serverKeyLength })

        this.setStoreItem(this.tempServerRoot, this.tempServerStore, name, serverItem)

        return serverItem
    }
}

class CachingCertManagerFs extends CertManagerFs {
    constructor(root, timeDelta = 60000) {
        super(root)

        this.timeDelta = timeDelta
    }

    refreshStore(store) {
        Object.entries(store).forEach(([name, { blank }]) => {
            if (blank) {
                delete store[name]
            }
        })
    }

    refresh() {
        this.refreshStore(this.permCaStore)
        this.refreshStore(this.permServerStore)
        this.refreshStore(this.tempCaStore)
        this.refreshStore(this.tempServerStore)
    }

    cachingGetStoreItem(root, store, name) {
        const item = super.getStoreItem(root, store, name)

        if (!item) {
            if (store.hasOwnProperty(name)) {
                const { blank, expires } = store[name]

                if (blank && expires < Date.now()) {
                    store[name] = { blank: true, expires: Date.now() + this.timeDelta }
                }
            }
            else {
                store[name] = { blank: true, expires: Date.now() + this.timeDelta }
            }
        }

        return item
    }

    getStoreItem(root, store, name) {
        if (!store.hasOwnProperty(name)) {
            return this.cachingGetStoreItem(root, store, name)
        }

        const { blank, expires } = store[name]

        if (blank) {
            if (expires < Date.now()) {
                return this.cachingGetStoreItem(root, store, name)
            }
            else {
                return
            }
        }
        else {
            return this.cachingGetStoreItem(root, store, name)
        }
    }
}

module.exports = {
    CertManagerFs,
    CachingCertManagerFs
}
