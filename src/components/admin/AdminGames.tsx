import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface GameForm {
  title: string;
  description: string;
  price: string;
  is_free: boolean;
  steam_link: string;
  epic_link: string;
  image_url: string;
  video_url: string;
  is_public: boolean;
}

const emptyForm: GameForm = {
  title: '', description: '', price: '0', is_free: true,
  steam_link: '', epic_link: '', image_url: '', video_url: '', is_public: true,
};

const AdminGames = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GameForm>(emptyForm);

  const { data: games } = useQuery({
    queryKey: ['admin-games'],
    queryFn: async () => {
      const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description || null,
        price: form.is_free ? 0 : parseFloat(form.price) || 0,
        is_free: form.is_free,
        steam_link: form.steam_link || null,
        epic_link: form.epic_link || null,
        image_url: form.image_url || null,
        video_url: form.video_url || null,
        is_public: form.is_public,
      };
      if (editId) {
        const { error } = await supabase.from('games').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('games').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['featured-games'] });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast.success(editId ? 'Game updated!' : 'Game added!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-games'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (game: any) => {
    setEditId(game.id);
    setForm({
      title: game.title,
      description: game.description || '',
      price: String(game.price || 0),
      is_free: game.is_free,
      steam_link: game.steam_link || '',
      epic_link: game.epic_link || '',
      image_url: game.image_url || '',
      video_url: game.video_url || '',
      is_public: game.is_public,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const updateField = (field: keyof GameForm, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">Manage Games</h2>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Game</Button>
      </div>

      <div className="space-y-3">
        {games?.map(game => (
          <div key={game.id} className="bg-card p-4 rounded-lg horror-border flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{game.title}</span>
                {!game.is_public && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Private</span>}
                {game.is_free ? (
                  <span className="text-xs text-primary">FREE</span>
                ) : (
                  <span className="text-xs text-accent-foreground">€{game.price}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(game)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(game.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {(!games || games.length === 0) && <p className="text-muted-foreground text-center py-8">No games yet</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Game' : 'Add Game'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={form.title} onChange={e => updateField('title', e.target.value)} className="bg-muted" />
            <Textarea placeholder="Description" value={form.description} onChange={e => updateField('description', e.target.value)} className="bg-muted" />
            
            <div className="flex items-center gap-3">
              <Switch checked={form.is_free} onCheckedChange={v => updateField('is_free', v)} />
              <span className="text-sm text-foreground">{form.is_free ? 'Free' : 'Paid'}</span>
            </div>
            {!form.is_free && (
              <Input type="number" placeholder="Price (EUR)" value={form.price} onChange={e => updateField('price', e.target.value)} className="bg-muted" />
            )}

            <Input placeholder="Steam Link (optional)" value={form.steam_link} onChange={e => updateField('steam_link', e.target.value)} className="bg-muted" />
            <Input placeholder="Epic Games Link (optional)" value={form.epic_link} onChange={e => updateField('epic_link', e.target.value)} className="bg-muted" />
            <Input placeholder="Image URL" value={form.image_url} onChange={e => updateField('image_url', e.target.value)} className="bg-muted" />
            <Input placeholder="Video URL (embed)" value={form.video_url} onChange={e => updateField('video_url', e.target.value)} className="bg-muted" />

            <div className="flex items-center gap-3">
              <Switch checked={form.is_public} onCheckedChange={v => updateField('is_public', v)} />
              <span className="text-sm text-foreground">{form.is_public ? 'Public' : 'Private'}</span>
            </div>

            <Button onClick={() => saveMutation.mutate()} disabled={!form.title.trim() || saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? 'Saving...' : editId ? 'Update Game' : 'Add Game'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGames;
