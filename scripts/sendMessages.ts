import { toNano } from 'ton-core';
import { Flooder } from '../wrappers/Flooder';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { keyPairFromSecretKey } from 'ton-crypto';

const secretKey = Buffer.from(
    'd34080420981873e97244cf97f238fb9f8f0eb007c59e2d625900b6e77bf9e17d99a64236ae752bcb9f9d02ac5694af580a0b8eacf10f203c7cb04dcb833cd3d',
    'hex'
);

export async function run(provider: NetworkProvider) {
    const keypair = keyPairFromSecretKey(secretKey);

    const flooder = provider.open(Flooder.createFromConfig({ publicKey: keypair.publicKey }, await compile('Flooder')));

    for (let i = 0; i < 100; i++) {
        await flooder.sendMessage(i, keypair);
    }
}
