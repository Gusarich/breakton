import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type FlooderConfig = {};

export function flooderConfigToCell(config: FlooderConfig): Cell {
    return beginCell().endCell();
}

export class Flooder implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Flooder(address);
    }

    static createFromConfig(config: FlooderConfig, code: Cell, workchain = 0) {
        const data = flooderConfigToCell(config);
        const init = { code, data };
        return new Flooder(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
