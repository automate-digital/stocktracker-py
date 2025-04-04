import StockPortfolio from './components/StockPortfolio.vue';
import PortfolioValuation from './components/PortfolioValuation.vue';

export const routes = [
    { path: '/', component: StockPortfolio },
    { path: '/valuation', component: PortfolioValuation }
];
