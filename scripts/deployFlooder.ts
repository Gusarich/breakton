import { toNano } from 'ton-core';
import { Flooder } from '../wrappers/Flooder';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { getSecureRandomBytes, keyPairFromSeed } from 'ton-crypto';

export async function run(provider: NetworkProvider) {
    const keypair = keyPairFromSeed(await getSecureRandomBytes(32));

    const flooder = provider.open(Flooder.createFromConfig({ publicKey: keypair.publicKey }, await compile('Flooder')));

    await flooder.sendDeploy(provider.sender(), toNano('0.25'));

    await provider.waitForDeploy(flooder.address);

    console.log('Secret key to use this flooder:', keypair.secretKey.toString('hex'));
}
