import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qybdpftzerqyitoaaktz.supabase.co',
  'sb_publishable_Vs_Cy5Igxaw39Q_jf71AxQ_ZqKPz-RY'
)

async function run() {
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .order('imdb_rank', { ascending: true })

  if (error) {
    console.error('Error:', error.message)
    return
  }

  const seen = {}
  const duplicates = []

  for (const movie of movies) {
    if (seen[movie.imdb_id]) {
      duplicates.push(movie)
    } else {
      seen[movie.imdb_id] = true
    }
  }

  if (duplicates.length === 0) {
    console.log('No duplicates found!')
  } else {
    console.log(`Found ${duplicates.length} duplicates:\n`)
    for (const m of duplicates) {
      console.log(`ID: ${m.id} | Rank: ${m.imdb_rank} | ${m.title}`)
    }
  }
}

run()