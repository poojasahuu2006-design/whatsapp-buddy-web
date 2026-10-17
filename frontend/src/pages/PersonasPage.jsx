import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Headphones, Briefcase, Plus, Check, Pencil } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { personas as defaultPersonas } from '@/data/mockData';

const iconMap = {
  GraduationCap,
  Headphones,
  Briefcase,
};

export default function PersonasPage() {
  const [personasList, setPersonasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('nexus-consultant');
  const [editingPersona, setEditingPersona] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPersonasList(defaultPersonas);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenEdit = (persona) => {
    setEditingPersona(persona);
    setEditPrompt(persona.systemPrompt);
  };

  const handleSave = () => {
    if (!editingPersona) return;
    setPersonasList((prev) =>
      prev.map((p) => (p.id === editingPersona.id ? { ...p, systemPrompt: editPrompt } : p)),
    );
    setEditingPersona(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink-900">Personas</h1>
        <p className="mt-1 text-sm text-ink-500">Choose and customize how your AI agent behaves.</p>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-full" />
                    <Skeleton className="h-9 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            ))
          : personasList.map((persona, i) => {
              const Icon = iconMap[persona.icon] || Briefcase;
              const isSelected = selectedId === persona.id;
              return (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card
                    className={`relative p-6 transition-all ${
                      isSelected
                        ? 'border-2 border-whatsapp-500 shadow-lg shadow-whatsapp-500/10'
                        : 'hover:border-whatsapp-300 hover:shadow-lg'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-whatsapp-500 text-white shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                        isSelected ? 'bg-whatsapp-500 text-white' : 'bg-whatsapp-50 text-whatsapp-600'
                      }`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-ink-900">{persona.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">
                      {persona.description}
                    </p>
                    {persona.tools && persona.tools.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                          Connected Tools:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {persona.tools.map((tool) => (
                            <span
                              key={tool}
                              className="rounded-md border border-cream-300 bg-cream-100/80 px-2 py-0.5 text-[11px] font-semibold text-ink-700"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-5 flex gap-2">
                      <Button
                        variant={isSelected ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleSelect(persona.id)}
                      >
                        {isSelected ? 'Active' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(persona)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

        {/* Add custom card */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: personasList.length * 0.1 }}
          >
            <button className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 p-6 text-center transition-all hover:border-whatsapp-300 hover:bg-whatsapp-50/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-ink-400 transition-colors">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-ink-700">Add Custom</p>
                <p className="mt-1 text-sm text-ink-400">Create a personalized AI persona</p>
              </div>
            </button>
          </motion.div>
        )}
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editingPersona}
        onClose={() => setEditingPersona(null)}
        title={`Edit: ${editingPersona?.title ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingPersona(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-600">
          System Prompt
        </label>
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-400 focus:border-whatsapp-400 focus:ring-2 focus:ring-whatsapp-100"
          placeholder="Describe how the AI agent should behave..."
        />
        <p className="mt-2 text-xs text-ink-400">
          This prompt tells your AI agent how to respond to customer messages.
        </p>
      </Modal>
    </div>
  );
}
