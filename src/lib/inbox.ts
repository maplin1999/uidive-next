import { supabase } from "@/lib/supabase";

// ============================================================
// Buddy requests / search (friendships table)
// ============================================================

export interface BuddyRequest {
  id: string;
  requester_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
    cert: string;
    diver_id: string;
  } | null;
}

export async function fetchBuddyRequests(userId: string): Promise<BuddyRequest[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select(
      "id, requester_id, created_at, profiles!friendships_requester_id_fkey(name, avatar_url, cert, diver_id)"
    )
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as BuddyRequest[];
}

export async function respondToBuddyRequest(requestId: string, accept: boolean): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw error;
}

export interface Buddy {
  id: string;
  name: string;
  avatar_url: string;
  cert: string;
}

// A friendship row could have either person as "requester" -- this picks
// whichever side isn't the current user, and de-dupes by the other
// person's id (the unique constraint on friendships only fully guards one
// pair direction).
export async function fetchBuddies(userId: string): Promise<Buddy[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select(
      "requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url, cert), addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url, cert)"
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (error) throw error;

  const seen = new Set<string>();
  const buddies: Buddy[] = [];
  for (const row of (data || []) as unknown as {
    requester_id: string;
    addressee_id: string;
    requester: Buddy | null;
    addressee: Buddy | null;
  }[]) {
    const other = row.requester_id === userId ? row.addressee : row.requester;
    if (other && !seen.has(other.id)) {
      seen.add(other.id);
      buddies.push(other);
    }
  }
  return buddies;
}

export interface DiverSearchResult {
  id: string;
  name: string;
  cert: string;
  avatar_url: string;
  diver_id: string;
}

export async function searchDivers(query: string): Promise<DiverSearchResult[]> {
  const { data, error } = await supabase.rpc("search_divers", { p_query: query });
  if (error) throw error;
  return data || [];
}

export async function sendBuddyRequest(requesterId: string, addresseeId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: requesterId, addressee_id: addresseeId });
  if (error) throw error;
}

// ============================================================
// Direct messages (messages table) -- restricted to accepted buddies
// ============================================================

export interface DirectMessage {
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  partner: Buddy;
  lastMessage: DirectMessage;
  unread: boolean;
}

// Builds "recent conversations" (one row per partner, latest message,
// whether it has anything unread) from the full raw message history and an
// already-fetched buddies list (messaging is restricted to accepted
// buddies anyway, so this avoids an extra profile lookup per conversation).
export async function fetchConversations(userId: string, buddies: Buddy[]): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, content, created_at, read_at")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const latestByPartner = new Map<string, DirectMessage>();
  const unreadPartners = new Set<string>();
  for (const m of (data || []) as DirectMessage[]) {
    const partnerId = m.sender_id === userId ? m.recipient_id : m.sender_id;
    if (!latestByPartner.has(partnerId)) latestByPartner.set(partnerId, m);
    if (m.recipient_id === userId && !m.read_at) unreadPartners.add(m.sender_id);
  }

  const buddyById = new Map(buddies.map((b) => [b.id, b]));
  const conversations: Conversation[] = [];
  for (const [partnerId, lastMessage] of latestByPartner.entries()) {
    const partner = buddyById.get(partnerId) || {
      id: partnerId,
      name: "A diver",
      avatar_url: "",
      cert: "",
    };
    conversations.push({ partner, lastMessage, unread: unreadPartners.has(partnerId) });
  }
  return conversations;
}

export async function fetchMessages(userId: string, partnerId: string): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, content, created_at, read_at")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(senderId: string, recipientId: string, content: string): Promise<void> {
  const { error } = await supabase.from("messages").insert({ sender_id: senderId, recipient_id: recipientId, content });
  if (error) throw error;
}

export async function markMessagesRead(userId: string, partnerId: string): Promise<void> {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", partnerId)
    .eq("recipient_id", userId)
    .is("read_at", null);
}

// ============================================================
// Trip group chats (trip_chat_messages) -- one per trip you have a
// confirmed booking on
// ============================================================

export interface GroupChatTrip {
  trip_id: string;
  title: string;
  location: string;
  scheduled_date: string | null;
}

export async function fetchMyGroupChats(userId: string): Promise<GroupChatTrip[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("trip_id, booked_at, dive_trips(title, location, scheduled_date)")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .order("booked_at", { ascending: false });

  if (error) throw error;

  const seen = new Set<string>();
  const trips: GroupChatTrip[] = [];
  for (const row of (data || []) as unknown as {
    trip_id: string;
    dive_trips: { title: string; location: string; scheduled_date: string | null } | null;
  }[]) {
    if (!row.trip_id || seen.has(row.trip_id)) continue;
    seen.add(row.trip_id);
    const trip = row.dive_trips;
    trips.push({
      trip_id: row.trip_id,
      title: trip?.title || "Dive trip",
      location: trip?.location || "",
      scheduled_date: trip?.scheduled_date || null,
    });
  }
  return trips;
}

export interface TripChatMessage {
  user_id: string;
  content: string;
  created_at: string;
  profiles: { name: string; avatar_url: string } | null;
}

export async function fetchTripChatMessages(tripId: string): Promise<TripChatMessage[]> {
  const { data, error } = await supabase
    .from("trip_chat_messages")
    .select("user_id, content, created_at, profiles(name, avatar_url)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as TripChatMessage[];
}

export async function sendTripChatMessage(tripId: string, userId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from("trip_chat_messages")
    .insert({ trip_id: tripId, user_id: userId, content });
  if (error) throw error;
}
