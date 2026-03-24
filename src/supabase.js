import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://epzhoickfdjgqcnwwahw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwemhvaWNrZmRqZ3Fjbnd3YWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODQ3NTMsImV4cCI6MjA4OTk2MDc1M30.FSiL-3dc5Y_U8eCi3u_0irnBRvVIVxMGIFCr7MqPiA0'

export const supabase = createClient(supabaseUrl, supabaseKey)