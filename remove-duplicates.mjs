import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://qybdpftzerqyitoaaktz.supabase.co',
  'sb_publishable_Vs_Cy5Igxaw39Q_jf71AxQ_ZqKPz-RY'
)

const idsToDelete = [
  '9b6de79b-d820-4021-96d9-c48b9cd860c5',
  '9da591a0-0a35-4add-959d-d116f65904a8',
  '769b2568-81b3-442b-9082-d2fdd736bc2e',
  'd8a09e73-7c88-41c5-8a3d-f73aac6cf8c7',
  '8ac7901d-7e6f-427a-8e2a-86eaf89fd088'
]

async function run() {
  const { error } = await supabase
    .from('movies')
    .delete()
    .in('id', idsToDelete)

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('✅ Deleted 5 duplicate movies successfully!')
  }
}

run()