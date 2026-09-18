import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// ==============================================================================
// LOCAL STORAGE MOCK STORE (Fallback when Supabase URL/Key not yet entered in .env)
// ==============================================================================
const STORAGE_KEYS = {
  BATCHES: 'alboriss_batches_v1',
  ATTEMPTS: 'alboriss_attempts_v1'
};

function getLocalBatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) {
      // Default initial Batch 01
      const initial = [
        {
          id: 'b1-demo-uuid',
          batch_number: 1,
          name: 'Batch 01',
          status: 'OPEN',
          passage_id: 'passage_a',
          max_candidates: 15,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          ended_at: null
        }
      ];
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalBatches(batches) {
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  window.dispatchEvent(new CustomEvent('alboriss_local_update'));
}

function getLocalAttempts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAttempts(attempts) {
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  window.dispatchEvent(new CustomEvent('alboriss_local_update'));
}

// ==============================================================================
// PUBLIC API METHODS
// ==============================================================================

/**
 * Get the currently open batch (candidates automatically join this)
 */
export async function getActiveOpenBatch() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('status', 'OPEN')
      .order('batch_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active open batch from Supabase:', error);
      throw error;
    }
    return data;
  }

  const batches = getLocalBatches();
  return batches.find(b => b.status === 'OPEN') || null;
}

/**
 * Get all batches for admin dashboard
 */
export async function getAllBatches() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('batch_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  return getLocalBatches().sort((a, b) => b.batch_number - a.batch_number);
}

/**
 * Get all typing attempts for a given batch
 */
export async function getBatchAttempts(batchId) {
  if (!batchId) return [];

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('typing_attempts')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  const attempts = getLocalAttempts();
  return attempts.filter(a => a.batch_id === batchId);
}

/**
 * Get all attempts across all batches for Master Export
 */
export async function getAllAttempts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('typing_attempts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  return getLocalAttempts();
}

/**
 * Check if candidate already has an attempt in this batch
 */
export async function checkCandidateAttempt(batchId, candidateName) {
  const cleanName = candidateName.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('typing_attempts')
      .select('*')
      .eq('batch_id', batchId)
      .ilike('candidate_name', cleanName);

    if (error) throw error;
    return data || [];
  }

  const attempts = getLocalAttempts();
  return attempts.filter(
    a => a.batch_id === batchId && a.candidate_name.trim().toLowerCase() === cleanName
  );
}

/**
 * Create a new batch
 */
export async function createBatch({ name, batch_number, passage_id = 'passage_a', max_candidates = 15 }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('batches')
      .insert([
        {
          name,
          batch_number,
          passage_id,
          max_candidates,
          status: 'OPEN',
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const batches = getLocalBatches();
  const newBatch = {
    id: `b-${Date.now()}`,
    batch_number,
    name,
    status: 'OPEN',
    passage_id,
    max_candidates,
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    ended_at: null
  };
  batches.unshift(newBatch);
  saveLocalBatches(batches);
  return newBatch;
}

/**
 * Update batch status ('OPEN' or 'CLOSED')
 */
export async function updateBatchStatus(batchId, status) {
  const updatePayload = {
    status,
    ...(status === 'CLOSED' ? { ended_at: new Date().toISOString() } : {})
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('batches')
      .update(updatePayload)
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const batches = getLocalBatches();
  const index = batches.findIndex(b => b.id === batchId);
  if (index !== -1) {
    batches[index] = { ...batches[index], ...updatePayload };
    saveLocalBatches(batches);
    return batches[index];
  }
  return null;
}

/**
 * Delete a batch and all its candidate attempts
 */
export async function deleteBatch(batchId) {
  if (!batchId) return false;

  if (isSupabaseConfigured) {
    // Delete typing attempts for this batch first
    const { error: attemptsError } = await supabase
      .from('typing_attempts')
      .delete()
      .eq('batch_id', batchId);
    if (attemptsError) console.warn('Note deleting attempts:', attemptsError);

    // Delete the batch
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId);

    if (error) throw error;
    return true;
  }

  const batches = getLocalBatches().filter(b => b.id !== batchId);
  saveLocalBatches(batches);
  const attempts = getLocalAttempts().filter(a => a.batch_id !== batchId);
  saveLocalAttempts(attempts);
  return true;
}

/**
 * Create a typing attempt (called when practice starts or when actual test starts)
 */
export async function createAttempt(attemptData) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('typing_attempts')
      .insert([
        {
          ...attemptData,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const attempts = getLocalAttempts();
  const newAttempt = {
    id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...attemptData,
    created_at: new Date().toISOString()
  };
  attempts.push(newAttempt);
  saveLocalAttempts(attempts);
  return newAttempt;
}

/**
 * Update a typing attempt (e.g. IN_PROGRESS -> COMPLETED or INVALID)
 */
export async function updateAttempt(attemptId, updateData) {
  if (!attemptId) return null;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('typing_attempts')
      .update(updateData)
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const attempts = getLocalAttempts();
  const index = attempts.findIndex(a => a.id === attemptId);
  if (index !== -1) {
    attempts[index] = { ...attempts[index], ...updateData };
    saveLocalAttempts(attempts);
    return attempts[index];
  }
  return null;
}

/**
 * Subscribe to real-time changes on typing_attempts for live admin monitor
 */
export function subscribeToBatchUpdates(onUpdate) {
  if (isSupabaseConfigured) {
    const channel = supabase
      .channel('public:assessment_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_attempts' }, (payload) => {
        onUpdate(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, (payload) => {
        onUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Local storage events fallback
  const handler = () => onUpdate({ type: 'local_storage_event' });
  window.addEventListener('alboriss_local_update', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('alboriss_local_update', handler);
    window.removeEventListener('storage', handler);
  };
}
