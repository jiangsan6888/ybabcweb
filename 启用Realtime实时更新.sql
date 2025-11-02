-- =====================================================
-- 启用 Supabase Realtime 实时更新
-- 在 Supabase SQL Editor 中执行
-- =====================================================

-- 1. 为 notices 表启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;

-- 2. 为 advertisements 表启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.advertisements;

-- 3. 为 messages 表启用 Realtime（如果还没有启用）
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 完成！
-- 现在当管理员添加/删除通知或广告时，会员端会立即收到更新

