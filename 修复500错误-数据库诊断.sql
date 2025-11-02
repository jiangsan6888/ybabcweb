-- =====================================================
-- 修复 500/502 错误 - 数据库诊断和修复
-- 在 Supabase SQL Editor 中执行
-- =====================================================

-- 问题诊断：
-- 错误信息显示 500/502 Internal Server Error
-- 这通常意味着数据库表结构有问题，或者索引损坏

-- ========== 第一步：检查表结构 ==========

-- 1.1 检查 notices 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notices'
ORDER BY ordinal_position;

-- 1.2 检查 advertisements 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'advertisements'
ORDER BY ordinal_position;

-- ========== 第二步：修复表结构（如果列缺失） ==========

-- 2.1 确保 notices 表有 created_at 列
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
      AND table_name='notices' 
      AND column_name='created_at'
  ) THEN
    ALTER TABLE public.notices 
    ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    
    -- 为现有行设置默认时间
    UPDATE public.notices 
    SET created_at = timezone('utc'::text, now()) 
    WHERE created_at IS NULL;
  END IF;
END $$;

-- 2.2 确保 advertisements 表有 created_at 列
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' 
      AND table_name='advertisements' 
      AND column_name='created_at'
  ) THEN
    ALTER TABLE public.advertisements 
    ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    
    -- 为现有行设置默认时间
    UPDATE public.advertisements 
    SET created_at = timezone('utc'::text, now()) 
    WHERE created_at IS NULL;
  END IF;
END $$;

-- ========== 第三步：创建索引（提高查询性能） ==========

-- 3.1 为 notices.created_at 创建索引
CREATE INDEX IF NOT EXISTS idx_notices_created_at 
ON public.notices(created_at DESC);

-- 3.2 为 advertisements.created_at 创建索引
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at 
ON public.advertisements(created_at DESC);

-- 3.3 为 messages.created_at 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON public.messages(created_at DESC);

-- ========== 第四步：检查并修复数据完整性 ==========

-- 4.1 检查 notices 表是否有 NULL 的 created_at
SELECT COUNT(*) as null_created_at_count
FROM public.notices
WHERE created_at IS NULL;

-- 4.2 修复 NULL 的 created_at（如果有）
UPDATE public.notices
SET created_at = timezone('utc'::text, now())
WHERE created_at IS NULL;

-- 4.3 检查 advertisements 表是否有 NULL 的 created_at
SELECT COUNT(*) as null_created_at_count
FROM public.advertisements
WHERE created_at IS NULL;

-- 4.4 修复 NULL 的 created_at（如果有）
UPDATE public.advertisements
SET created_at = timezone('utc'::text, now())
WHERE created_at IS NULL;

-- ========== 第五步：刷新 REST API 缓存 ==========

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- ========== 第六步：验证修复 ==========

-- 6.1 测试查询 notices（应该不报错）
SELECT * FROM public.notices ORDER BY created_at DESC LIMIT 5;

-- 6.2 测试查询 advertisements（应该不报错）
SELECT * FROM public.advertisements ORDER BY created_at DESC LIMIT 5;

-- 完成！
-- 如果以上查询都能正常返回结果，说明问题已修复
-- 现在刷新网页应该不会再有 500/502 错误了

