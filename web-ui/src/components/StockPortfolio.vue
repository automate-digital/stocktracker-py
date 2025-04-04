<template>
  <section id="portfolio">
    <h3>My Portfolio</h3>

    <table>
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Units</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(units, ticker) in stocks" v-bind:key="ticker" class="item" data-test="portfolio-item">
          <td>{{ ticker.toUpperCase() }}</td>
          <td>{{ units }}</td>
          <td><a v-on:click="deleteHolding(ticker)">delete</a></td>
        </tr>
        <tr id="add-item">
          <td><input type="text" name="new_ticker" data-test="new-ticker" v-model="newTicker"></td>
          <td><input type="text" name="new_units" data-test="new-units" v-model="newUnits"></td>
          <td><a v-on:click="addHolding()">add</a></td>
        </tr>
      </tbody>
    </table>

    <span id="valuation" data-test="get-valuation"><router-link to="/valuation"><a>Get Valuation</a></router-link></span>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'StockPortfolio',
  setup() {
    const stocks = ref({});
    const newTicker = ref('');
    const newUnits = ref('');

    const getPortfolio = () => {
      fetch('api/portfolio')
        .then(response => response.json())
        .then(data => (stocks.value = data))
        .catch(() => console.log('Retrieve Portfolio failed'));
    };

    const deleteHolding = ticker => {
      if (confirm('Are you sure?')) {
        fetch('api/holding', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `ticker=${ticker.toUpperCase()}`
        })
          .then(() => getPortfolio())
          .catch(() => console.log('Delete Holding failed'));
      }
    };

    const addHolding = () => {
      fetch('api/holding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `ticker=${newTicker.value.toUpperCase()}&units=${Number(newUnits.value)}`
      })
        .then(() => getPortfolio())
        .catch(() => console.log('Add Holding failed'));

      resetInputs();
    };

    const resetInputs = () => {
      newTicker.value = '';
      newUnits.value = '';
    };

    onMounted(() => {
      getPortfolio();
    });

    return { stocks, newTicker, newUnits, getPortfolio, deleteHolding, addHolding, resetInputs };
  }
};
</script>

<style scoped>
  input {
    width: 5em;
    border: #999 solid 1px;
    text-transform: uppercase;
  }
  #valuation {
    display: block;
    padding-top: 2em;
    text-align: left;
  }
</style>
