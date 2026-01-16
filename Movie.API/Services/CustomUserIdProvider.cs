using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Movie.API.Services
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst("UserId")?.Value
                   ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
