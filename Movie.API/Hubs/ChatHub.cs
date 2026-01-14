using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;
using System.Security.Claims;

namespace Movie.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(Context.User!.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        }

        public async Task SendMessage(string content, int? receiverId)
        {
            var userId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
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
