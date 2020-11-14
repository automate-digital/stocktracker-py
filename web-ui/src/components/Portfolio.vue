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
    </table>

    <span id="valuation" data-test="get-valuation"><router-link to="/valuation"><a>Get Valuation</a></router-link></span>
  </section>
</template>

<script>

export default {
  name: 'Portfolio',
  data() {
    return {
      stocks: {},
      newTicker: '',
      newUnits: ''
    }
  },
  methods: {
    getPortfolio() {
      fetch('api/portfolio')
      .then(response => response.json())
      .then(data => this.stocks = data)
      .catch(() => console.log('Retrieve Portfolio failed'))
    },

    deleteHolding(ticker) {
      if(confirm('Are you sure?')) {
        fetch('api/holding', {
          method: 'DELETE',
          headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
          body: `ticker=${ticker.toUpperCase()}`
        })
        .then(() => this.getPortfolio())
        .catch(() => console.log('Delete Holding failed'))
      }
    },

    addHolding() {
      fetch('api/holding', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
        body: `ticker=${this.newTicker.toUpperCase()}&units=${Number(this.newUnits)}`,
      })
      .then(() => this.getPortfolio())
      .catch(() => console.log('Add Holding failed'))

      this.resetInputs()
    },

    resetInputs() {
      this.newTicker = ''
      this.newUnits = ''
    }
  },
  mounted () {
    this.getPortfolio()
  }
}

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
