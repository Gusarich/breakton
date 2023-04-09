import { toNano } from 'ton-core';
import { Flooder } from '../wrappers/Flooder';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { getSecureRandomBytes, keyPairFromSeed } from 'ton-crypto';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function run(provider: NetworkProvider) {
    const keypair = keyPairFromSeed(await getSecureRandomBytes(32));

    const flooder = provider.open(Flooder.createFromConfig({ publicKey: keypair.publicKey }, await compile('Flooder')));

    await flooder.sendDeploy(provider.sender(), toNano('0.33'));

    await provider.waitForDeploy(flooder.address);

    for (let i = 0; i < 100; i++) {
        await flooder.sendMessage(i, keypair);
        await sleep(100);
    }
}
