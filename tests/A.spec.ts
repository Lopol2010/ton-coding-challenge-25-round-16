import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { A } from '../wrappers/A';
import { B } from '../wrappers/B';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('A', () => {
    let codeA: Cell;
    let codeB: Cell;

    beforeAll(async () => {
        codeA = await compile('A');
        codeB = await compile('B');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let a: SandboxContract<A>;
    let b: SandboxContract<B>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        b = blockchain.openContract(
            B.createFromConfig(
                {
                    id: 0,
                },
                codeB
            )
        );

        deployer = await blockchain.treasury('deployer');

        let deployResult = await b.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: b.address,
            deploy: true,
            success: true,
        });

        a = blockchain.openContract(
            A.createFromConfig(
                {
                    id: 1,
                    score: 2,
                    B: b.address
                },
                codeA
            )
        );

        deployResult = await a.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: a.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and a are ready to use
    });

    it('should reset score to 1337', async () => {
        const increaser = await blockchain.treasury('player');

        expect(await a.getScore()).toBe(2);

        let result = await a.sendProvokeBounce(increaser.getSender(), {
            value: toNano('1.05'),
        });

        expect(await a.getScore()).toBe(1337);
        expect(await a.getID()).toBe(0x7e8764ef);
    });
});
