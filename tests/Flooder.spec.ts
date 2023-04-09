import { Blockchain, SandboxContract, Treasury, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Flooder } from '../wrappers/Flooder';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { KeyPair, getSecureRandomBytes, keyPairFromSeed } from 'ton-crypto';

describe('Flooder', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Flooder');
    });

    let blockchain: Blockchain;
    let flooder: SandboxContract<Flooder>;
    let keypair: KeyPair;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        keypair = keyPairFromSeed(await getSecureRandomBytes(32));

        flooder = blockchain.openContract(
            Flooder.createFromConfig(
                {
                    publicKey: keypair.publicKey,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');
    });

    it('should deploy', async () => {
        const deployResult = await flooder.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: flooder.address,
            deploy: true,
            success: true,
        });
    });

    it('should accept 1 message', async () => {
        await flooder.sendDeploy(deployer.getSender(), toNano('0.05'));

        const result = await flooder.sendMessage(0, keypair);
        expect(result.transactions).toHaveTransaction({
            to: flooder.address,
            success: true,
        });
    });

    it('should accept 100 messages', async () => {
        await flooder.sendDeploy(deployer.getSender(), toNano('1'));

        for (let i = 0; i < 100; i++) {
            const result = await flooder.sendMessage(i, keypair);
            expect(result.transactions).toHaveTransaction({
                to: flooder.address,
                success: true,
            });
        }
    });

    it('should reject messages with wrong seqno', async () => {
        await flooder.sendDeploy(deployer.getSender(), toNano('0.05'));

        await flooder.sendMessage(0, keypair);

        await expect(flooder.sendMessage(0, keypair)).rejects.toThrow('Error executing transaction');

        await flooder.sendMessage(1, keypair);

        await expect(flooder.sendMessage(1, keypair)).rejects.toThrow('Error executing transaction');
    });

    it('should reject messages with wrong signature', async () => {
        await flooder.sendDeploy(deployer.getSender(), toNano('0.05'));

        await flooder.sendMessage(0, keypair);

        const anotherKeypair = keyPairFromSeed(await getSecureRandomBytes(32));

        await expect(flooder.sendMessage(1, anotherKeypair)).rejects.toThrow('Error executing transaction');
    });
});
