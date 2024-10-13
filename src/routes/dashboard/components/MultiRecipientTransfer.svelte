<!--
@component

The `MultiRecipientTransfer` component allows the user to send XLM to multiple recipients in a single transaction,
utilizing the Stellar wallet from the `walletStore`.
-->

<script>
    import { onMount } from "svelte";
    import { StellarSdk } from "@stellar/stellar-sdk"; // Ensure this is installed
    import { walletStore } from "$lib/stores/walletStore";
    import { get } from "svelte/store";

    let recipients = [{ address: "", amount: "" }];
    let transactionResult = "";

    const addRecipient = () => {
        recipients.push({ address: "", amount: "" });
    };

    const removeRecipient = (index) => {
        if (index > 0) {
            recipients.splice(index, 1);
        }
    };

    const sendXLM = async () => {
        const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

        // Get the user's public key from the wallet store
        const publicKey = get(walletStore).publicKey;

        // Define the transaction builder and load the user's account
        try {
            const account = await server.loadAccount(publicKey);
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            });

            // Add payment operations for each recipient
            recipients.forEach(recipient => {
                if (recipient.address && recipient.amount) {
                    transaction.addOperation(StellarSdk.Operation.payment({
                        destination: recipient.address,
                        asset: StellarSdk.Asset.native(),
                        amount: recipient.amount,
                    }));
                }
            });

            const builtTransaction = transaction.setTimeout(30).build();

            // Get the user's secret key from the wallet store securely
            const userSecretKey = get(walletStore).devInfo?.secretKey; 
            if (!userSecretKey) {
                throw new Error('User secret key not found'); // Handle error for missing secret key
            }

            const signedTransaction = await walletStore.sign({
                transactionXDR: builtTransaction.toXDR(),
                network: StellarSdk.Networks.TESTNET,
                pincode: prompt('Enter your pincode to sign the transaction:')
            });

            // Submit the signed transaction to the Stellar network
            const result = await server.submitTransaction(signedTransaction);
            transactionResult = JSON.stringify(result, null, 2);
        } catch (error) {
            transactionResult = `Error: ${error.message}`;
        }
    };
</script>

<div class="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
    <h3 class="text-xl font-semibold mb-4">Send XLM to Multiple Recipients</h3>
    {#each recipients as recipient, index}
        <div class="mb-4 flex items-center space-x-2">
            <input type="text"
                   bind:value={recipient.address}
                   placeholder="Recipient Address"
                   class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input type="text"
                   bind:value={recipient.amount}
                   placeholder="Amount"
                   class="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button on:click={() => removeRecipient(index)} 
                    class="text-red-500 hover:text-red-700 transition-colors duration-200">
                Remove
            </button>
        </div>
    {/each}
    <div class="flex space-x-2 mb-4">
        <button on:click={addRecipient}
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200">
            Add Recipient
        </button>
        <button on:click={sendXLM}
                class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200">
            Send XLM
        </button>
    </div>

    {#if transactionResult}
        <pre class="mt-4 bg-gray-100 p-4 rounded-md text-sm">{transactionResult}</pre>
    {/if}
</div>
