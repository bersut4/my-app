import { supabase } from './supabase'

export async function fetchFishingGrounds() {
  const { data, error } = await supabase
    .from('sh_fishing_grounds')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}
