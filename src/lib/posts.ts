import { supabase } from "@/lib/supabase";

export interface PostAuthor {
  name: string;
  avatar_url: string;
  cert: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { name: string } | null;
}

export interface CommunityPost {
  id: string;
  caption: string;
  image_url: string;
  location_name: string;
  trip_id: string | null;
  likes: number;
  created_at: string;
  user_id: string;
  corals_awarded: boolean;
  profiles: PostAuthor | null;
}

// Mirrors the old site's renderRealPosts(): comments are fetched as a
// separate query and merged in client-side, deliberately kept independent
// from the posts query. If post_comments isn't reachable for any reason,
// posts still render -- just without comment counts/threads -- instead of
// the whole feed silently failing. Posts (and their comments) from anyone
// the signed-in user has blocked are filtered out client-side, same as the
// old site -- if user_blocks isn't reachable for some reason, the feed
// just falls back to showing everyone rather than going blank.
export async function fetchCommunityPosts(viewerId?: string): Promise<{
  posts: CommunityPost[];
  commentsByPost: Map<string, PostComment[]>;
}> {
  const { data: rawPosts, error } = await supabase
    .from("posts")
    .select(
      "id, caption, image_url, location_name, trip_id, likes, created_at, user_id, corals_awarded, profiles!posts_user_id_fkey(name, avatar_url, cert)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  let posts = (rawPosts || []) as unknown as CommunityPost[];

  if (viewerId) {
    const { data: blocks, error: blocksError } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", viewerId);
    if (blocksError) {
      console.warn("Could not load your blocked users:", blocksError);
    } else if (blocks && blocks.length > 0) {
      const blockedIds = new Set(blocks.map((b) => b.blocked_id));
      posts = posts.filter((p) => !blockedIds.has(p.user_id));
    }
  }

  const commentsByPost = new Map<string, PostComment[]>();
  const postIds = posts.map((p) => p.id);

  if (postIds.length > 0) {
    const { data: comments, error: commentsError } = await supabase
      .from("post_comments")
      .select("id, post_id, content, created_at, user_id, profiles(name)")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    if (!commentsError) {
      (comments || []).forEach((c) => {
        const list = commentsByPost.get(c.post_id) || [];
        list.push(c as unknown as PostComment);
        commentsByPost.set(c.post_id, list);
      });
    } else {
      console.warn("Could not load comments:", commentsError);
    }
  }

  return { posts, commentsByPost };
}

// Which of the given posts the signed-in user has already liked, so the
// heart icon renders filled/red on load instead of only after a click.
export async function fetchMyLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);
  if (error) {
    console.warn("Could not load your likes:", error);
    return new Set();
  }
  return new Set((data || []).map((r) => r.post_id));
}

export async function toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
  const { data, error } = await supabase.rpc("toggle_post_like", { p_post_id: postId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { liked: row.liked, likesCount: row.likes_count };
}

export async function submitComment(postId: string, userId: string, content: string): Promise<PostComment> {
  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select("id, post_id, content, created_at, user_id, profiles(name)")
    .single();
  if (error) throw error;
  return data as unknown as PostComment;
}

// Uploads a post image to the public "posts" Storage bucket under the
// user's own folder (same pattern as avatars), returning its public URL.
export async function uploadPostImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("posts").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("posts").getPublicUrl(path);
  return data.publicUrl;
}

export interface CreatePostFields {
  caption: string;
  imageUrl: string;
  locationName: string;
  tripId: string | null;
}

export async function createPost(
  fields: CreatePostFields
): Promise<{ postId: string; coralsAwarded: boolean; newBalance: number | null }> {
  const { data, error } = await supabase.rpc("create_post", {
    p_caption: fields.caption,
    p_image_url: fields.imageUrl,
    p_location_name: fields.locationName,
    p_trip_id: fields.tripId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { postId: row.post_id, coralsAwarded: row.corals_awarded, newBalance: row.new_balance };
}

export async function updatePost(postId: string, fields: CreatePostFields): Promise<void> {
  const { error } = await supabase.rpc("update_post", {
    p_post_id: postId,
    p_caption: fields.caption,
    p_image_url: fields.imageUrl,
    p_location_name: fields.locationName,
    p_trip_id: fields.tripId,
  });
  if (error) throw error;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}
