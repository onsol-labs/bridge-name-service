/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { LibArbitrumL2, LibArbitrumL2Interface } from "../LibArbitrumL2";

const _abi = [
  {
    inputs: [],
    name: "ARBSYS",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6091610038600b82828239805160001a607314602b57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361060335760003560e01c8063bf0a12cf146038575b600080fd5b603f606481565b6040516001600160a01b03909116815260200160405180910390f3fea2646970667358221220e11916c07648be48ec131921016b332fea5c7d2010dc8d4a7a260d8988b33b6664736f6c634300080d0033";

export class LibArbitrumL2__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<LibArbitrumL2> {
    return super.deploy(overrides || {}) as Promise<LibArbitrumL2>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): LibArbitrumL2 {
    return super.attach(address) as LibArbitrumL2;
  }
  connect(signer: Signer): LibArbitrumL2__factory {
    return super.connect(signer) as LibArbitrumL2__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LibArbitrumL2Interface {
    return new utils.Interface(_abi) as LibArbitrumL2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LibArbitrumL2 {
    return new Contract(address, _abi, signerOrProvider) as LibArbitrumL2;
  }
}
