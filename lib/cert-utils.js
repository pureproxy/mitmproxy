const nodeForge = require('node-forge')

const defaultAttrs = [
    { name: 'countryName', value: 'GB' },
    { name: 'organizationName', value: 'SecApps' },
    { shortName: 'ST', value: 'SA' },
    { shortName: 'OU', value: 'SecApps' }
]

const generateSerialNumber = () => {
    return Math.floor(Math.random() * 100000).toString()
}

const generateDateOffsetByYears = (years) => {
    const date = new Date()

    date.setFullYear(date.getFullYear() + years)

    return date
}

const generateGenericKeysAndCert = ({ serialNumber = generateSerialNumber(), keyLength = 2048, notBefore = generateDateOffsetByYears(-10), notAfter = generateDateOffsetByYears(10) } = {}) => {
    const keys = nodeForge.pki.rsa.generateKeyPair(keyLength)
    const cert = nodeForge.pki.createCertificate()

    cert.publicKey = keys.publicKey
    cert.serialNumber = serialNumber

    cert.validity.notBefore = notBefore
    cert.validity.notAfter = notAfter

    return { keys, cert }
}

const generateCaKeysAndCert = ({ commonName, serialNumber, keyLength, notBefore, notAfter } = {}) => {
    if (!commonName) {
        throw new Error(`Undefined commonName`)
    }

    const { keys, cert } = generateGenericKeysAndCert({ serialNumber, keyLength, notBefore, notAfter })

    const attrs = [].concat(defaultAttrs, [
        { name: 'commonName', value: commonName }
    ])

    cert.setSubject(attrs)
    cert.setIssuer(attrs)

    const extensions = [
        { name: 'basicConstraints', cA: true },
        // { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
        // { name: 'extKeyUsage', serverAuth: true, clientAuth: true, codeSigning: true, emailProtection: true, timeStamping: true },
        // { name: 'nsCertType', client: true, server: true, email: true, objsign: true, sslCA: true, emailCA: true, objCA: true },
        // { name: 'subjectKeyIdentifier' }
    ]

    cert.setExtensions(extensions)

    cert.sign(keys.privateKey, nodeForge.md.sha256.create())

    return { keys, cert }
}

const generateServerKeysAndCert = ({ commonName, caKeysAndCert, serialNumber, keyLength, notBefore, notAfter } = {}) => {
    if (!commonName) {
        throw new Error(`Undefined commonName`)
    }

    if (!caKeysAndCert) {
        throw new Error(`Undefined caKeysAndCert`)
    }

    const { keys: caKeys, cert: caCert } = caKeysAndCert

    if (!serialNumber) {
        const serialNumberHash = nodeForge.md.md5.create()

        serialNumberHash.update(`${commonName}:${Date.now()}`)

        serialNumber = serialNumberHash.digest().toHex()
    }

    const { keys, cert } = generateGenericKeysAndCert({ serialNumber, keyLength, notBefore, notAfter })

    cert.setIssuer(caCert.subject.attributes)

    const attrs = [].concat(defaultAttrs, [
        { name: 'commonName', value: commonName }
    ])

    cert.setSubject(attrs)

    const extensions = [
        { name: 'basicConstraints', cA: false },
        (
            /^\d+?\.\d+?\.\d+?\.\d+?$/.test(commonName) ? ({ name: 'subjectAltName', altNames: [{ type: 7, ip: commonName }] }) : ({ name: 'subjectAltName', altNames: [{ type: 2, value: commonName }] })
        )
    ]

    cert.setExtensions(extensions)

    cert.sign(caKeys.privateKey, nodeForge.md.sha256.create())

    return { keys, cert }
}

const dumpPrivateKey = (keys) => {
    return nodeForge.pki.privateKeyToPem(keys.privateKey)
}

const dumpPublicKey = (keys) => {
    return nodeForge.pki.publicKeyToPem(keys.publicKey)
}

const dumpCertificate = (cert) => {
    return nodeForge.pki.certificateToPem(cert)
}

const loadPrivateKey = (buff) => {
    return nodeForge.pki.privateKeyFromPem(buff.toString())
}

const loadPublicKey = (buff) => {
    return nodeForge.pki.publicKeyFromPem(buff.toString())
}

const loadCertificate = (buff) => {
    return nodeForge.pki.certificateFromPem(buff.toString())
}

module.exports = {
    generateGenericKeysAndCert,
    generateCaKeysAndCert,
    generateServerKeysAndCert,
    dumpPrivateKey,
    dumpPublicKey,
    dumpCertificate,
    loadPrivateKey,
    loadPublicKey,
    loadCertificate
}
