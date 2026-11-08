CREATE TABLE public.movies (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.vip_plans (id text PRIMARY KEY, name text NOT NULL, price integer NOT NULL, days integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.vip_products (id text PRIMARY KEY, name text NOT NULL, price integer NOT NULL DEFAULT 0, image text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.site_settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.users (id text PRIMARY KEY, name text NOT NULL, phone text NOT NULL UNIQUE, password_hash text NOT NULL, session_token text, blocked boolean NOT NULL DEFAULT false, plan_name text, expires_at bigint, watchlist jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.payments (id text PRIMARY KEY, user_id text NOT NULL, user_name text NOT NULL, phone text NOT NULL, plan_id text NOT NULL, plan_name text NOT NULL, amount integer NOT NULL, days integer NOT NULL, method text NOT NULL, status text NOT NULL DEFAULT 'Pending', created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT ON public.movies, public.vip_plans, public.vip_products TO anon, authenticated;
GRANT ALL ON public.movies, public.vip_plans, public.vip_products, public.site_settings, public.users, public.payments TO service_role;
GRANT SELECT ON public.site_settings TO anon, authenticated;

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view plans" ON public.vip_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view products" ON public.vip_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view public settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (key = 'public');

INSERT INTO public.vip_plans (id, name, price, days) VALUES ('1-day','1 Day',2000,1),('3-days','3 Days',3000,3),('1-week','1 Week',7000,7),('1-month','1 Month',15000,30);
INSERT INTO public.site_settings (key, value) VALUES ('private', '{"adminUser":"admin","adminPassword":"1234","pesapalKey":"","pesapalSecret":"","r2Endpoint":"","r2Token":"","r2AccessKey":"","r2Secret":""}');
CREATE POLICY "Customers are accessible only through verified server sessions" ON public.users FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Payments are accessible only through verified server sessions" ON public.payments FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);