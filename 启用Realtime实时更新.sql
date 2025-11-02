-- =====================================================
-- 启用 Supabase Realtime 实时更新
-- 在 Supabase SQL Editor 中执行
-- =====================================================

-- 1. 为 notices 表启用 Realtime（通知实时同步）
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;

-- 2. 为 advertisements 表启用 Realtime（广告实时同步）
ALTER PUBLICATION supabase_realtime ADD TABLE public.advertisements;

-- 3. 为 messages 表启用 Realtime（聊天消息实时同步，非常重要！）
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 完成！
-- 现在所有功能都会实时更新：
-- ✅ 通知：管理员添加/删除 → 会员端立即更新
-- ✅ 广告：管理员添加/删除 → 会员端立即更新  
-- ✅ 聊天：会员发消息 → 其他会员立即收到（0-2秒延迟）

