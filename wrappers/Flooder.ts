import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';
import { sign, KeyPair } from 'ton-crypto';

export type FlooderConfig = {
    publicKey: Buffer;
};

export function flooderConfigToCell(config: FlooderConfig): Cell {
    return beginCell().storeUint(0, 16).storeBuffer(config.publicKey, 32).endCell();
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

    async sendMessage(provider: ContractProvider, seqno: number, keypair: KeyPair) {
        const seqnoCellHash = beginCell().storeUint(seqno, 16).endCell().hash();
        const signature = sign(seqnoCellHash, keypair.secretKey);
        await provider.external(beginCell().storeBuffer(signature).storeUint(seqno, 16).endCell());
    }
}
