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
  // Get all movies with missing posters
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .or('poster_url.is.null,poster_url.eq.')

  if (error) {
    console.error('Error fetching movies:', error.message)
    return
  }

  console.log(`Found ${movies.length} movies with missing posters\n`)

  for (const movie of movies) {
    process.stdout.write(`Fixing: ${movie.title}... `)

    const url = `https://www.omdbapi.com/?i=${movie.imdb_id}&apikey=${OMDB_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.Response === 'True' && data.Poster && data.Poster !== 'N/A') {
      const { error: updateError } = await supabase
        .from('movies')
        .update({ poster_url: data.Poster })
        .eq('id', movie.id)

      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`)
      } else {
        console.log(`✓`)
      }
    } else {
      console.log(`⚠ No poster available on OMDB`)
    }

    await sleep(300)
  }

  console.log('\n✅ Done!')
}

run()