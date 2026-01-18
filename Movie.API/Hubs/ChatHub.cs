using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;
using Movie.API.Models.Enums;
using System.Security.Claims;

namespace Movie.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        private static readonly Dictionary<int, int> Connections = new();
        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new HubException("Unauthorized: User ID not found.");
            }
            return userId;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();

            lock (Connections)
            {
                if (Connections.ContainsKey(userId))
                    Connections[userId]++;
                else
                    Connections[userId] = 1;
            }

            if (Connections[userId] == 1)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = true;
                    await _context.SaveChangesAsync();

                    await Clients.All.SendAsync(
                        "UserStatusChanged",
                        userId,
                        true,
                        null
                    );
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            bool isLastConnection = false;

            lock (Connections)
            {
                if (!Connections.ContainsKey(userId))
                    return;

                Connections[userId]--;

                if (Connections[userId] <= 0)
                {
                    Connections.Remove(userId);
                    isLastConnection = true;
                }
            }

            if (isLastConnection)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = false;
                    user.LastActive = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    await Clients.All.SendAsync(
                        "UserStatusChanged",
                        userId,
                        false,
                        user.LastActive
                    );
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task GetFriendsStatus()
        {
            var userId = GetUserId();

            var friendIds = await _context.Friendships
                .Where(f => (f.RequesterId == userId || f.ReceiverId == userId)
                            && f.Status == FriendshipStatus.Accepted)
                .Select(f => f.RequesterId == userId ? f.ReceiverId : f.RequesterId)
                .ToListAsync();

            foreach (var fid in friendIds)
            {
                var friend = await _context.Users.FindAsync(fid);
                if (friend != null)
                {
                    await Clients.Caller.SendAsync(
                        "UserStatusChanged",
                        friend.Id,
                        friend.IsOnline,
                        friend.LastActive
                    );
                }
            }
        }

        public async Task SendMessage(string content, int? receiverId)
        {
            var userId = GetUserId();
            var userName = Context.User.Identity.Name;

            var message = new Message
            {
                SenderId = userId,
                ReceiverId = receiverId,
                Content = content,
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            if (receiverId == null)
            {
                await Clients.All.SendAsync("ReceiveMessage", userId, userName, content, null, message.Timestamp, message.Id);
            }
            else
            {
                await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", userId, userName, content, receiverId, message.Timestamp, message.Id);
                await Clients.Caller.SendAsync("ReceiveMessage", userId, userName, content, receiverId, message.Timestamp, message.Id);
            }
        }

        public async Task EditMessage(int messageId, string newContent)
        {
            var userId = GetUserId();
            var msg = await _context.Messages.FindAsync(messageId);

            if (msg == null || msg.SenderId != userId) return;

            msg.Content = newContent;
            msg.IsEdited = true;
            await _context.SaveChangesAsync();

            await Clients.All.SendAsync("MessageEdited", msg.Id, msg.Content);
        }

        public async Task DeleteMessageForEveryone(int messageId)
        {
            var userId = GetUserId();
            var msg = await _context.Messages.FindAsync(messageId);

            if (msg == null) return;

            bool isAdmin = Context.User!.IsInRole("Admin");

            if (msg.SenderId == userId || isAdmin)
            {
                msg.IsDeleted = true;
                await _context.SaveChangesAsync();
                await Clients.All.SendAsync("MessageDeleted", msg.Id);
            }
        }

        public async Task DeleteMessageForMe(int messageId)
        {
            var userId = GetUserId();

            var exists = await _context.MessageDelete
                .AnyAsync(md => md.MessageId == messageId && md.UserId == userId);

            if (!exists)
            {
                _context.MessageDelete.Add(new MessageDelete
                {
                    MessageId = messageId,
                    UserId = userId
                });
                await _context.SaveChangesAsync();
            }

            await Clients.Caller.SendAsync("MessageDeletedForMe", messageId);
        }
    }
}