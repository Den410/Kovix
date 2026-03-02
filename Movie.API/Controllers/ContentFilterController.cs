using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class ContentFilterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContentFilterController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("blocked-actors")]
        public async Task<IActionResult> GetBlockedActors()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var blockedActors = await _context.UserBlockedActors
                .Where(uba => uba.UserId == userId)
                .Include(uba => uba.Actor)
                .Select(uba => new
                {
                    uba.ActorId,
                    uba.Actor.Name, 
                    uba.Actor.PhotoUrl, 
                    uba.BlockedAt
                })
                .ToListAsync();

            return Ok(blockedActors);
        }

        [HttpPost("block-actor/{actorId}")]
        public async Task<IActionResult> BlockActor(int actorId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var actorExists = await _context.Actors.AnyAsync(a => a.Id == actorId);
            if (!actorExists) return NotFound("Актора не знайдено");

            var alreadyBlocked = await _context.UserBlockedActors.AnyAsync(uba => uba.UserId == userId && uba.ActorId == actorId);
            if (alreadyBlocked) return BadRequest("Актор вже заблокований");

            _context.UserBlockedActors.Add(new UserBlockedActor { UserId = userId, ActorId = actorId });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Актора додано до чорного списку" });
        }

        [HttpDelete("unblock-actor/{actorId}")]
        public async Task<IActionResult> UnblockActor(int actorId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var blockedActor = await _context.UserBlockedActors.FirstOrDefaultAsync(uba => uba.UserId == userId && uba.ActorId == actorId);
            if (blockedActor == null) return NotFound("Актор не був заблокований");

            _context.UserBlockedActors.Remove(blockedActor);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Актора розблоковано" });
        }
    }
}