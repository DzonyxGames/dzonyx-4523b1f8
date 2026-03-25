import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Trash2, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Suggestions = () => {
  const { user, profile, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const { data: rawSuggestions, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (suggestionsError) throw suggestionsError;

      const userIds = [...new Set((rawSuggestions || []).map((s) => s.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, muted')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesById = new Map((profiles || []).map((p) => [p.id, p]));
      return (rawSuggestions || []).map((s) => ({
        ...s,
        profiles: profilesById.get(s.user_id) || null,
      }));
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      if (profile?.muted) throw new Error('You are muted and cannot post');
      const { error } = await supabase.from('suggestions').insert({
        user_id: user.id,
        text: text.trim(),
        is_public: isPublic,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion posted!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-center mb-12 horror-glow" style={{ fontFamily: 'Creepster, cursive' }}>
        <MessageSquare className="inline w-10 h-10 mr-2" /> Suggestions
      </h1>

      {/* Post form */}
      {user && !profile?.muted && (
        <div className="bg-card rounded-lg p-6 horror-border mb-8">
          <Textarea
            placeholder="Share your idea, feedback, or complaint..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-muted border-border mb-3 min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
              className="horror-border gap-2"
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isPublic ? 'Public' : 'Private'}
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!text.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? 'Posting...' : 'Post Suggestion'}
            </Button>
          </div>
        </div>
      )}

      {user && profile?.muted && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-8 text-center">
          <p className="text-destructive text-sm">You are muted and cannot post suggestions.</p>
        </div>
      )}

      {!user && (
        <div className="bg-card rounded-lg p-6 horror-border mb-8 text-center">
          <p className="text-muted-foreground">Login to post a suggestion</p>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : suggestions && suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((s: any) => (
            <div key={s.id} className="bg-card rounded-lg p-5 horror-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">{s.profiles?.username || 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(s.created_at), 'MMM dd, yyyy')}</span>
                    {!s.is_public && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">{s.text}</p>
                </div>
                {(user?.id === s.user_id || isAdmin) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(s.id)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No suggestions yet. Be the first!</p>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
