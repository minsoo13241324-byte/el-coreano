-- ============================================================
-- Migration v2: view_count, image_urls, is_pinned
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. 조회수
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

-- 2. 이미지 URL 배열
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}' NOT NULL;

-- 3. 공지 핀
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false NOT NULL;

-- 4. 조회수 증가 함수 (RLS 우회, 비로그인 사용자도 호출 가능)
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1
  WHERE id = post_id AND is_deleted = false;
END;
$$;

-- 5. 이미지 스토리지 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. 스토리지 정책
DROP POLICY IF EXISTS "post_images_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "post_images_auth_insert"   ON storage.objects;
DROP POLICY IF EXISTS "post_images_auth_delete"   ON storage.objects;

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "post_images_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-images' AND auth.uid() IS NOT NULL);
