import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { config } from 'process';

export type BConfig = {
    id: number 
};

export function BConfigToCell(config: BConfig): Cell {
    return beginCell().storeUint(config.id, 32).endCell();
}

export class B implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new B(address);
    }

    static createFromConfig(config: BConfig, code: Cell, workchain = 0) {
        const data = BConfigToCell(config);
        const init = { code, data };
        return new B(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
