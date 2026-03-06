-- Update the handle_new_user function to make the first user a superadmin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  -- Check if there are any superadmins; if not, make this user superadmin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'superadmin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'superadmin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  END IF;

  RETURN NEW;
END;
$$;