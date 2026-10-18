import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Headphones,
  Briefcase,
  Plus,
  Check,
  Pencil,
  Trash2,
  Bot,
  Sparkles,
  Calendar,
  Database
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { personas as defaultPersonas } from '@/data/mockData';

const iconMap = {
  GraduationCap,
  Headphones,
  Briefcase,
  Bot,
  Sparkles
};

export default function PersonasPage() {
  const [personasList, setPersonasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(() => {
    return localStorage.getItem('wb_active_persona') || 'nexus-consultant';
  });

  // Edit Persona Modal State
  const [editingPersona, setEditingPersona] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');

  // Add Custom Persona Modal State
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newIcon, setNewIcon] = useState('Bot');
  const [enableCalendarTool, setEnableCalendarTool] = useState(true);
  const [enableSheetsTool, setEnableSheetsTool] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Load default personas merged with any user created custom personas from localStorage
    const savedCustom = localStorage.getItem('wb_custom_personas');
    let customList = [];
    if (savedCustom) {
      try {
        customList = JSON.parse(savedCustom);
      } catch {
        customList = [];
      }
    }

    const merged = [...defaultPersonas, ...customList];
    setPersonasList(merged);
    setLoading(false);
  }, []);

  const handleOpenEdit = (persona) => {
    setEditingPersona(persona);
    setEditPrompt(persona.systemPrompt);
  };

  const handleSaveEdit = () => {
    if (!editingPersona) return;
    const updated = personasList.map((p) =>
      p.id === editingPersona.id ? { ...p, systemPrompt: editPrompt } : p
    );
    setPersonasList(updated);

    // If it's a custom persona, persist changes to localStorage
    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem('wb_custom_personas', JSON.stringify(customOnly));

    setEditingPersona(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    localStorage.setItem('wb_active_persona', id);
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter a persona title');
      return;
    }
    if (!newPrompt.trim()) {
      setFormError('Please enter system instructions for this persona');
      return;
    }

    const tools = [];
    if (enableCalendarTool) tools.push('Google Calendar (poojasahuu2006@gmail.com)');
    if (enableSheetsTool) tools.push('Nexus KnowledgeBase (Google Sheets)');

    const customPersona = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom AI persona for your business inquiries.',
      icon: newIcon,
      isCustom: true,
      systemPrompt: newPrompt.trim(),
      tools,
      model: 'gpt-5-mini'
    };

    const updated = [...personasList, customPersona];
    setPersonasList(updated);

    // Save custom personas in localStorage
    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem('wb_custom_personas', JSON.stringify(customOnly));

    // Auto-select the newly created custom persona
    setSelectedId(customPersona.id);
    localStorage.setItem('wb_active_persona', customPersona.id);

    // Reset form and close modal
    setNewTitle('');
    setNewDesc('');
    setNewPrompt('');
    setNewIcon('Bot');
    setEnableCalendarTool(true);
    setEnableSheetsTool(false);
    setFormError('');
    setIsCreatingCustom(false);
  };

  const handleDeleteCustom = (id) => {
    const updated = personasList.filter((p) => p.id !== id);
    setPersonasList(updated);
    const customOnly = updated.filter((p) => p.isCustom);
    localStorage.setItem('wb_custom_personas', JSON.stringify(customOnly));

    if (selectedId === id) {
      setSelectedId('nexus-consultant');
      localStorage.setItem('wb_active_persona', 'nexus-consultant');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">AI Personas</h1>
          <p className="mt-1 text-sm text-ink-500">
            Choose and customize how your autonomous AI agent behaves and speaks to customers.
          </p>
        </div>
        <Button onClick={() => setIsCreatingCustom(true)}>
          <Plus className="h-4 w-4" />
          Add Custom Persona
        </Button>
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
                  transition={{ duration: 0.4, delay: i * 0.05 }}
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
                    <div className="mt-5 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-ink-900">{persona.title}</h3>
                      {persona.isCustom && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          Custom
                        </span>
                      )}
                    </div>
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
                    <div className="mt-5 flex items-center justify-between pt-2 border-t border-cream-200">
                      <div className="flex gap-2">
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

                      {persona.isCustom && (
                        <button
                          onClick={() => handleDeleteCustom(persona.id)}
                          title="Delete Custom Persona"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}

        {/* Add custom clickable card */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: personasList.length * 0.05 }}
          >
            <button
              type="button"
              onClick={() => setIsCreatingCustom(true)}
              className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 p-6 text-center transition-all hover:border-whatsapp-400 hover:bg-whatsapp-50/50 hover:shadow-md cursor-pointer group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-ink-400 transition-colors group-hover:bg-whatsapp-500 group-hover:text-white">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-ink-700 group-hover:text-whatsapp-700">Add Custom</p>
                <p className="mt-1 text-sm text-ink-400">Create a personalized AI persona</p>
              </div>
            </button>
          </motion.div>
        )}
      </div>

      {/* Edit System Prompt Modal */}
      <Modal
        open={!!editingPersona}
        onClose={() => setEditingPersona(null)}
        title={`Edit: ${editingPersona?.title ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingPersona(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-600">
          System Prompt Instructions
        </label>
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-900 outline-none transition-all placeholder:text-ink-400 focus:border-whatsapp-400 focus:ring-2 focus:ring-whatsapp-100"
          placeholder="Describe how the AI agent should behave..."
        />
        <p className="mt-2 text-xs text-ink-400">
          This prompt tells your AI agent how to respond to customer queries on WhatsApp.
        </p>
      </Modal>

      {/* Create Custom Persona Modal */}
      <Modal
        open={isCreatingCustom}
        onClose={() => {
          setIsCreatingCustom(false);
          setFormError('');
        }}
        title="Create Custom AI Persona"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreatingCustom(false);
                setFormError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCustom}>Create Persona</Button>
          </>
        }
      >
        <form onSubmit={handleCreateCustom} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-600">
              Persona Name
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Real Estate Sales Agent, Fitness Coach..."
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-whatsapp-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-600">
              Short Description
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Answers buyer inquiries and books property tours."
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-whatsapp-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-600">
              Icon
            </label>
            <div className="flex gap-2">
              {['Bot', 'Briefcase', 'Sparkles', 'Headphones', 'GraduationCap'].map((iconKey) => {
                const IconC = iconMap[iconKey] || Bot;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setNewIcon(iconKey)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                      newIcon === iconKey
                        ? 'border-whatsapp-500 bg-whatsapp-50 text-whatsapp-600 ring-2 ring-whatsapp-400'
                        : 'border-cream-300 bg-cream-50 text-ink-500 hover:bg-cream-100'
                    }`}
                  >
                    <IconC className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-600">
              Connected Tools
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCalendarTool}
                  onChange={(e) => setEnableCalendarTool(e.target.checked)}
                  className="rounded border-cream-300 text-whatsapp-600 focus:ring-whatsapp-500"
                />
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>Google Calendar (Appointment & Consultation Booking)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSheetsTool}
                  onChange={(e) => setEnableSheetsTool(e.target.checked)}
                  className="rounded border-cream-300 text-whatsapp-600 focus:ring-whatsapp-500"
                />
                <Database className="h-4 w-4 text-teal-600" />
                <span>Google Sheets (Pricing & KnowledgeBase Search)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-600">
              System Prompt (Instructions)
            </label>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              rows={4}
              placeholder="You are an expert sales consultant for... Always be helpful, polite, and reply in 1 crisp sentence."
              className="w-full rounded-xl border border-cream-300 bg-cream-50 p-3 text-sm text-ink-900 outline-none focus:border-whatsapp-400 focus:bg-white"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
