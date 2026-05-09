import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qybdpftzerqyitoaaktz.supabase.co',
  'sb_publishable_Vs_Cy5Igxaw39Q_jf71AxQ_ZqKPz-RY'
)

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getPosterFromIMDb(imdbId) {
  const url = `https://www.imdb.com/title/${imdbId}/`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  })
  const html = await res.text()

  // Extract poster image from IMDb page meta tag
  const match = html.match(/"image"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/)
  if (match) return match[1]

  // Fallback: try og:image
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)
  if (og) return og[1]

  return null
}

async function run() {
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .or('poster_url.is.null,poster_url.eq.')

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Found ${movies.length} movies still missing posters\n`)

  for (const movie of movies) {
    process.stdout.write(`Fixing: ${movie.title}... `)

    const poster = await getPosterFromIMDb(movie.imdb_id)

    if (poster) {
      const { error: updateError } = await supabase
        .from('movies')
        .update({ poster_url: poster })
        .eq('id', movie.id)

      if (updateError) {
        console.log(`❌ ${updateError.message}`)
      } else {
        console.log(`✓`)
      }
    } else {
      console.log(`⚠ No poster found on IMDb either`)
    }

    await sleep(800)
  }

  console.log('\n✅ Done!')
}

run()