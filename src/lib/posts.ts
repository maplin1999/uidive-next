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
// the whole feed silently failing.
export async function fetchCommunityPosts(): Promise<{
  posts: CommunityPost[];
  commentsByPost: Map<string, PostComment[]>;
}> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, caption, image_url, location_name, trip_id, likes, created_at, user_id, corals_awarded, profiles!posts_user_id_fkey(name, avatar_url, cert)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const commentsByPost = new Map<string, PostComment[]>();
  const postIds = (posts || []).map((p) => p.id);

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

  return { posts: (posts || []) as unknown as CommunityPost[], commentsByPost };
}
