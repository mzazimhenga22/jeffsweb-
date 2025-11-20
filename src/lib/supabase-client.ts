import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from './database.types'

// This client automatically reads/writes the `sb` auth cookies so session
// persists across navigations and refreshes.
export const supabase = createClientComponentClient<Database>()
