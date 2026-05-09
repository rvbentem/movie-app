import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qybdpftzerqyitoaaktz.supabase.co',
  'sb_publishable_Vs_Cy5Igxaw39Q_jf71AxQ_ZqKPz-RY'
)

async function run() {
  // Get all movies ordered by current rank
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .order('imdb_rank', { ascending: true })

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Total movies in DB: ${movies.length}`)

  // Find duplicates
  const rankCount = {}
  for (const m of movies) {
    rankCount[m.imdb_rank] = (rankCount[m.imdb_rank] || 0) + 1
  }

  const duplicateRanks = Object.entries(rankCount).filter(([, count]) => count > 1)
  console.log(`\nDuplicate ranks found: ${duplicateRanks.length}`)
  for (const [rank, count] of duplicateRanks) {
    const dupes = movies.filter(m => m.imdb_rank === parseInt(rank))
    console.log(`  Rank ${rank} (${count}x): ${dupes.map(m => m.title).join(', ')}`)
  }

  // Remove duplicate imdb_ids, keep the one with the correct rank
  const seenImdbIds = new Set()
  const toDelete = []

  for (const movie of movies) {
    if (seenImdbIds.has(movie.imdb_id)) {
      toDelete.push(movie.id)
    } else {
      seenImdbIds.add(movie.imdb_id)
    }
  }

  if (toDelete.length > 0) {
    console.log(`\nDeleting ${toDelete.length} duplicate entries...`)
    const { error: deleteError } = await supabase
      .from('movies')
      .delete()
      .in('id', toDelete)

    if (deleteError) {
      console.error('Delete error:', deleteError.message)
      return
    }
    console.log('✓ Duplicates deleted')
  }

  // Re-number all ranks cleanly 1 to N
  console.log('\nRe-numbering ranks...')
  const { data: remaining } = await supabase
    .from('movies')
    .select('id, title, imdb_rank')
    .order('imdb_rank', { ascending: true })

  for (let i = 0; i < remaining.length; i++) {
    await supabase
      .from('movies')
      .update({ imdb_rank: i + 1 })
      .eq('id', remaining[i].id)
  }

  console.log(`\n✅ Done! ${remaining.length} movies with clean ranks 1–${remaining.length}`)
}

run()