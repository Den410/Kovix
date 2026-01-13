using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;
using Movie.API.Models.Enums;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FriendsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FriendsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("add/{userId}")]
        public async Task<IActionResult> AddFriend(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (currentUserId == userId) return BadRequest("Не можна додати самого себе");

            var hasBlock = await _context.UserBlocks
                .AnyAsync(b =>
                    (b.BlockerId == currentUserId && b.BlockedId == userId) ||
                    (b.BlockerId == userId && b.BlockedId == currentUserId));

            if (hasBlock)
            {
                return BadRequest("Взаємодія з цим користувачем обмежена.");
            }

            var existing = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.RequesterId == currentUserId && f.ReceiverId == userId) ||
                    (f.RequesterId == userId && f.ReceiverId == currentUserId));

            if (existing != null)
            {
                if (existing.Status == FriendshipStatus.Accepted) return BadRequest("Вже друзі");
                return BadRequest("Запит вже існує");
            }

            var friendship = new Friendship
            {
                RequesterId = currentUserId,
                ReceiverId = userId,
                Status = FriendshipStatus.Pending
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("accept/{requesterId}")]
        public async Task<IActionResult> AcceptFriend(int requesterId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.RequesterId == requesterId && f.ReceiverId == currentUserId && f.Status == FriendshipStatus.Pending);

            if (friendship == null) return NotFound("Запит не знайдено");

            friendship.Status = FriendshipStatus.Accepted;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("remove/{friendId}")]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.RequesterId == currentUserId && f.ReceiverId == friendId) ||
                    (f.RequesterId == friendId && f.ReceiverId == currentUserId));

            if (friendship != null)
            {
                _context.Friendships.Remove(friendship);
                await _context.SaveChangesAsync();
            }
            return Ok();
        }

        [HttpGet("my-friends")]
        public async Task<ActionResult<IEnumerable<FriendDto>>> GetMyFriends()
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var friendships = await _context.Friendships
                .Where(f => f.RequesterId == currentUserId || f.ReceiverId == currentUserId)
                .Include(f => f.Requester)
                .Include(f => f.Receiver)
                .ToListAsync();

            var result = friendships.Select(f =>
            {
                var isRequester = f.RequesterId == currentUserId;
                var otherUser = isRequester ? f.Receiver : f.Requester;

                string statusStr;
                if (f.Status == FriendshipStatus.Accepted) statusStr = "Friend";
                else statusStr = isRequester ? "PendingOutgoing" : "PendingIncoming";

                return new FriendDto
                {
                    Id = otherUser.Id,
                    Username = otherUser.Username,
                    AvatarUrl = otherUser.AvatarUrl,
                    Status = statusStr
                };
            });

            return Ok(result);
        }

        [HttpGet("status/{userId}")]
        public async Task<IActionResult> CheckStatus(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var f = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.RequesterId == currentUserId && f.ReceiverId == userId) ||
                    (f.RequesterId == userId && f.ReceiverId == currentUserId));

            if (f == null) return Ok(new { status = "None" });
            if (f.Status == FriendshipStatus.Accepted) return Ok(new { status = "Friend" });

            return Ok(new { status = f.RequesterId == currentUserId ? "PendingOutgoing" : "PendingIncoming" });
        }
    }
}
