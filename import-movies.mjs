import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qybdpftzerqyitoaaktz.supabase.co',
  'sb_publishable_Vs_Cy5Igxaw39Q_jf71AxQ_ZqKPz-RY'
)

const OMDB_API_KEY = '98556dda'

// IMDb Top 250 IDs (in ranked order)
const imdbIds = [
  'tt0111161', 'tt0068646', 'tt0468569', 'tt0071562', 'tt0050083',
  'tt0108052', 'tt0167260', 'tt0110912', 'tt0120737', 'tt0060196',
  'tt0109830', 'tt0137523', 'tt0080684', 'tt1375666', 'tt0167261',
  'tt0073486', 'tt0099685', 'tt0133093', 'tt0047478', 'tt0317248',
  'tt0076759', 'tt0102926', 'tt0038650', 'tt0118799', 'tt0114369',
  'tt0245429', 'tt0120815', 'tt0816692', 'tt0114814', 'tt0110413',
  'tt0056058', 'tt0120689', 'tt0103064', 'tt0054215', 'tt0027977',
  'tt0021749', 'tt0253474', 'tt0407887', 'tt1675434', 'tt0088763',
  'tt0172495', 'tt0078788', 'tt0078748', 'tt0209144', 'tt0482571',
  'tt0032553', 'tt0064116', 'tt0034583', 'tt0047396', 'tt0082971',
  'tt0057012', 'tt0062622', 'tt0095765', 'tt0091251', 'tt0364569',
  'tt0119698', 'tt0361748', 'tt0169547', 'tt0087843', 'tt0052357',
  'tt0045152', 'tt4154796', 'tt0435761', 'tt0093058', 'tt0986264',
  'tt0105236', 'tt0081505', 'tt0180093', 'tt0033467', 'tt4154756',
  'tt0910970', 'tt0051201', 'tt0090605', 'tt0043014', 'tt0057565',
  'tt0023134', 'tt0025316', 'tt0112573', 'tt0053125', 'tt0114709',
  'tt0097576', 'tt0119488', 'tt1853728', 'tt0055630', 'tt0080678',
  'tt0071853', 'tt0169858', 'tt0042192', 'tt0012349', 'tt0053291',
  'tt0059578', 'tt0095327', 'tt2582802', 'tt0056172', 'tt1345836',
  'tt0986264', 'tt0407887', 'tt0116282', 'tt0118715', 'tt0022100',
  'tt0758758', 'tt1187043', 'tt0075314', 'tt0055031', 'tt0338013',
  'tt0476396', 'tt0198781', 'tt0107290', 'tt2106476', 'tt0264464',
  'tt0372784', 'tt0211915', 'tt0405094', 'tt0144084', 'tt0347149',
  'tt1745960', 'tt0050825', 'tt0056592', 'tt0066921', 'tt0120586',
  'tt0361748', 'tt0059742', 'tt2267998', 'tt0457430', 'tt0112471',
  'tt1130884', 'tt0364569', 'tt3011894', 'tt0268978', 'tt0052618',
  'tt1832382', 'tt0031381', 'tt0469494', 'tt1049413', 'tt0040522',
  'tt2278388', 'tt0892769', 'tt0325980', 'tt0266543', 'tt1291584',
  'tt0395169', 'tt0266697', 'tt0307901', 'tt0381681', 'tt1950186',
  'tt0093779', 'tt0114746', 'tt0077416', 'tt4633694', 'tt0120382',
  'tt0353969', 'tt1201607', 'tt0099348', 'tt0119217', 'tt0208092',
  'tt0046912', 'tt3748528', 'tt0072684', 'tt0457092', 'tt0401792',
  'tt0113277', 'tt0116231', 'tt0046268', 'tt0015864', 'tt1065073',
  'tt0758758', 'tt2015381', 'tt0978762', 'tt1392190', 'tt4729430',
  'tt0449059', 'tt1302011', 'tt0107048', 'tt0482571', 'tt2562232',
  'tt0040897', 'tt0050986', 'tt0072890', 'tt1895587', 'tt0469494',
  'tt0120735', 'tt3170832', 'tt2096673', 'tt0317248', 'tt0046035',
  'tt0087544', 'tt1276104', 'tt1010048', 'tt5027774', 'tt0088247',
  'tt0075148', 'tt0055761', 'tt0060827', 'tt0120382', 'tt0048473',
  'tt4016934', 'tt2119532', 'tt0073195', 'tt0032976', 'tt1504320',
  'tt1065073', 'tt1959563', 'tt0080455', 'tt3659388', 'tt0097165',
  'tt0112641', 'tt3315342', 'tt0057115', 'tt0042041', 'tt1441468',
  'tt1954470', 'tt1205489', 'tt1049413', 'tt0758758', 'tt2024544',
  'tt0162346', 'tt0060304', 'tt0118694', 'tt0071315', 'tt4912910',
  'tt0044741', 'tt1979320', 'tt1291584', 'tt0049406', 'tt0017136',
  'tt0092005', 'tt0120735', 'tt1291584', 'tt0116096', 'tt5311514',
  'tt0382932', 'tt1727587', 'tt0395169', 'tt6751668', 'tt5013056',
  'tt3783958', 'tt1979320', 'tt1675434', 'tt0892769', 'tt4154796'
]

// Remove duplicates while preserving order
const uniqueIds = [...new Set(imdbIds)]

async function fetchMovie(imdbId, rank) {
  const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.Response === 'False') {
    console.log(`❌ Not found: ${imdbId}`)
    return null
  }

  return {
    imdb_rank: rank,
    title: data.Title,
    year: parseInt(data.Year) || null,
    runtime: parseInt(data.Runtime) || null,
    genre: data.Genre ? data.Genre.split(',')[0].trim() : null,
    imdb_id: imdbId,
    poster_url: data.Poster !== 'N/A' ? data.Poster : null,
    watched: false
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  console.log(`Starting import of ${uniqueIds.length} movies...`)
  console.log('This will take a few minutes, please wait.\n')

  const movies = []

  for (let i = 0; i < uniqueIds.length; i++) {
    const id = uniqueIds[i]
    const rank = i + 1
    process.stdout.write(`Fetching #${rank}: ${id}... `)

    const movie = await fetchMovie(id, rank)
    if (movie) {
      movies.push(movie)
      console.log(`✓ ${movie.title}`)
    }

    // Wait 300ms between requests to avoid rate limiting
    await sleep(300)
  }

  console.log(`\nFetched ${movies.length} movies. Inserting into Supabase...`)

  // Insert in batches of 50
  const batchSize = 50
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize)
    const { error } = await supabase.from('movies').insert(batch)
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message)
    } else {
      console.log(`✓ Inserted movies ${i + 1}–${Math.min(i + batchSize, movies.length)}`)
    }
  }

  console.log('\n✅ Import complete!')
}

run()
