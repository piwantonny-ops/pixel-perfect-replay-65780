CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own assigned role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid()=user_id);
INSERT INTO public.user_roles(user_id,role) SELECT id,'admin' FROM auth.users WHERE lower(email)='piwantonny@gmail.com';
CREATE FUNCTION public.touch_user_role() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER touch_user_role BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.touch_user_role();