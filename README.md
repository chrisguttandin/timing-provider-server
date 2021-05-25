# timing-provider-server

**A command line tool to spin up a server which can be used with the timing-provider.**

[![dependencies](https://img.shields.io/david/chrisguttandin/timing-provider-server.svg?style=flat-square)](https://github.com/chrisguttandin/timing-provider-server/network/dependencies)
[![version](https://img.shields.io/npm/v/timing-provider-server.svg?style=flat-square)](https://www.npmjs.com/package/timing-provider-server)

This command line tool spins up a server which can be used as the signaling server for the [timing-provider](https://github.com/chrisguttandin/timing-provider).

## Usage

The timing-provider-server package is published on [npm](https://www.npmjs.com/package/timing-provider-server). It can be installed like this:

```shell
npm install timing-provider-server
```

Afterwards the server can be started by executing the following command:

```shell
timing-provider-server
```

It is also possible to execute the command above without installing a local version of this package like this:

```shell
npx timing-provider-server
```

Once the server is up and running it can be used when creating a new `TimingProvider`.

```js
const timingProvider = new TimingProvider('ws://localhost:2276');
```

## Arguments

### --port

This option can be used to specify the port to which the server is listening. If this argument is not used 2276 will be used as the default port.

```shell
timing-provider-server --port 4567
```
