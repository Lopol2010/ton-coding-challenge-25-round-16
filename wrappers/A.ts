import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type AConfig = {
    id: number 
    score: number 
    B: Address 
};

export const OP_CODES = {
    PROVOKE_BOUNCE: 0x7e8764ef
};

export function aConfigToCell(config: AConfig): Cell {

    return beginCell()
        .storeUint(config.id, 32)
        .storeUint(config.score, 256)
        .storeAddress(config.B)
        .endCell();
}

export class A implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new A(address);
    }

    static createFromConfig(config: AConfig, code: Cell, workchain = 0) {
        const data = aConfigToCell(config);
        const init = { code, data };
        return new A(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendProvokeBounce(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(OP_CODES.PROVOKE_BOUNCE, 32).endCell(),
        });
    }

    async getScore(provider: ContractProvider) {
        const result = await provider.get('currentScore', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('initialId', []);
        return result.stack.readNumber();
    }
}
