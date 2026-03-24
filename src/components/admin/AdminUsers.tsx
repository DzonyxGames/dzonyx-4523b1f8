import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*, user_roles(role)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const muteMutation = useMutation({
    mutationFn: async ({ id, muted }: { id: string; muted: boolean }) => {
      const { error } = await supabase.from('profiles').update({ muted }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Manage Users</h2>
      <div className="space-y-3">
        {users?.map((u: any) => {
          const isAdmin = u.user_roles?.some((r: any) => r.role === 'admin');
          return (
            <div key={u.id} className="bg-card p-4 rounded-lg horror-border flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{u.username}</span>
                  {isAdmin && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Admin</span>}
                  {u.muted && <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">Muted</span>}
                </div>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </div>
              {!isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => muteMutation.mutate({ id: u.id, muted: !u.muted })}
                  className="gap-1 horror-border"
                >
                  {u.muted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {u.muted ? 'Unmute' : 'Mute'}
                </Button>
              )}
            </div>
          );
        })}
        {(!users || users.length === 0) && <p className="text-muted-foreground text-center py-8">No users</p>}
      </div>
    </div>
  );
};

export default AdminUsers;
