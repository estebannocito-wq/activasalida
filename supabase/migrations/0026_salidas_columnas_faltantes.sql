-- 0026_salidas_columnas_faltantes.sql
-- Fix bloqueante: el form de crear actividad (7 pasos) escribe columnas en
-- public.salidas que no existen en la base real (la DB divergió de las
-- migraciones; QA vio "Could not find the 'transporte' column of 'salidas'").
-- Agregamos TODAS las columnas que el INSERT escribe, de forma idempotente.
-- transporte se manda como STRING única (single-select), por eso es text (no text[]).

alter table public.salidas
  add column if not exists transporte             text;        -- "¿Cómo llegan?" (single-select)
alter table public.salidas
  add column if not exists categoria              text;        -- tipo de actividad
alter table public.salidas
  add column if not exists tipo_otro              text;        -- detalle cuando categoría = "otro"
alter table public.salidas
  add column if not exists que_llevar             text;        -- qué llevar
alter table public.salidas
  add column if not exists costos                 jsonb not null default '{}'::jsonb; -- costos compartidos
alter table public.salidas
  add column if not exists participantes_minimos  integer;     -- mínimo para salir (cuórum)
alter table public.salidas
  add column if not exists es_privada             boolean not null default false;    -- salida privada (toggle)
alter table public.salidas
  add column if not exists cierre_inscripcion     timestamptz; -- hasta cuándo sumarse
alter table public.salidas
  add column if not exists edad_min               integer;     -- rango de edad (mín)
alter table public.salidas
  add column if not exists edad_max               integer;     -- rango de edad (máx)
alter table public.salidas
  add column if not exists imagen_portada         text;        -- URL foto de portada
