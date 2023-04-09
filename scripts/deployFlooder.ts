import { toNano } from 'ton-core';
import { Flooder } from '../wrappers/Flooder';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const flooder = provider.open(Flooder.createFromConfig({}, await compile('Flooder')));

    await flooder.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(flooder.address);

    // run methods on `flooder`
}
