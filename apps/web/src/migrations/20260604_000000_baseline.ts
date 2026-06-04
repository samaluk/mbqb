import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const baselineSql = `
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE public._locales AS ENUM (
    'es',
    'en'
);
CREATE TYPE public.enum__canchas_v_published_locale AS ENUM (
    'es',
    'en'
);
CREATE TYPE public.enum__canchas_v_version_access_type AS ENUM (
    'pay-and-play',
    'private',
    'restricted',
    'unknown'
);
CREATE TYPE public.enum__canchas_v_version_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum__home_page_v_published_locale AS ENUM (
    'es',
    'en'
);
CREATE TYPE public.enum__home_page_v_version_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum__la_biblia_articles_v_published_locale AS ENUM (
    'es',
    'en'
);
CREATE TYPE public.enum__la_biblia_articles_v_version_category AS ENUM (
    'primeros-pasos',
    'reglas-y-etiqueta',
    'equipo',
    'canchas',
    'tecnica-basica',
    'diccionario-golfistico',
    'cultura-golf'
);
CREATE TYPE public.enum__la_biblia_articles_v_version_difficulty AS ENUM (
    'principiante',
    'intermedio',
    'avanzado'
);
CREATE TYPE public.enum__la_biblia_articles_v_version_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum__products_v_published_locale AS ENUM (
    'es',
    'en'
);
CREATE TYPE public.enum__products_v_version_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum__products_v_version_stock_status AS ENUM (
    'available',
    'unavailable'
);
CREATE TYPE public.enum_canchas_access_type AS ENUM (
    'pay-and-play',
    'private',
    'restricted',
    'unknown'
);
CREATE TYPE public.enum_canchas_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum_home_page_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum_la_biblia_articles_category AS ENUM (
    'primeros-pasos',
    'reglas-y-etiqueta',
    'equipo',
    'canchas',
    'tecnica-basica',
    'diccionario-golfistico',
    'cultura-golf'
);
CREATE TYPE public.enum_la_biblia_articles_difficulty AS ENUM (
    'principiante',
    'intermedio',
    'avanzado'
);
CREATE TYPE public.enum_la_biblia_articles_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum_products_status AS ENUM (
    'draft',
    'published'
);
CREATE TYPE public.enum_products_stock_status AS ENUM (
    'available',
    'unavailable'
);
CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'editor',
    'validation-manager'
);
CREATE TABLE public._active_memberships_v (
    id integer NOT NULL,
    parent_id integer,
    version_rut character varying NOT NULL,
    version_normalized_rut character varying NOT NULL,
    version_rut_lookup_hash character varying NOT NULL,
    version_is_active boolean DEFAULT true NOT NULL,
    version_notes character varying,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public._active_memberships_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._active_memberships_v_id_seq OWNED BY public._active_memberships_v.id;
CREATE TABLE public._canchas_v (
    id integer NOT NULL,
    parent_id integer,
    version_slug character varying,
    version_access_type public.enum__canchas_v_version_access_type DEFAULT 'unknown'::public.enum__canchas_v_version_access_type,
    version_region character varying,
    version_city character varying,
    version_holes numeric,
    version_public_booking_url character varying,
    version_location public.geometry(Point),
    version_source_url character varying,
    version_source_updated_at timestamp(3) with time zone,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__canchas_v_version_status DEFAULT 'draft'::public.enum__canchas_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__canchas_v_published_locale,
    latest boolean,
    autosave boolean
);
CREATE SEQUENCE public._canchas_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._canchas_v_id_seq OWNED BY public._canchas_v.id;
CREATE TABLE public._canchas_v_locales (
    version_title character varying,
    version_summary character varying,
    version_body_html character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL,
    version_body jsonb
);
CREATE SEQUENCE public._canchas_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._canchas_v_locales_id_seq OWNED BY public._canchas_v_locales.id;
CREATE TABLE public._home_page_v (
    id integer NOT NULL,
    version_hero_video_id integer,
    version_hero_video_alt character varying DEFAULT 'Video destacado de Mas Bogeys Que Birdies'::character varying,
    version__status public.enum__home_page_v_version_status DEFAULT 'draft'::public.enum__home_page_v_version_status,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__home_page_v_published_locale,
    latest boolean,
    autosave boolean
);
CREATE SEQUENCE public._home_page_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._home_page_v_id_seq OWNED BY public._home_page_v.id;
CREATE TABLE public._la_biblia_articles_v (
    id integer NOT NULL,
    parent_id integer,
    version_slug character varying,
    version_category public.enum__la_biblia_articles_v_version_category DEFAULT 'equipo'::public.enum__la_biblia_articles_v_version_category,
    version_difficulty public.enum__la_biblia_articles_v_version_difficulty DEFAULT 'principiante'::public.enum__la_biblia_articles_v_version_difficulty,
    version_reviewed_at timestamp(3) with time zone,
    version_source_url character varying,
    version_source_updated_at timestamp(3) with time zone,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__la_biblia_articles_v_version_status DEFAULT 'draft'::public.enum__la_biblia_articles_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__la_biblia_articles_v_published_locale,
    latest boolean,
    autosave boolean
);
CREATE SEQUENCE public._la_biblia_articles_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._la_biblia_articles_v_id_seq OWNED BY public._la_biblia_articles_v.id;
CREATE TABLE public._la_biblia_articles_v_locales (
    version_title character varying,
    version_body_html character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL,
    version_body jsonb
);
CREATE SEQUENCE public._la_biblia_articles_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._la_biblia_articles_v_locales_id_seq OWNED BY public._la_biblia_articles_v_locales.id;
CREATE TABLE public._products_v (
    id integer NOT NULL,
    parent_id integer,
    version_slug character varying,
    version_price_c_l_p numeric,
    version_stock_status public.enum__products_v_version_stock_status DEFAULT 'available'::public.enum__products_v_version_stock_status,
    version_image_url character varying,
    version_source_url character varying,
    version_source_updated_at timestamp(3) with time zone,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__products_v_version_status DEFAULT 'draft'::public.enum__products_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__products_v_published_locale,
    latest boolean,
    autosave boolean
);
CREATE SEQUENCE public._products_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._products_v_id_seq OWNED BY public._products_v.id;
CREATE TABLE public._products_v_locales (
    version_title character varying,
    version_body_html character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL,
    version_body jsonb
);
CREATE SEQUENCE public._products_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public._products_v_locales_id_seq OWNED BY public._products_v_locales.id;
CREATE TABLE public.active_memberships (
    id integer NOT NULL,
    rut character varying NOT NULL,
    normalized_rut character varying NOT NULL,
    rut_lookup_hash character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.active_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.active_memberships_id_seq OWNED BY public.active_memberships.id;
CREATE TABLE public.canchas (
    id integer NOT NULL,
    slug character varying NOT NULL,
    region character varying,
    city character varying,
    access_type public.enum_canchas_access_type DEFAULT 'unknown'::public.enum_canchas_access_type NOT NULL,
    holes numeric,
    public_booking_url character varying,
    source_url character varying NOT NULL,
    source_updated_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    location public.geometry(Point),
    _status public.enum_canchas_status DEFAULT 'draft'::public.enum_canchas_status
);
CREATE SEQUENCE public.canchas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.canchas_id_seq OWNED BY public.canchas.id;
CREATE TABLE public.canchas_locales (
    title character varying NOT NULL,
    summary character varying NOT NULL,
    body_html character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL,
    body jsonb
);
CREATE SEQUENCE public.canchas_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.canchas_locales_id_seq OWNED BY public.canchas_locales.id;
CREATE TABLE public.home_page (
    id integer NOT NULL,
    hero_video_id integer,
    hero_video_alt character varying DEFAULT 'Video destacado de Mas Bogeys Que Birdies'::character varying NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now(),
    created_at timestamp(3) with time zone DEFAULT now(),
    _status public.enum_home_page_status DEFAULT 'draft'::public.enum_home_page_status
);
CREATE SEQUENCE public.home_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.home_page_id_seq OWNED BY public.home_page.id;
CREATE TABLE public.la_biblia_articles (
    id integer NOT NULL,
    slug character varying NOT NULL,
    category public.enum_la_biblia_articles_category DEFAULT 'equipo'::public.enum_la_biblia_articles_category NOT NULL,
    difficulty public.enum_la_biblia_articles_difficulty DEFAULT 'principiante'::public.enum_la_biblia_articles_difficulty NOT NULL,
    reviewed_at timestamp(3) with time zone,
    source_url character varying NOT NULL,
    source_updated_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_la_biblia_articles_status DEFAULT 'draft'::public.enum_la_biblia_articles_status
);
CREATE SEQUENCE public.la_biblia_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.la_biblia_articles_id_seq OWNED BY public.la_biblia_articles.id;
CREATE TABLE public.la_biblia_articles_locales (
    title character varying NOT NULL,
    body_html character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL,
    body jsonb
);
CREATE SEQUENCE public.la_biblia_articles_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.la_biblia_articles_locales_id_seq OWNED BY public.la_biblia_articles_locales.id;
CREATE TABLE public.media (
    id integer NOT NULL,
    alt character varying NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now(),
    created_at timestamp(3) with time zone DEFAULT now(),
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric
);
CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;
CREATE TABLE public.payload_kv (
    id integer NOT NULL,
    key character varying NOT NULL,
    data jsonb NOT NULL
);
CREATE SEQUENCE public.payload_kv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.payload_kv_id_seq OWNED BY public.payload_kv.id;
CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;
CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer,
    media_id integer,
    active_memberships_id integer,
    canchas_id integer,
    la_biblia_articles_id integer,
    products_id integer
);
CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;
CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying NOT NULL,
    batch numeric NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;
CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;
CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer
);
CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;
CREATE TABLE public.products (
    id integer NOT NULL,
    slug character varying NOT NULL,
    price_c_l_p numeric NOT NULL,
    stock_status public.enum_products_stock_status DEFAULT 'available'::public.enum_products_stock_status NOT NULL,
    image_url character varying,
    source_url character varying NOT NULL,
    source_updated_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_products_status DEFAULT 'draft'::public.enum_products_status
);
CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
CREATE TABLE public.products_locales (
    title character varying NOT NULL,
    body_html character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL,
    body jsonb
);
CREATE SEQUENCE public.products_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.products_locales_id_seq OWNED BY public.products_locales.id;
CREATE TABLE public.site_settings (
    id integer NOT NULL,
    brand_name character varying DEFAULT 'Mas Bogeys Que Birdies'::character varying NOT NULL,
    instagram_url character varying,
    whatsapp_url character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);
CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;
CREATE TABLE public.users (
    id integer NOT NULL,
    role public.enum_users_role DEFAULT 'admin'::public.enum_users_role NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
CREATE TABLE public.users_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);
ALTER TABLE ONLY public._active_memberships_v ALTER COLUMN id SET DEFAULT nextval('public._active_memberships_v_id_seq'::regclass);
ALTER TABLE ONLY public._canchas_v ALTER COLUMN id SET DEFAULT nextval('public._canchas_v_id_seq'::regclass);
ALTER TABLE ONLY public._canchas_v_locales ALTER COLUMN id SET DEFAULT nextval('public._canchas_v_locales_id_seq'::regclass);
ALTER TABLE ONLY public._home_page_v ALTER COLUMN id SET DEFAULT nextval('public._home_page_v_id_seq'::regclass);
ALTER TABLE ONLY public._la_biblia_articles_v ALTER COLUMN id SET DEFAULT nextval('public._la_biblia_articles_v_id_seq'::regclass);
ALTER TABLE ONLY public._la_biblia_articles_v_locales ALTER COLUMN id SET DEFAULT nextval('public._la_biblia_articles_v_locales_id_seq'::regclass);
ALTER TABLE ONLY public._products_v ALTER COLUMN id SET DEFAULT nextval('public._products_v_id_seq'::regclass);
ALTER TABLE ONLY public._products_v_locales ALTER COLUMN id SET DEFAULT nextval('public._products_v_locales_id_seq'::regclass);
ALTER TABLE ONLY public.active_memberships ALTER COLUMN id SET DEFAULT nextval('public.active_memberships_id_seq'::regclass);
ALTER TABLE ONLY public.canchas ALTER COLUMN id SET DEFAULT nextval('public.canchas_id_seq'::regclass);
ALTER TABLE ONLY public.canchas_locales ALTER COLUMN id SET DEFAULT nextval('public.canchas_locales_id_seq'::regclass);
ALTER TABLE ONLY public.home_page ALTER COLUMN id SET DEFAULT nextval('public.home_page_id_seq'::regclass);
ALTER TABLE ONLY public.la_biblia_articles ALTER COLUMN id SET DEFAULT nextval('public.la_biblia_articles_id_seq'::regclass);
ALTER TABLE ONLY public.la_biblia_articles_locales ALTER COLUMN id SET DEFAULT nextval('public.la_biblia_articles_locales_id_seq'::regclass);
ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);
ALTER TABLE ONLY public.payload_kv ALTER COLUMN id SET DEFAULT nextval('public.payload_kv_id_seq'::regclass);
ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);
ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);
ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);
ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);
ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);
ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
ALTER TABLE ONLY public.products_locales ALTER COLUMN id SET DEFAULT nextval('public.products_locales_id_seq'::regclass);
ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public._active_memberships_v
    ADD CONSTRAINT _active_memberships_v_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._canchas_v_locales
    ADD CONSTRAINT _canchas_v_locales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._canchas_v
    ADD CONSTRAINT _canchas_v_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._home_page_v
    ADD CONSTRAINT _home_page_v_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._la_biblia_articles_v_locales
    ADD CONSTRAINT _la_biblia_articles_v_locales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._la_biblia_articles_v
    ADD CONSTRAINT _la_biblia_articles_v_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._products_v_locales
    ADD CONSTRAINT _products_v_locales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public._products_v
    ADD CONSTRAINT _products_v_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.active_memberships
    ADD CONSTRAINT active_memberships_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.canchas_locales
    ADD CONSTRAINT canchas_locales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.canchas
    ADD CONSTRAINT canchas_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.home_page
    ADD CONSTRAINT home_page_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.la_biblia_articles_locales
    ADD CONSTRAINT la_biblia_articles_locales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.la_biblia_articles
    ADD CONSTRAINT la_biblia_articles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payload_kv
    ADD CONSTRAINT payload_kv_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.products_locales
    ADD CONSTRAINT products_locales_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_pkey PRIMARY KEY (id);
CREATE INDEX _active_memberships_v_created_at_idx ON public._active_memberships_v USING btree (created_at);
CREATE INDEX _active_memberships_v_parent_idx ON public._active_memberships_v USING btree (parent_id);
CREATE INDEX _active_memberships_v_updated_at_idx ON public._active_memberships_v USING btree (updated_at);
CREATE INDEX _active_memberships_v_version_version_created_at_idx ON public._active_memberships_v USING btree (version_created_at);
CREATE INDEX _active_memberships_v_version_version_normalized_rut_idx ON public._active_memberships_v USING btree (version_normalized_rut);
CREATE INDEX _active_memberships_v_version_version_rut_lookup_hash_idx ON public._active_memberships_v USING btree (version_rut_lookup_hash);
CREATE INDEX _active_memberships_v_version_version_updated_at_idx ON public._active_memberships_v USING btree (version_updated_at);
CREATE INDEX _canchas_v_autosave_idx ON public._canchas_v USING btree (autosave);
CREATE INDEX _canchas_v_created_at_idx ON public._canchas_v USING btree (created_at);
CREATE INDEX _canchas_v_latest_idx ON public._canchas_v USING btree (latest);
CREATE UNIQUE INDEX _canchas_v_locales_locale_parent_id_unique ON public._canchas_v_locales USING btree (_locale, _parent_id);
CREATE INDEX _canchas_v_parent_idx ON public._canchas_v USING btree (parent_id);
CREATE INDEX _canchas_v_published_locale_idx ON public._canchas_v USING btree (published_locale);
CREATE INDEX _canchas_v_snapshot_idx ON public._canchas_v USING btree (snapshot);
CREATE INDEX _canchas_v_updated_at_idx ON public._canchas_v USING btree (updated_at);
CREATE INDEX _canchas_v_version_version__status_idx ON public._canchas_v USING btree (version__status);
CREATE INDEX _canchas_v_version_version_created_at_idx ON public._canchas_v USING btree (version_created_at);
CREATE INDEX _canchas_v_version_version_slug_idx ON public._canchas_v USING btree (version_slug);
CREATE INDEX _canchas_v_version_version_updated_at_idx ON public._canchas_v USING btree (version_updated_at);
CREATE INDEX _home_page_v_autosave_idx ON public._home_page_v USING btree (autosave);
CREATE INDEX _home_page_v_created_at_idx ON public._home_page_v USING btree (created_at);
CREATE INDEX _home_page_v_latest_idx ON public._home_page_v USING btree (latest);
CREATE INDEX _home_page_v_published_locale_idx ON public._home_page_v USING btree (published_locale);
CREATE INDEX _home_page_v_snapshot_idx ON public._home_page_v USING btree (snapshot);
CREATE INDEX _home_page_v_updated_at_idx ON public._home_page_v USING btree (updated_at);
CREATE INDEX _home_page_v_version_version__status_idx ON public._home_page_v USING btree (version__status);
CREATE INDEX _home_page_v_version_version_hero_video_idx ON public._home_page_v USING btree (version_hero_video_id);
CREATE INDEX _la_biblia_articles_v_autosave_idx ON public._la_biblia_articles_v USING btree (autosave);
CREATE INDEX _la_biblia_articles_v_created_at_idx ON public._la_biblia_articles_v USING btree (created_at);
CREATE INDEX _la_biblia_articles_v_latest_idx ON public._la_biblia_articles_v USING btree (latest);
CREATE UNIQUE INDEX _la_biblia_articles_v_locales_locale_parent_id_unique ON public._la_biblia_articles_v_locales USING btree (_locale, _parent_id);
CREATE INDEX _la_biblia_articles_v_parent_idx ON public._la_biblia_articles_v USING btree (parent_id);
CREATE INDEX _la_biblia_articles_v_published_locale_idx ON public._la_biblia_articles_v USING btree (published_locale);
CREATE INDEX _la_biblia_articles_v_snapshot_idx ON public._la_biblia_articles_v USING btree (snapshot);
CREATE INDEX _la_biblia_articles_v_updated_at_idx ON public._la_biblia_articles_v USING btree (updated_at);
CREATE INDEX _la_biblia_articles_v_version_version__status_idx ON public._la_biblia_articles_v USING btree (version__status);
CREATE INDEX _la_biblia_articles_v_version_version_created_at_idx ON public._la_biblia_articles_v USING btree (version_created_at);
CREATE INDEX _la_biblia_articles_v_version_version_slug_idx ON public._la_biblia_articles_v USING btree (version_slug);
CREATE INDEX _la_biblia_articles_v_version_version_updated_at_idx ON public._la_biblia_articles_v USING btree (version_updated_at);
CREATE INDEX _products_v_autosave_idx ON public._products_v USING btree (autosave);
CREATE INDEX _products_v_created_at_idx ON public._products_v USING btree (created_at);
CREATE INDEX _products_v_latest_idx ON public._products_v USING btree (latest);
CREATE UNIQUE INDEX _products_v_locales_locale_parent_id_unique ON public._products_v_locales USING btree (_locale, _parent_id);
CREATE INDEX _products_v_parent_idx ON public._products_v USING btree (parent_id);
CREATE INDEX _products_v_published_locale_idx ON public._products_v USING btree (published_locale);
CREATE INDEX _products_v_snapshot_idx ON public._products_v USING btree (snapshot);
CREATE INDEX _products_v_updated_at_idx ON public._products_v USING btree (updated_at);
CREATE INDEX _products_v_version_version__status_idx ON public._products_v USING btree (version__status);
CREATE INDEX _products_v_version_version_created_at_idx ON public._products_v USING btree (version_created_at);
CREATE INDEX _products_v_version_version_slug_idx ON public._products_v USING btree (version_slug);
CREATE INDEX _products_v_version_version_updated_at_idx ON public._products_v USING btree (version_updated_at);
CREATE INDEX active_memberships_created_at_idx ON public.active_memberships USING btree (created_at);
CREATE UNIQUE INDEX active_memberships_normalized_rut_idx ON public.active_memberships USING btree (normalized_rut);
CREATE UNIQUE INDEX active_memberships_rut_lookup_hash_idx ON public.active_memberships USING btree (rut_lookup_hash);
CREATE INDEX active_memberships_updated_at_idx ON public.active_memberships USING btree (updated_at);
CREATE INDEX canchas__status_idx ON public.canchas USING btree (_status);
CREATE INDEX canchas_access_type_idx ON public.canchas USING btree (access_type);
CREATE INDEX canchas_city_idx ON public.canchas USING btree (city);
CREATE INDEX canchas_created_at_idx ON public.canchas USING btree (created_at);
CREATE UNIQUE INDEX canchas_locales_locale_parent_id_unique ON public.canchas_locales USING btree (_locale, _parent_id);
CREATE INDEX canchas_location_idx ON public.canchas USING gist (location);
CREATE INDEX canchas_region_idx ON public.canchas USING btree (region);
CREATE UNIQUE INDEX canchas_slug_idx ON public.canchas USING btree (slug);
CREATE INDEX canchas_updated_at_idx ON public.canchas USING btree (updated_at);
CREATE INDEX home_page__status_idx ON public.home_page USING btree (_status);
CREATE INDEX la_biblia_articles__status_idx ON public.la_biblia_articles USING btree (_status);
CREATE INDEX la_biblia_articles_category_idx ON public.la_biblia_articles USING btree (category);
CREATE INDEX la_biblia_articles_created_at_idx ON public.la_biblia_articles USING btree (created_at);
CREATE INDEX la_biblia_articles_difficulty_idx ON public.la_biblia_articles USING btree (difficulty);
CREATE UNIQUE INDEX la_biblia_articles_locales_locale_parent_id_unique ON public.la_biblia_articles_locales USING btree (_locale, _parent_id);
CREATE UNIQUE INDEX la_biblia_articles_slug_idx ON public.la_biblia_articles USING btree (slug);
CREATE INDEX la_biblia_articles_updated_at_idx ON public.la_biblia_articles USING btree (updated_at);
CREATE UNIQUE INDEX payload_kv_key_idx ON public.payload_kv USING btree (key);
CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);
CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);
CREATE INDEX payload_locked_documents_rels_active_memberships_id_idx ON public.payload_locked_documents_rels USING btree (active_memberships_id);
CREATE INDEX payload_locked_documents_rels_canchas_id_idx ON public.payload_locked_documents_rels USING btree (canchas_id);
CREATE INDEX payload_locked_documents_rels_la_biblia_articles_id_idx ON public.payload_locked_documents_rels USING btree (la_biblia_articles_id);
CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);
CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");
CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);
CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);
CREATE INDEX payload_locked_documents_rels_products_id_idx ON public.payload_locked_documents_rels USING btree (products_id);
CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);
CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);
CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);
CREATE UNIQUE INDEX payload_migrations_name_idx ON public.payload_migrations USING btree (name);
CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);
CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);
CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);
CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");
CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);
CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);
CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);
CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);
CREATE INDEX products__status_idx ON public.products USING btree (_status);
CREATE INDEX products_created_at_idx ON public.products USING btree (created_at);
CREATE UNIQUE INDEX products_locales_locale_parent_id_unique ON public.products_locales USING btree (_locale, _parent_id);
CREATE UNIQUE INDEX products_slug_idx ON public.products USING btree (slug);
CREATE INDEX products_stock_status_idx ON public.products USING btree (stock_status);
CREATE INDEX products_updated_at_idx ON public.products USING btree (updated_at);
CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);
CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);
CREATE INDEX users_sessions_order_idx ON public.users_sessions USING btree (_order);
CREATE INDEX users_sessions_parent_id_idx ON public.users_sessions USING btree (_parent_id);
CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);
ALTER TABLE ONLY public._active_memberships_v
    ADD CONSTRAINT _active_memberships_v_parent_id_active_memberships_id_fk FOREIGN KEY (parent_id) REFERENCES public.active_memberships(id) ON DELETE SET NULL;
ALTER TABLE ONLY public._canchas_v_locales
    ADD CONSTRAINT _canchas_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._canchas_v(id) ON DELETE CASCADE;
ALTER TABLE ONLY public._canchas_v
    ADD CONSTRAINT _canchas_v_parent_id_canchas_id_fk FOREIGN KEY (parent_id) REFERENCES public.canchas(id) ON DELETE SET NULL;
ALTER TABLE ONLY public._home_page_v
    ADD CONSTRAINT _home_page_v_version_hero_video_id_media_id_fk FOREIGN KEY (version_hero_video_id) REFERENCES public.media(id) ON DELETE SET NULL;
ALTER TABLE ONLY public._la_biblia_articles_v_locales
    ADD CONSTRAINT _la_biblia_articles_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._la_biblia_articles_v(id) ON DELETE CASCADE;
ALTER TABLE ONLY public._la_biblia_articles_v
    ADD CONSTRAINT _la_biblia_articles_v_parent_id_la_biblia_articles_id_fk FOREIGN KEY (parent_id) REFERENCES public.la_biblia_articles(id) ON DELETE SET NULL;
ALTER TABLE ONLY public._products_v_locales
    ADD CONSTRAINT _products_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._products_v(id) ON DELETE CASCADE;
ALTER TABLE ONLY public._products_v
    ADD CONSTRAINT _products_v_parent_id_products_id_fk FOREIGN KEY (parent_id) REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.canchas_locales
    ADD CONSTRAINT canchas_locales__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.canchas(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.la_biblia_articles_locales
    ADD CONSTRAINT la_biblia_articles_locales__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.la_biblia_articles(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_active_memberships_fk FOREIGN KEY (active_memberships_id) REFERENCES public.active_memberships(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_canchas_fk FOREIGN KEY (canchas_id) REFERENCES public.canchas(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_la_biblia_articles_fk FOREIGN KEY (la_biblia_articles_id) REFERENCES public.la_biblia_articles(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.products_locales
    ADD CONSTRAINT products_locales__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.users(id) ON DELETE CASCADE;
`

/**
 * Squashed schema baseline (production shape as of 2026-06-04, including Lexical body fields).
 * - Fresh DB: run via `payload migrate:fresh` (drops public schema, then applies this).
 * - Existing prod/local: do not re-run `up`; reset `payload_migrations` only (see scripts/reset-payload-migrations-to-baseline.sql).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = baselineSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await db.execute(sql.raw(`${statement};`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
    GRANT ALL ON SCHEMA public TO postgres;
    CREATE EXTENSION IF NOT EXISTS postgis;
  `)
}
