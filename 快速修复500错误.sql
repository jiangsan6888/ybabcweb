-- 快速修复 500/502 错误
-- 请按顺序执行以下 SQL

-- 1. 为 notices 表添加/修复 created_at 列
ALTER TABLE public.notices 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone 
DEFAULT timezone('utc'::text, now());

UPDATE public.notices 
SET created_at = timezone('utc'::text, now()) 
WHERE created_at IS NULL;

-- 2. 为 advertisements 表添加/修复 created_at 列
ALTER TABLE public.advertisements 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone 
DEFAULT timezone('utc'::text, now());

UPDATE public.advertisements 
SET created_at = timezone('utc'::text, now()) 
WHERE created_at IS NULL;

-- 3. 创建索引（提高性能）
CREATE INDEX IF NOT EXISTS idx_notices_created_at 
ON public.notices(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_advertisements_created_at 
ON public.advertisements(created_at DESC);

-- 4. 刷新缓存
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 完成！现在刷新网页测试

