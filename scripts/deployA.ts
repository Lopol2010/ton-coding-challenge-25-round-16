import { toNano } from '@ton/core';
import { A } from '../wrappers/A';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const a = provider.open(
        A.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('A')
        )
    );

    await a.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(a.address);

    console.log('ID', await a.getID());
}
