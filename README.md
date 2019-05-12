[![Follow on Twitter](https://img.shields.io/twitter/follow/pdp.svg?logo=twitter)](https://twitter.com/pdp)
[![NPM](https://img.shields.io/npm/v/@pureproxy/mitmproxy.svg)](https://www.npmjs.com/package/@pureproxy/mitmproxy)

# MitmProxy

MitmProxy is a simple but very flexible, streaming proxy server. The main purpose of this server is to be used as a base building block for creating intercepting proxy servers and applications.

## How To Install

You need to install this library as a dependency like this:

```
$ npm install @pureproxy/mitmproxy
```

## How To Use

The following code starts the proxy server as is:

```javascript
const MitmProxy = require('@pureproxy/mitmproxy')

const server = new MitmProxy()

server.listen(8080)
```

Create your own certificate manager like this:

```javascript
const MitmProxy = require('@pureproxy/mitmproxy')
const { CertManager } = require('@pureproxy/mitmproxy/lib/cert-manager')

const server = new MitmProxy({ certManager: new CertManager() })

server.listen(8080)
```

You can also persist the certificates to disk like this:

```javascript
const MitmProxy = require('@pureproxy/mitmproxy')
const { CertManagerFs } = require('@pureproxy/mitmproxy/lib/cert-manager-fs')

const server = new MitmProxy({ certManager: new CertManagerFs('./cert-folder') })

server.listen(8080)
```

Add additional features by extending the ProxyServer class:

```javascript
const stream = require('stream')
const MitmProxy = require('@pureproxy/mitmproxy')

const server = new class extends MitmProxy {
  wrapClientForObservableStreaming(client, { hostname, port, context }) {
    // return a duplex stream (like sockets) to monitor all data in transit

    return new class extends stream.Duplex {
      constructor() {
        super()

        client.on('data', (data) => {
          // log incoming data

          console.log('<<<', data)

          this.push(data)
        })
      }

      _write(data, encoding, callback) {
        // log outgoing data

        console.log('>>>', data)

        client.write(data)

        callback()
      }

      _read() {}
    }
  }

  shouldIntercept(hostname, port, context) {
    return true
  }
}

server.listen(8080)
```

## FAQ

The general FAQ can be found in the [mitmproxy](https://github.com/pureproxy/pureproxy) project page.

**Q: Can I intercept TLS/SSL?** - You can intercept any traffic by performing an active man-in-the-middle attack against the connected clients. This is done by default with MITM Proxy if `shouldIntercept` returns `true`.

**Q: How can I intercept the whole HTTP request/response?** - This can be implemented in a similar way as [pureproxy](https://github.com/pureproxy/pureproxy) parses HTTP requests. This library does not come with builtin mechanisms for this.

**Q: Who is using this library?** - The code is used in [secapps.com](https://secapps.com) tools and services. It is also used by [Pown Proxy](https://github.com/pownjs/pown-proxy) tool.

**Q: Can you make the API programmer-friendly?** - I did. Checkout out [utils](https://github.com/pureproxy/utils) for example how to implement full-features proxy servers with minimal requirements and development overhead.
