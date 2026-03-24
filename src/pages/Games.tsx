import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gamepad2 } from 'lucide-react';

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12.001-5.373 12.001-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
  </svg>
);

const EpicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44c0 .504.063.88.19 1.128.126.25.378.504.756.756.378.252 2.08 1.26 2.08 1.26l.126.063c.189.126.44.189.63.189.315 0 .504-.252.504-.504v-.063l-.063-.315c-.063-.189-.063-.441-.063-.63 0-1.51 1.197-2.52 2.835-2.52 2.016 0 3.024 1.26 3.024 2.583 0 1.26-.882 2.52-2.52 3.276l-.063.063c-.252.126-.504.252-.63.441-.126.252-.189.504-.189.756v.063c0 .504.252.756.756.756h9.788c1.371 0 1.877-.506 1.877-1.879V1.879C20.697.505 20.19 0 18.82 0H3.537zm5.859 4.41h5.544c.315 0 .504.189.504.504v.252c0 .315-.189.504-.504.504H10.59c-.315 0-.504.189-.504.504v2.394c0 .315.189.504.504.504h3.402c.315 0 .504.189.504.504v.252c0 .315-.189.504-.504.504H10.59c-.315 0-.504.189-.504.504v2.583c0 .315.189.504.504.504h4.806c.315 0 .504.189.504.504v.252c0 .315-.189.504-.504.504H9.396c-.315 0-.504-.189-.504-.504V4.914c0-.315.189-.504.504-.504z"/>
  </svg>
);

const Games = () => {
  const { data: games, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data } = await supabase.from('games').select('*').eq('is_public', true).order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="min-h-screen pt-24 px-4 max-w-6xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-center mb-12 horror-glow" style={{ fontFamily: 'Creepster, cursive' }}>
        <Gamepad2 className="inline w-10 h-10 mr-2" /> Our Games
      </h1>

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : games && games.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, i) => (
            <div key={game.id} className="bg-card rounded-lg overflow-hidden horror-border hover-horror transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              {game.image_url ? (
                <img src={game.image_url} alt={game.title} className="w-full h-52 object-cover" />
              ) : (
                <div className="w-full h-52 bg-muted flex items-center justify-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-bold text-foreground mb-2">{game.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{game.description}</p>

                {game.video_url && (
                  <div className="mb-4 aspect-video">
                    <iframe src={game.video_url} className="w-full h-full rounded" allowFullScreen />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    {game.is_free ? (
                      <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">FREE</span>
                    ) : (
                      <span className="text-sm bg-accent/20 text-accent-foreground px-3 py-1 rounded-full font-medium">€{game.price}</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {game.steam_link && (
                      <a href={game.steam_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="View on Steam">
                        <SteamIcon />
                      </a>
                    )}
                    {game.epic_link && (
                      <a href={game.epic_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="View on Epic Games">
                        <EpicIcon />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-20">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No games published yet. Stay tuned!</p>
        </div>
      )}
    </div>
  );
};

export default Games;
