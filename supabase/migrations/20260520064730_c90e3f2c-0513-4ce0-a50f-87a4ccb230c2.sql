
-- Fix search_path on touch function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke public execute on SECURITY DEFINER funcs
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten public-form INSERT policies with minimal validation
DROP POLICY "orders public insert" ON public.orders;
CREATE POLICY "orders public insert" ON public.orders FOR INSERT
  WITH CHECK (length(customer_name) BETWEEN 1 AND 200 AND length(customer_email) BETWEEN 3 AND 320);

DROP POLICY "hiring public insert" ON public.hiring_requests;
CREATE POLICY "hiring public insert" ON public.hiring_requests FOR INSERT
  WITH CHECK (length(client_name) BETWEEN 1 AND 200 AND length(client_email) BETWEEN 3 AND 320 AND length(project_description) BETWEEN 1 AND 5000);

DROP POLICY "contact public insert" ON public.contact_messages;
CREATE POLICY "contact public insert" ON public.contact_messages FOR INSERT
  WITH CHECK (length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(message) BETWEEN 1 AND 5000);

-- Restrict listing of public-assets bucket (individual file fetches via public URL still work)
DROP POLICY "public assets read" ON storage.objects;
CREATE POLICY "public assets admin list" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'));
