/**
 * Which coins this site has pages for: id, ticker and name, and nothing else.
 *
 * It answers the one question the network cannot answer while it is down — is
 * /coins/<slug> a real page or a typo? Without it, an unreachable upstream and
 * a made-up slug look identical, and the page has to guess. It guessed 404,
 * which meant a CoinGecko rate-limit took every coin page off the site.
 *
 * No prices, ranks or market caps live here. Those are only ever live, and a
 * number in a checked-in file would go stale the hour after it was committed.
 * A name does not.
 *
 * Regenerate with:
 *   node --experimental-strip-types packages/ingest/src/refresh-coins.ts
 *
 * Going stale costs little and costs it in the right direction: a coin listed
 * after the last refresh 404s during an outage instead of showing an honest
 * "prices unavailable", and one that has since left the top 100 is a name we
 * can still spell. Neither publishes anything untrue.
 */
export interface CoinRef {
  id: string;
  symbol: string;
  name: string;
}

/** Top 100 by market cap as of 2026-09-15. */
export const COIN_INDEX: readonly CoinRef[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USDC' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'tron', symbol: 'TRX', name: 'TRON' },
  { id: 'figure-heloc', symbol: 'FIGR_HELOC', name: 'Figure Heloc' },
  { id: 'zcash', symbol: 'ZEC', name: 'Zcash' },
  { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'usds', symbol: 'USDS', name: 'USDS' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'rain', symbol: 'RAIN', name: 'Rain' },
  { id: 'whitebit', symbol: 'WBT', name: 'WhiteBIT Coin' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'leo-token', symbol: 'LEO', name: 'LEO Token' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'ethena-usde', symbol: 'USDE', name: 'Ethena USDe' },
  { id: 'dai', symbol: 'DAI', name: 'Dai' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'usd1-wlfi', symbol: 'USD1', name: 'USD1' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'canton-network', symbol: 'CC', name: 'Canton' },
  { id: 'the-open-network', symbol: 'GRAM', name: 'Gram (prev. Toncoin)' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'global-dollar', symbol: 'USDG', name: 'Global Dollar' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
  { id: 'sui', symbol: 'SUI', name: 'Sui' },
  { id: 'paypal-usd', symbol: 'PYUSD', name: 'PayPal USD' },
  { id: 'crypto-com-chain', symbol: 'CRO', name: 'Cronos' },
  { id: 'blackrock-usd-institutional-digital-liquidity-fund', symbol: 'BUIDL', name: 'BlackRock USD Institutional Digital Liquidity Fund' },
  { id: 'tether-gold', symbol: 'XAUT', name: 'Tether Gold' },
  { id: 'hashnote-usyc', symbol: 'USYC', name: 'Circle USYC' },
  { id: 'bittensor', symbol: 'TAO', name: 'Bittensor' },
  { id: 'memecore', symbol: 'M', name: 'MemeCore' },
  { id: 'ripple-usd', symbol: 'RLUSD', name: 'Ripple USD' },
  { id: 'okb', symbol: 'OKB', name: 'OKB' },
  { id: 'ondo-us-dollar-yield', symbol: 'USDY', name: 'Ondo US Dollar Yield' },
  { id: 'bitway', symbol: 'BTW', name: 'Bitway' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave' },
  { id: 'aster-2', symbol: 'ASTER', name: 'Aster' },
  { id: 'pax-gold', symbol: 'PAXG', name: 'PAX Gold' },
  { id: 'mantle', symbol: 'MNT', name: 'Mantle' },
  { id: 'world-liberty-financial', symbol: 'WLFI', name: 'World Liberty Financial' },
  { id: 'ondo-finance', symbol: 'ONDO', name: 'Ondo' },
  { id: 'pump-fun', symbol: 'PUMP', name: 'Pump.fun' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'htx-dao', symbol: 'HTX', name: 'HTX DAO' },
  { id: 'usdd', symbol: 'USDD', name: 'USDD' },
  { id: 'morpho', symbol: 'MORPHO', name: 'Morpho' },
  { id: 'sky', symbol: 'SKY', name: 'Sky' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe' },
  { id: 'ethena', symbol: 'ENA', name: 'Ethena' },
  { id: 'usdgo', symbol: 'USDGO', name: 'USDGO' },
  { id: 'spiko-amundi-overnight-swap-fund-eur', symbol: 'EURSAFO', name: 'Spiko Amundi Overnight Swap Fund (EUR)' },
  { id: 'bitget-token', symbol: 'BGB', name: 'Bitget Token' },
  { id: 'worldcoin-wld', symbol: 'WLD', name: 'Worldcoin' },
  { id: 'falcon-finance', symbol: 'USDF', name: 'Falcon USD' },
  { id: 'united-stables', symbol: 'U', name: 'United Stables' },
  { id: 'bfusd', symbol: 'BFUSD', name: 'BFUSD' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  { id: 'lighter', symbol: 'LIT', name: 'Lighter' },
  { id: 'pi-network', symbol: 'PI', name: 'Pi Network' },
  { id: 'venice-token', symbol: 'VVV', name: 'Venice Token' },
  { id: 'polygon-ecosystem-token', symbol: 'POL', name: 'POL (ex-MATIC)' },
  { id: 'gatechain-token', symbol: 'GT', name: 'Gate' },
  { id: 'blockchain-capital', symbol: 'BCAP', name: 'Blockchain Capital' },
  { id: 'kucoin-shares', symbol: 'KCS', name: 'KuCoin' },
  { id: 'just', symbol: 'JST', name: 'JUST' },
  { id: 'kaspa', symbol: 'KAS', name: 'Kaspa' },
  { id: 'quant-network', symbol: 'QNT', name: 'Quant' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos Hub' },
  { id: 'eutbl', symbol: 'EUTBL', name: 'Spiko EU T-Bills Money Market Fund' },
  { id: 'nexo', symbol: 'NEXO', name: 'NEXO' },
  { id: 'jupiter-exchange-solana', symbol: 'JUP', name: 'Jupiter' },
  { id: 'superstate-short-duration-us-government-securities-fund-ustb', symbol: 'USTB', name: 'Invesco Short Duration US Government Securities Fund' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'stable-2', symbol: 'STABLE', name: '​​Stable' },
  { id: 'pancakeswap-token', symbol: 'CAKE', name: 'PancakeSwap' },
  { id: 'janus-henderson-anemoy-aaa-clo-fund', symbol: 'JAAA', name: 'Janus Henderson Anemoy AAA CLO Fund' },
  { id: 'render-token', symbol: 'RENDER', name: 'Render' },
  { id: 'janus-henderson-anemoy-treasury-fund', symbol: 'JTRSY', name: 'Janus Henderson Anemoy Treasury Fund' },
  { id: 'gho', symbol: 'GHO', name: 'GHO' },
  { id: 'dash', symbol: 'DASH', name: 'Dash' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective' },
  { id: 'beldex', symbol: 'BDX', name: 'Beldex' },
  { id: 'ether-fi', symbol: 'ETHFI', name: 'Ether.fi' },
  { id: 'xdce-crowd-sale', symbol: 'XDC', name: 'XDC Network' },
  { id: 'flare-networks', symbol: 'FLR', name: 'Flare' },
  { id: 'usual-usd', symbol: 'USD0', name: 'Usual USD' },
];

const BY_ID = new Map(COIN_INDEX.map((c) => [c.id, c]));

/** The coin with this slug, or null if we have never heard of it. */
export const coinRef = (id: string): CoinRef | null => BY_ID.get(id) ?? null;
