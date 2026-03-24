
-- Fix overly permissive INSERT on profiles - only allow trigger (security definer) or own user
DROP POLICY "System can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix overly permissive INSERT on user_roles - only allow trigger
DROP POLICY "System can insert user roles" ON public.user_roles;
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
