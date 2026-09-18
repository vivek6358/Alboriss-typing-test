import React, { useState } from 'react';
import { X, Plus, Layers, BookOpen, Users } from 'lucide-react';
import { ACTUAL_PASSAGES, PRACTICE_PASSAGE, getNextPassageForBatchNumber } from '../../data/typingPassages';

export default function BatchModal({ isOpen, onClose, onCreateBatch, nextBatchNumber = 1 }) {
  const defaultPassage = getNextPassageForBatchNumber(nextBatchNumber);

  const [batchNumber, setBatchNumber] = useState(nextBatchNumber);
  const [name, setName] = useState(`Batch ${String(nextBatchNumber).padStart(2, '0')}`);
  const [passageId, setPassageId] = useState(defaultPassage.id);
  const [maxCandidates, setMaxCandidates] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateBatch({
        batch_number: Number(batchNumber),
        name: name.trim() || `Batch ${String(batchNumber).padStart(2, '0')}`,
        passage_id: passageId,
        max_candidates: Number(maxCandidates) || 15
      });
      onClose();
    } catch (err) {
      console.error('Failed to create batch:', err);
      alert('Error creating batch: ' + (err.message || 'Please try again'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold uppercase tracking-wider">
              Create New Assessment Batch
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Batch Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Batch 02"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batch Number
              </label>
              <input
                type="number"
                min={1}
                required
                value={batchNumber}
                onChange={(e) => {
                  const num = Number(e.target.value) || 1;
                  setBatchNumber(num);
                  setName(`Batch ${String(num).padStart(2, '0')}`);
                  setPassageId(getNextPassageForBatchNumber(num).id);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Limit (Slots)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={maxCandidates}
                onChange={(e) => setMaxCandidates(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Actual Assessment Passage
            </label>
            <select
              value={passageId}
              onChange={(e) => setPassageId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {ACTUAL_PASSAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  Passage {p.code}: {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Rotates across batches (Passage A through F) so each batch gets a different test.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-0.5">Practice Passage:</span>
            <span>Unique Practice Passage automatically assigned for Batch {String(batchNumber).padStart(2, '0')}.</span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Batch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
