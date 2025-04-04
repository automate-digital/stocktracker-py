<template>
  <section id="valuation">
    <h3>Portfolio Value</h3>

    <div v-if="apiFail">
      <h4 id="failure-message">Problem getting response from server. Try again later.</h4>
    </div>

    <div v-if="!apiFail">
      <h4 id="portfolio-report" v-if="!thinking">Total Value of Portfolio
        <span id="portfolio-value" data-test="portfolio-value">{{ formatPrice(totalValue) }}</span>
      </h4>
    </div>

    <div id="spinner" v-if="thinking">
      <intersecting-circles-spinner
          :animation-duration="1200"
          :size="70"
          color="#ff1d5e" />
    </div>

    <span id="portfolio-link" data-test="portfolio-link"><router-link to="/"><a>View Portfolio</a></router-link></span>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { IntersectingCirclesSpinner } from 'epic-spinners';

export default {
  name: 'PortfolioValuation',
  components: { IntersectingCirclesSpinner },
  setup() {
    const totalValue = ref('');
    const thinking = ref(true);
    const apiFail = ref(false);

    const getValuation = () => {
      fetch('api/valuation')
        .then(response => response.json())
        .then(data => {
          totalValue.value = data['valuation'];
        })
        .catch(() => {
          console.log('Retrieve Valuation failed');
          apiFail.value = true;
        })
        .finally(() => {
          thinking.value = false;
        });
    };

    const formatPrice = value => {
      const val = (value / 1).toFixed(2);
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    onMounted(() => {
      getValuation();
    });

    return { totalValue, thinking, apiFail, formatPrice };
  }
};
</script>

<style scoped>
#portfolio-link {
  display: block;
  padding-top: 2em;
  text-align: left;
}
div#spinner {
  display: flex;
  justify-content: space-around;
}
#failure-message {
  color: red;
}
</style>
