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
  // Test Supabase-verbinding
  const { data: movies, error: supabaseError } = await supabase
    .from('movies')
    .select('id, title, imdb_id')
    .order('imdb_rank', { ascending: true })

  if (supabaseError) {
    console.error('Supabase error:', supabaseError)
    return
  }

  if (!movies || movies.length === 0) {
    console.log('Geen films gevonden in de tabel "movies". Controleer de tabelnaam en data.')
    return
  }

  console.log(`Fetching RT scores for ${movies.length} movies...\n`)

  for (const movie of movies) {
    process.stdout.write(`${movie.title} (IMDb: ${movie.imdb_id})... `)

    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdb_id}&tomatoes=true&apikey=${OMDB_API_KEY}`)
      const data = await res.json()

      if (data.Error) {
        console.log(`— OMDB error: ${data.Error}`)
        continue
      }

      const rtRating = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')
      const rtScore = rtRating ? rtRating.Value.replace('%', '') : null // Verwijder % voor opslag als nummer

      if (rtScore) {
        const { error: updateError } = await supabase
          .from('movies')
          .update({ rt_score: rtScore })
          .eq('id', movie.id)

        if (updateError) {
          console.log(`— Update error: ${updateError.message}`)
        } else {
          console.log(`✓ ${rtScore}%`)
        }
      } else {
        console.log(`— no Rotten Tomatoes score`)
      }
    } catch (err) {
      console.log(`— Request failed: ${err.message}`)
    }

    await sleep(1000) // 1 seconde wachten
  }

  console.log('\n✅ Done!')
}

run()