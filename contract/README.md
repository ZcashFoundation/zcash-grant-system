# Grant.io Smart Contracts

This is a collection of the smart contracts and associated testing and build
process used for the [Grant.io](http://grant.io) dApp.

## API

This repo provides Truffle build artifacts, ABI json, and type definitions
for all contracts. You can import them like so:

```ts
import {
  EscrowContract, // Truffle build artifacts
  EscrowABI,      // Contract ABI
  Escrow,         // Contract type defintion
} from 'grant-contracts';
```

## Commands

To run any commands, you must install node dependencies, and have `truffle` 
installed globally.

### Testing

```bash
yarn run test
```

Runs the truffle test suite

### Building

```bash
yarn run build
```

Builds the contract artifact JSON files, ABI JSON files, and type definitions

### Publishing

TBD