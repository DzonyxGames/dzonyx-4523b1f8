import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminSuggestions = () => {
  const queryClient = useQueryClient();

  const { data: suggestions } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('suggestions')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-bold text-foreground">All Suggestions</h2>
      <div className="space-y-3">
        {suggestions?.map((s: any) => (
          <div key={s.id} className="bg-card p-4 rounded-lg horror-border flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{s.profiles?.username || 'Unknown'}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(s.created_at), 'MMM dd, yyyy')}</span>
                {s.is_public ? (
                  <Globe className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Lock className="w-3 h-3 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.text}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)} className="text-destructive flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {(!suggestions || suggestions.length === 0) && <p className="text-muted-foreground text-center py-8">No suggestions</p>}
      </div>
    </div>
  );
};

export default AdminSuggestions;
