export interface MockArticle {
  id: string
  title: string
  slug: string
  category: string
  categorySlug: string
  publishedAt: string
  excerpt?: string
  image?: string
}

export interface TickerRate {
  name: string
  value: string
  direction: 'up' | 'down'
  change: string
  font?: string
}

export interface GainerLoserRow {
  company: string
  value: string
  change: string
}

export const MOCK_TICKER_RATES: TickerRate[] = [
  { name: 'NIFTY 50', value: '22,641.3', direction: 'up', change: '+0.78%' },
  { name: 'SENSEX', value: '74,454.1', direction: 'up', change: '+0.63%' },
  { name: 'BANKNIFTY', value: '48,220.5', direction: 'down', change: '−0.31%' },
  { name: 'S&P 500', value: '5,842.16', direction: 'up', change: '+0.63%' },
  { name: 'NASDAQ', value: '18,931', direction: 'up', change: '+1.04%', font: 'Hind Vadodara' },
  { name: 'DOW', value: '42,180', direction: 'down', change: '−0.22%' },
  { name: 'USD/INR', value: '83.42', direction: 'down', change: '−0.08%' },
  { name: 'GOLD', value: '₹71,840', direction: 'up', change: '+0.42%' },
  { name: 'BITCOIN', value: '$63,220', direction: 'down', change: '−1.12%' },
  { name: 'OIL (WTI)', value: '$79.84', direction: 'up', change: '+0.18%' }
]

export const MOCK_GAINERS: GainerLoserRow[] = [
  { company: 'DCM Shriram Intl.', value: '₹84.24', change: '+20.00' },
  { company: 'Gokul Agro Resources', value: '₹191.00', change: '+20.00' },
  { company: 'Aksh Optifibre', value: '₹5.05', change: '+17.99' },
  { company: 'Oil Country Tub.', value: '₹44.36', change: '+19.99' },
  { company: 'Mittal Life Style', value: '₹10.85', change: '+19.72' }
]

export const MOCK_LOSERS: GainerLoserRow[] = [
  { company: 'Tata Steel', value: '₹167.40', change: '-4.20' },
  { company: 'Reliance Ind.', value: '₹2,840.15', change: '-2.15' },
  { company: 'HDFC Bank', value: '₹1,505.00', change: '-1.85' },
  { company: 'Infosys', value: '₹1,420.30', change: '-1.40' },
  { company: 'Wipro', value: '₹452.10', change: '-1.25' }
]

export const MOCK_ARTICLES: MockArticle[] = [
  {
    id: 'mock-1',
    title: 'સેન્સેક્સ ટુડે | સ્ટોક માર્કેટ LIVE અપડેટ: નિફ્ટી 23,600 ની સપાટીએ; ICICI બેંક ટોપ ગેઇનર, બેન્કિંગ ઈન્ડેક્સ રેકોર્ડ ઊંચાઈ પર',
    slug: 'sensex-today-stock-market-live-update-nifty-23600-icici-bank-top-gainer',
    category: 'Market',
    categorySlug: 'market',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    excerpt: 'ભારતીય શેરબજારે મંગળવારે સતત ચોથા સત્રમાં ઊંચાઈ નોંધાવી, કારણ કે ICICI બેંક અને HDFC બેંક જેવા હેવીવેઇટ્સની આગેવાનીમાં બેન્કિંગ સ્ટોક્સમાં તેજી જોવા મળી. નિફ્ટી 50 ઈન્ડેક્સ 23,600 ની માનસિક સપાટી પાર કરી ગયો, જ્યારે સેન્સેક્સ 78,200 ની નજીક પહોંચ્યો. વિદેશી સંસ્થાગત રોકાણકારો (FII) એ સતત છઠ્ઠા દિવસે ખરીદી ચાલુ રાખી, જે રોકાણકારોના વિશ્વાસને દર્શાવે છે. વિશ્લેષકો માને છે કે Q4 પરિણામો અને RBI ની આગામી નીતિ સમીક્ષા આગળના વલણને નક્કી કરશે.',
    image: 'mock-img-market'
  },
  {
    id: 'mock-2',
    title: 'ICICI બેંકનો નફો 24% વધ્યો, મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું',
    slug: 'icici-bank-profit-rises-24-percent',
    category: 'Market',
    categorySlug: 'market',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-icici'
  },
  {
    id: 'mock-3',
    title: 'ચૂંટણી પંચે પશ્ચિમ બંગાળમાં 19 વરિષ્ઠ પોલીસ અધિકારીઓની બદલી કરી',
    slug: 'election-commission-transfers-19-police-officers-in-west-bengal',
    category: 'Politics',
    categorySlug: 'politics',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-politics'
  },
  {
    id: 'mock-4',
    title: 'RBI એ રેપો રેટ 6.25% પર સ્થિર રાખ્યો, વાર્ષિક ફુગાવો અનુમાન ઘટાડ્યું',
    slug: 'rbi-keeps-repo-rate-unchanged-at-6-25-percent',
    category: 'Market',
    categorySlug: 'market',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-rbi'
  },
  {
    id: 'mock-5',
    title: 'ટાટા મોટર્સનો EV બિઝનેસ Q4 માં પ્રથમ વખત નફામાં આવ્યો',
    slug: 'tata-motors-ev-business-profitable-in-q4',
    category: 'Economy',
    categorySlug: 'economy',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-tata'
  },
  {
    id: 'mock-6',
    title: 'Reliance Jio એ 5G નેટવર્કમાં ₹25,000 કરોડનું વધારાનું રોકાણ જાહે...',
    slug: 'reliance-jio-announces-25000-crore-investment-in-5g',
    category: 'Business',
    categorySlug: 'business',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-jio'
  },
  {
    id: 'mock-7',
    title: 'સોનું ₹71,840 ની વિક્રમ ઊંચાઈએ, MCX પર ચાંદી ₹89,200 પ્રતિ કિલો',
    slug: 'gold-reaches-record-high-of-71840-silver-at-89200',
    category: 'Technology',
    categorySlug: 'technology',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-gold'
  },
  {
    id: 'mock-8',
    title: 'Adani Green એ ગુજરાતમાં 10 GW સોલાર પ્રોજેક્ટ માટે કેન્દ્રની મંજૂરી મેળવી',
    slug: 'adani-green-gets-approval-for-10gw-solar-in-gujarat',
    category: 'Companies',
    categorySlug: 'companies',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-adani'
  },
  {
    id: 'mock-9',
    title: 'ઈન્ફોસિસે Q4 માં મજબૂત ડીલ વિન્સ બાદ FY27 ગાઈડન્સ વધારી',
    slug: 'infosys-q4-results-fy27-guidance',
    category: 'World',
    categorySlug: 'world',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-infosys'
  },
  {
    id: 'mock-10',
    title: 'વેદાન્તાનું બોર્ડ ડિવિડન્ડ પર વિચારણા કરશે, શેરમાં 4% ની તેજી',
    slug: 'vedanta-board-to-consider-dividend',
    category: 'Market',
    categorySlug: 'market',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-vedanta'
  },
  {
    id: 'mock-11',
    title: 'મારુતિ સુઝુકીએ એપ્રિલમાં વેચાણમાં 7.3% વાર્ષિક વૃદ્ધિ નોંધાવી',
    slug: 'maruti-suzuki-sales-grow-7-3-percent-in-april',
    category: 'Economy',
    categorySlug: 'economy',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-maruti'
  },
  {
    id: 'mock-12',
    title: 'SEBI એ નવા F&O સેગમેન્ટ માટે કડક માર્જિન નિયમો જાહેર કર્યા',
    slug: 'sebi-announces-strict-margin-rules-for-fo',
    category: 'Business',
    categorySlug: 'business',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-sebi'
  },
  {
    id: 'mock-13',
    title: 'બિટકોઈનમાં 4% ઘટાડો, $63,200 પર; ETF આઉટફ્લો ચાલુ',
    slug: 'bitcoin-falls-4-percent-to-63200',
    category: 'Technology',
    categorySlug: 'technology',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-bitcoin'
  },
  {
    id: 'mock-14',
    title: 'L&T ને મધ્ય પૂર્વમાં ₹15,000 કરોડનો સૌથી મોટો EPC કોન્ટ્રાક્ટ મળ્યો',
    slug: 'lt-wins-15000-crore-epc-contract-in-middle-east',
    category: 'Companies',
    categorySlug: 'companies',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-lt'
  },
  {
    id: 'mock-15',
    title: 'ઝોમેટોએ બ્લિન્કિટ માટે હાઈપરલોકલ ડિલિવરી ફી મોડેલમાં ફેરફાર કર્યો',
    slug: 'zomato-changes-blinkit-delivery-fee-model',
    category: 'World',
    categorySlug: 'world',
    publishedAt: '17 March, 2026 · 2:17 PM IST',
    image: 'mock-img-zomato'
  }
]
