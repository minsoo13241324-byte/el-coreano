-- ============================================================
-- El Coreano – Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio        TEXT,
  is_admin   BOOLEAN DEFAULT FALSE,
  is_banned  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT DEFAULT '📚',
  post_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- POSTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  content       TEXT,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  upvotes       INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_deleted    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index (Spanish stemming)
CREATE INDEX IF NOT EXISTS posts_fts_idx
  ON posts USING GIN (to_tsvector('spanish', title || ' ' || COALESCE(content, '')));

-- ────────────────────────────────────────────────────────────
-- COMMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content    TEXT NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
  upvotes    INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- POST VOTES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_votes (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  vote_type  SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes    ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories (read-only for everyone, write only for admins)
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Posts
CREATE POLICY "posts_select_public" ON posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "posts_insert_auth"   ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "posts_update_own"    ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own_or_admin" ON posts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Comments
CREATE POLICY "comments_select_all"  ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "comments_update_own"  ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own_or_admin" ON comments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Post votes
CREATE POLICY "post_votes_select_all"  ON post_votes FOR SELECT USING (true);
CREATE POLICY "post_votes_insert_auth" ON post_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_votes_update_own"  ON post_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_votes_delete_own"  ON post_votes FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
    )
  )
  ON CONFLICT (username) DO UPDATE
    SET username = EXCLUDED.username || '_' || substr(NEW.id::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at    BEFORE UPDATE ON posts    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Sync post upvote count from votes table
CREATE OR REPLACE FUNCTION sync_post_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET upvotes = upvotes + NEW.vote_type WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE posts SET upvotes = upvotes - OLD.vote_type + NEW.vote_type WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET upvotes = upvotes - OLD.vote_type WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_vote ON post_votes;
CREATE TRIGGER on_post_vote
  AFTER INSERT OR UPDATE OR DELETE ON post_votes
  FOR EACH ROW EXECUTE PROCEDURE sync_post_upvotes();

-- Sync comment count on posts
CREATE OR REPLACE FUNCTION inc_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION dec_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_insert ON comments;
CREATE TRIGGER on_comment_insert
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE PROCEDURE inc_comment_count();

DROP TRIGGER IF EXISTS on_comment_delete ON comments;
CREATE TRIGGER on_comment_delete
  AFTER DELETE ON comments
  FOR EACH ROW EXECUTE PROCEDURE dec_comment_count();

-- Sync category post count
CREATE OR REPLACE FUNCTION sync_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_change ON posts;
CREATE TRIGGER on_post_change
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE PROCEDURE sync_category_post_count();

-- ────────────────────────────────────────────────────────────
-- SEED: Categories
-- ────────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Alfabeto Coreano',          'alfabeto-coreano',         'Aprende el alfabeto Hangul desde cero',              '🔤'),
  ('Pronunciación',             'pronunciacion',            'Mejora tu pronunciación del coreano',                '🗣️'),
  ('Vocabulario',               'vocabulario',              'Amplía tu vocabulario en coreano',                   '📖'),
  ('Oraciones',                 'oraciones',                'Aprende a construir oraciones en coreano',           '✍️'),
  ('Recursos de Aprendizaje',   'recursos-de-aprendizaje',  'Comparte y encuentra recursos útiles',               '📚'),
  ('Preguntas y Respuestas',    'preguntas-y-respuestas',   'Resuelve tus dudas con la comunidad',                '❓'),
  ('Aprende con K-POP',         'aprende-con-k-pop',        'Aprende coreano a través del K-POP',                 '🎵'),
  ('Aprende con K-Dramas',      'aprende-con-k-dramas',     'Aprende coreano a través de los K-Dramas',           '🎬'),
  ('Memes y Tendencias',        'memes-y-tendencias',       'Humor y tendencias de la cultura coreana',           '😄'),
  ('Comunidad General',         'comunidad-general',        'Discusiones generales sobre Corea y el coreano',     '🌍')
ON CONFLICT (slug) DO NOTHING;
