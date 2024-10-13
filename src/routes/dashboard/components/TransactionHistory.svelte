<script>
  import { onMount } from "svelte";
  import { StellarSdk } from "stellar-sdk"; // Ensure this is installed

  let transactions = [];
  let userPublicKey = "YOUR_PUBLIC_KEY"; // Replace with actual user's public key

  const fetchTransactionHistory = async () => {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    try {
      const response = await server.transactions().forAccount(userPublicKey).call();
      transactions = response.records;
    } catch (error) {
      console.error('Error fetching transaction history:', error.message);
    }
  };

  onMount(() => {
    fetchTransactionHistory();
  });
</script>

<div>
  <h2>Transaction History</h2>
  <ul>
    {#each transactions as transaction}
      <li>
        Transaction Hash: {transaction.id}, Amount: {transaction.amount}, 
        Created At: {new Date(transaction.created_at).toLocaleString()}
      </li>
    {/each}
  </ul>
</div>
