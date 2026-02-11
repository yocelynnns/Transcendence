import MatchInvite from "../db/matchInvite";
import Avatar from "../db/avatar";

// Track active invites in memory for quick lookup
// senderId -> { receiverId: string, inviteId: string }
export const activeInvitesBySender = new Map<string, Map<string, string>>();

// receiverId -> Set of senderIds who sent invites
export const activeInvitesByReceiver = new Map<string, Set<string>>();

// Add an invite to tracking
export function trackInvite(senderId: string, receiverId: string, inviteId: string) {
  if (!activeInvitesBySender.has(senderId)) {
    activeInvitesBySender.set(senderId, new Map());
  }
  activeInvitesBySender.get(senderId)!.set(receiverId, inviteId);
  
  if (!activeInvitesByReceiver.has(receiverId)) {
    activeInvitesByReceiver.set(receiverId, new Set());
  }
  activeInvitesByReceiver.get(receiverId)!.add(senderId);
}

// Remove an invite from tracking
export function untrackInvite(senderId: string, receiverId: string) {
  activeInvitesBySender.get(senderId)?.delete(receiverId);
  if (activeInvitesBySender.get(senderId)?.size === 0) {
    activeInvitesBySender.delete(senderId);
  }
  
  activeInvitesByReceiver.get(receiverId)?.delete(senderId);
  if (activeInvitesByReceiver.get(receiverId)?.size === 0) {
    activeInvitesByReceiver.delete(receiverId);
  }
}

// Get all pending invites sent by a user
export function getSentInvites(senderId: string): Array<{ receiverId: string; inviteId: string }> {
  const invites: Array<{ receiverId: string; inviteId: string }> = [];
  const senderInvites = activeInvitesBySender.get(senderId);
  if (senderInvites) {
    senderInvites.forEach((inviteId, receiverId) => {
      invites.push({ receiverId, inviteId });
    });
  }
  return invites;
}

// Get all pending invites received by a user
export function getReceivedInvites(receiverId: string): Set<string> {
  return activeInvitesByReceiver.get(receiverId) || new Set();
}

// Clear all invites sent by a user (when they join a battle)
export async function clearSenderInvites(
  senderId: string, 
  io: any, 
  acceptedReceiverId?: string
): Promise<string[]> {
  const cancelledInviteIds: string[] = [];
  const senderInvites = activeInvitesBySender.get(senderId);
  
  if (!senderInvites) return cancelledInviteIds;
  
  // Get sender info for the message
  const senderAvatar = await Avatar.findById(senderId).select("userName");
  const senderName = senderAvatar?.userName || "Unknown";
  
  for (const [receiverId, inviteId] of senderInvites) {
    // Skip the accepted receiver (they're joining the battle)
    if (receiverId === acceptedReceiverId) continue;
    
    // Update invite in DB
    await MatchInvite.findByIdAndUpdate(inviteId, { status: "cancelled" });
    cancelledInviteIds.push(inviteId);
    
    // Notify the receiver
    const receiverSocketId = getReceiverSocketId(io, receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("matchInviteCancelled", {
        inviteId,
        reason: "battle_started",
        message: `${senderName} has joined another battle.`,
        senderName,
      });
    }
  }
  
  // Clear from tracking
  activeInvitesBySender.delete(senderId);
  
  // Also clean up receiver tracking
  senderInvites.forEach((_, receiverId) => {
    activeInvitesByReceiver.get(receiverId)?.delete(senderId);
    if (activeInvitesByReceiver.get(receiverId)?.size === 0) {
      activeInvitesByReceiver.delete(receiverId);
    }
  });
  
  return cancelledInviteIds;
}

// Clear all invites received by a user (when they accept one)
export async function clearReceiverInvites(
  receiverId: string,
  acceptedSenderId: string,
  io: any
): Promise<string[]> {
  const declinedInviteIds: string[] = [];
  const receiverSenders = activeInvitesByReceiver.get(receiverId);
  
  if (!receiverSenders) return declinedInviteIds;
  
  for (const senderId of receiverSenders) {
    // Skip the accepted sender
    if (senderId === acceptedSenderId) continue;
    
    const senderInvites = activeInvitesBySender.get(senderId);
    if (!senderInvites) continue;
    
    const inviteId = senderInvites.get(receiverId);
    if (!inviteId) continue;
    
    // Update invite in DB
    await MatchInvite.findByIdAndUpdate(inviteId, { status: "declined" });
    declinedInviteIds.push(inviteId);
    
    // Notify the sender
    const senderSocketId = getReceiverSocketId(io, senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("matchInviteDeclined", {
        inviteId,
        by: receiverId,
        reason: "other_accepted",
        message: "Invitation declined. Receiver has joined another battle.",
      });
    }
    
    // Clean up tracking
    untrackInvite(senderId, receiverId);
  }
  
  // Clear this receiver from tracking
  activeInvitesByReceiver.delete(receiverId);
  
  return declinedInviteIds;
}

// Helper to find socket ID by avatar ID
function getReceiverSocketId(io: any, avatarId: string): string | null {
  for (const [sid, socket] of io.sockets.sockets) {
    if (socket.data.avatarId === avatarId) {
      return sid;
    }
  }
  return null;
}

// Initialize tracking from DB on startup (optional, for recovery)
export async function initializeInviteTracking() {
  const pendingInvites = await MatchInvite.find({ status: "pending" });
  for (const invite of pendingInvites) {
    trackInvite(
      invite.senderId.toString(),
      invite.receiverId.toString(),
      invite._id.toString()
    );
  }
  console.log(`📋 Tracked ${pendingInvites.length} pending match invites`);
}