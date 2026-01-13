using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Movie.API.Data;
using Movie.API.Models;


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

        public async Task SendMessage(string message, int? receiverId)
        {
            var senderId = int.Parse(Context.UserIdentifier!);
            var senderName = Context.User.Identity!.Name;

            var msg = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = message,
                Timestamp = DateTime.UtcNow
            };
            _context.Messages.Add(msg);
            await _context.SaveChangesAsync();

            if (receiverId == null)
            {
                await Clients.All.SendAsync("ReceiveMessage", senderId, senderName, message, null, msg.Timestamp);
            }
            else
            {
                await Clients.User(receiverId.ToString()!).SendAsync("ReceiveMessage", senderId, senderName, message, receiverId, msg.Timestamp);
                await Clients.User(senderId.ToString()).SendAsync("ReceiveMessage", senderId, senderName, message, receiverId, msg.Timestamp);
            }
        }
    }
}