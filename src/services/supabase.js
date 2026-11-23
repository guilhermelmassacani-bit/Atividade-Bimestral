import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ackmtshcgvctnpytedqp.supabase.co';
const supabaseKey = 'sb_publishable_IMJzv3QPlPltCeU_li4lQw__Mr5ahCK';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);