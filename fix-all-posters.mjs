import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qybdpftzerqyitoaaktz.supabase.co',
  'sb_publishable_Vs_Cy5Igxaw39Q_jf71AxQ_ZqKPz-RY'
)

const OMDB_API_KEY = '98556dda'

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  // Get ALL movies and re-fetch every poster fresh from OMDB
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .order('imdb_rank', { ascending: true })

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Re-fetching posters for all ${movies.length} movies...\n`)

  for (const movie of movies) {
    process.stdout.write(`#${movie.imdb_rank} ${movie.title}... `)

    const url = `https://www.omdbapi.com/?i=${movie.imdb_id}&apikey=${OMDB_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      const { error: updateError } = await supabase
        .from('movies')
        .update({ poster_url: data.Poster })
        .eq('id', movie.id)

      if (updateError) {
        console.log(`❌ ${updateError.message}`)
      } else {
        console.log(`✓`)
      }
    } else {
      console.log(`⚠ No poster on OMDB`)
    }

    await sleep(300)
  }

  console.log('\n✅ All done!')
}

run()