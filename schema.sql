create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  nombre                text,
  foto_url              text,
  bio                   text,
  fecha_nacimiento      date,
  zona_texto            text,
  instagram_handle      text,
  verificado            boolean   not null default false,
  reputacion_promedio   numeric   not null default 0,
  salidas_creadas       int       not null default 0,
  salidas_asistidas     int       not null default 0,
  created_at            timestamptz not null default now()
);
create table public.salidas (
  id                          uuid primary key default gen_random_uuid(),
  host_id                     uuid not null references public.profiles(id) on delete cascade,
  titulo                      text not null,
  descripcion                 text,
  tipo                        text not null default 'rio'
                                check (tipo in ('rio')),
  punto_encuentro_texto       text,
  punto_encuentro_lat         numeric,
  punto_encuentro_lng         numeric,
  fecha_hora                  timestamptz not null,
  cupos_total                 int  not null,
  cupos_ocupados              int  not null default 0,
  transporte                  text
                                check (transporte in (
                                  'lancha_publica','lancha_privada','lancha_taxi',
                                  'kayak','a_pie','otro'
                                )),
  costos                      jsonb not null default '{}'::jsonb,
  que_llevar                  text,
  estado                      text not null default 'abierta'
                                check (estado in (
                                  'abierta','completa','cerrada','finalizada','cancelada'
                                )),
  created_at                  timestamptz not null default now()
);
create index salidas_host_id_idx     on public.salidas (host_id);
create index salidas_fecha_hora_idx  on public.salidas (fecha_hora);
create index salidas_estado_idx      on public.salidas (estado);
create table public.participaciones (
  id          uuid primary key default gen_random_uuid(),
  salida_id   uuid not null references public.salidas(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  estado      text not null default 'pendiente'
                check (estado in ('pendiente','aceptado','rechazado')),
  created_at  timestamptz not null default now(),
  unique (salida_id, user_id)
);
create index participaciones_salida_id_idx on public.participaciones (salida_id);
create index participaciones_user_id_idx   on public.participaciones (user_id);
create table public.calificaciones (
  id              uuid primary key default gen_random_uuid(),
  salida_id       uuid not null references public.salidas(id) on delete cascade,
  from_user       uuid not null references public.profiles(id) on delete cascade,
  to_user         uuid not null references public.profiles(id) on delete cascade,
  rol_calificado  text not null check (rol_calificado in ('host','invitado')),
  puntaje         int  not null check (puntaje between 1 and 5),
  comentario      text,
  created_at      timestamptz not null default now(),
  unique (salida_id, from_user, to_user)
);
create index calificaciones_salida_id_idx on public.calificaciones (salida_id);
create index calificaciones_to_user_idx   on public.calificaciones (to_user);
create table public.reportes (
  id          uuid primary key default gen_random_uuid(),
  reporter    uuid not null references public.profiles(id) on delete cascade,
  reportado   uuid not null references public.profiles(id) on delete cascade,
  salida_id   uuid     references public.salidas(id)  on delete set null,
  motivo      text not null,
  created_at  timestamptz not null default now()
);
create index reportes_reporter_idx  on public.reportes (reporter);
create index reportes_reportado_idx on public.reportes (reportado);
alter table public.profiles         enable row level security;
alter table public.salidas          enable row level security;
alter table public.participaciones  enable row level security;
alter table public.calificaciones   enable row level security;
alter table public.reportes         enable row level security;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using  (id = auth.uid())
  with check (id = auth.uid());
create policy "salidas_select_authenticated"
  on public.salidas for select
  to authenticated
  using (true);
create policy "salidas_insert_host"
  on public.salidas for insert
  to authenticated
  with check (host_id = auth.uid());
create policy "salidas_update_host"
  on public.salidas for update
  to authenticated
  using  (host_id = auth.uid())
  with check (host_id = auth.uid());
create policy "participaciones_select_self_or_host"
  on public.participaciones for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.salidas s
      where s.id = participaciones.salida_id
        and s.host_id = auth.uid()
    )
  );
create policy "participaciones_insert_self"
  on public.participaciones for insert
  to authenticated
  with check (user_id = auth.uid());
create policy "participaciones_update_host"
  on public.participaciones for update
  to authenticated
  using (
    exists (
      select 1 from public.salidas s
      where s.id = participaciones.salida_id
        and s.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salidas s
      where s.id = participaciones.salida_id
        and s.host_id = auth.uid()
    )
  );
create policy "calificaciones_select_authenticated"
  on public.calificaciones for select
  to authenticated
  using (true);
create policy "calificaciones_insert_participante"
  on public.calificaciones for insert
  to authenticated
  with check (
    from_user = auth.uid()
    and (
      exists (
        select 1 from public.salidas s
        where s.id = calificaciones.salida_id
          and s.host_id = auth.uid()
      )
      or exists (
        select 1 from public.participaciones p
        where p.salida_id = calificaciones.salida_id
          and p.user_id  = auth.uid()
          and p.estado   = 'aceptado'
      )
    )
  );
create policy "reportes_insert_self"
  on public.reportes for insert
  to authenticated
  with check (reporter = auth.uid());
create policy "reportes_select_own"
  on public.reportes for select
  to authenticated
  using (reporter = auth.uid());
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
create policy "salidas_select_anon"
  on public.salidas for select
  to anon
  using (estado <> 'cancelada');
create policy "profiles_select_anon"
  on public.profiles for select
  to anon
  using (true);
create policy "participaciones_select_aceptadas_publicas"
  on public.participaciones for select
  to anon, authenticated
  using (estado = 'aceptado');
alter table public.profiles
  add column if not exists intereses text[] not null default '{}';
alter table public.participaciones
  add column if not exists mensaje text;
alter table public.salidas
  add column if not exists categoria text;
create table public.chat_mensajes (
  id          uuid primary key default gen_random_uuid(),
  salida_id   uuid not null references public.salidas(id)  on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  texto       text not null,
  created_at  timestamptz not null default now()
);
create index chat_mensajes_salida_created_idx
  on public.chat_mensajes (salida_id, created_at);
alter table public.chat_mensajes enable row level security;
create policy "chat_select_miembros"
  on public.chat_mensajes for select
  to authenticated
  using (
    exists (
      select 1 from public.salidas s
      where s.id = chat_mensajes.salida_id
        and s.host_id = auth.uid()
    )
    or exists (
      select 1 from public.participaciones p
      where p.salida_id = chat_mensajes.salida_id
        and p.user_id  = auth.uid()
        and p.estado   = 'aceptado'
    )
  );
create policy "chat_insert_miembros"
  on public.chat_mensajes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1 from public.salidas s
        where s.id = chat_mensajes.salida_id
          and s.host_id = auth.uid()
      )
      or exists (
        select 1 from public.participaciones p
        where p.salida_id = chat_mensajes.salida_id
          and p.user_id  = auth.uid()
          and p.estado   = 'aceptado'
      )
    )
  );
create table public.aportes (
  id          uuid primary key default gen_random_uuid(),
  salida_id   uuid not null references public.salidas(id)  on delete cascade,
  nombre      text not null,
  categoria   text not null check (categoria in ('host', 'repartir', 'cada_uno')),
  asignado_a  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index aportes_salida_id_idx on public.aportes (salida_id);
alter table public.aportes enable row level security;
create policy "aportes_select_todos"
  on public.aportes for select
  to anon, authenticated
  using (true);
create policy "aportes_insert_host"
  on public.aportes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.salidas s
      where s.id = aportes.salida_id
        and s.host_id = auth.uid()
    )
  );
create policy "aportes_update_host_o_aceptado"
  on public.aportes for update
  to authenticated
  using (
    exists (
      select 1 from public.salidas s
      where s.id = aportes.salida_id
        and s.host_id = auth.uid()
    )
    or exists (
      select 1 from public.participaciones p
      where p.salida_id = aportes.salida_id
        and p.user_id  = auth.uid()
        and p.estado   = 'aceptado'
    )
  )
  with check (
    exists (
      select 1 from public.salidas s
      where s.id = aportes.salida_id
        and s.host_id = auth.uid()
    )
    or exists (
      select 1 from public.participaciones p
      where p.salida_id = aportes.salida_id
        and p.user_id  = auth.uid()
        and p.estado   = 'aceptado'
    )
  );
create policy "aportes_delete_host"
  on public.aportes for delete
  to authenticated
  using (
    exists (
      select 1 from public.salidas s
      where s.id = aportes.salida_id
        and s.host_id = auth.uid()
    )
  );
alter table public.profiles
  add column if not exists es_capitan boolean not null default false;
alter table public.calificaciones
  add column if not exists comentario text;
alter table profiles
  add column if not exists rango_host text default null,
  add column if not exists rango_tripulante text default null;
alter table profiles
  add column if not exists cancelaciones_tardias int not null default 0;
alter table salidas
  add column if not exists participantes_minimos int;
alter table salidas
  drop constraint if exists salidas_participantes_minimos_check;
alter table salidas
  add constraint salidas_participantes_minimos_check
  check (
    participantes_minimos is null
    or (participantes_minimos >= 0 and participantes_minimos <= cupos_total)
  );
alter table participaciones
  drop constraint if exists participaciones_estado_check;
alter table participaciones
  add constraint participaciones_estado_check
  check (estado in ('pendiente', 'aceptado', 'rechazado', 'cancelado'));
alter table participaciones
  add column if not exists recordatorio_24h_enviado boolean not null default false;
alter table salidas
  add column if not exists recordatorio_host_enviado boolean not null default false;
alter table profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists bloqueado boolean not null default false;
alter table reportes
  add column if not exists resuelto boolean not null default false;
alter table public.salidas
  add column if not exists es_privada boolean not null default false;
alter table public.salidas
  drop constraint if exists salidas_categoria_check;
alter table public.salidas
  add constraint salidas_categoria_check
  check (
    categoria is null
    or categoria in (
      'deporte',
      'juntada',
      'cine_teatro',
      'viaje',
      'caminata',
      'juegos',
      'after',
      'otro'
    )
  );
alter table public.salidas
  add column if not exists tipo_otro text;
alter table public.salidas
  add column if not exists cierre_inscripcion timestamptz;
alter table public.profiles
  add column if not exists fecha_nacimiento date,
  add column if not exists genero text;
alter table public.salidas
  add column if not exists edad_min int,
  add column if not exists edad_max int;
alter table public.profiles
  add column if not exists onboarding_completado boolean not null default false;
alter table public.salidas
  add column if not exists imagen_portada text;
create table if not exists public.notificaciones (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  tipo             text not null,
  salida_id        uuid references public.salidas(id) on delete cascade,
  actor_id         uuid references public.profiles(id) on delete set null,
  participacion_id uuid references public.participaciones(id) on delete cascade,
  leida            boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists notificaciones_user_created_idx
  on public.notificaciones (user_id, created_at desc);
create index if not exists notificaciones_user_leida_idx
  on public.notificaciones (user_id, leida);
alter table public.notificaciones enable row level security;
drop policy if exists notif_select_own on public.notificaciones;
create policy notif_select_own on public.notificaciones
  for select using (auth.uid() = user_id);
drop policy if exists notif_update_own on public.notificaciones;
create policy notif_update_own on public.notificaciones
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table public.profiles
  add column if not exists acepto_terminos_at timestamptz;
create table if not exists public.chat_lecturas (
  salida_id  uuid not null references public.salidas(id)  on delete cascade,
  mensaje_id uuid not null references public.chat_mensajes(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  leido_at   timestamptz not null default now(),
  primary key (salida_id, user_id)
);
create index if not exists chat_lecturas_salida_idx
  on public.chat_lecturas (salida_id);
alter table public.chat_lecturas enable row level security;
drop policy if exists chat_lecturas_select_miembros on public.chat_lecturas;
create policy chat_lecturas_select_miembros
  on public.chat_lecturas for select
  to authenticated
  using (
    exists (
      select 1 from public.salidas s
      where s.id = chat_lecturas.salida_id
        and s.host_id = auth.uid()
    )
    or exists (
      select 1 from public.participaciones p
      where p.salida_id = chat_lecturas.salida_id
        and p.user_id  = auth.uid()
        and p.estado   = 'aceptado'
    )
  );
drop policy if exists chat_lecturas_insert_propia on public.chat_lecturas;
create policy chat_lecturas_insert_propia
  on public.chat_lecturas for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1 from public.salidas s
        where s.id = chat_lecturas.salida_id
          and s.host_id = auth.uid()
      )
      or exists (
        select 1 from public.participaciones p
        where p.salida_id = chat_lecturas.salida_id
          and p.user_id  = auth.uid()
          and p.estado   = 'aceptado'
      )
    )
  );
drop policy if exists chat_lecturas_update_propia on public.chat_lecturas;
create policy chat_lecturas_update_propia
  on public.chat_lecturas for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create table if not exists public.chat_push_estado (
  salida_id      uuid not null references public.salidas(id)  on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  ultimo_push_at timestamptz not null default now(),
  primary key (salida_id, user_id)
);
alter table public.chat_push_estado enable row level security;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);
alter table public.push_subscriptions enable row level security;
create policy "push_subscriptions_select_own" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "push_subscriptions_insert_own" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_subscriptions_update_own" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_subscriptions_delete_own" on public.push_subscriptions for delete using (auth.uid() = user_id);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter publication supabase_realtime add table public.chat_mensajes;
alter publication supabase_realtime add table public.chat_lecturas;
