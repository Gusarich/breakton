import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Flooder } from '../wrappers/Flooder';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Flooder', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Flooder');
    });

    let blockchain: Blockchain;
    let flooder: SandboxContract<Flooder>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        flooder = blockchain.openContract(Flooder.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await flooder.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: flooder.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and flooder are ready to use
    });
});
