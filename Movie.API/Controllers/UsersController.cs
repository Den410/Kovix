using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/toggle-block")]
        public async Task<IActionResult> ToggleBlockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Користувача не знайдено");

            if (user.Role == "Admin") return BadRequest("Не можна заблокувати адміністратора");

            user.IsBlocked = !user.IsBlocked;
            await _context.SaveChangesAsync();

            return Ok(new { isBlocked = user.IsBlocked, message = user.IsBlocked ? "Користувача заблоковано" : "Користувача розблоковано" });
        }

        [HttpGet("{id}/profile")]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
        {
            int? currentUserId = null;
            if (User.Identity.IsAuthenticated)
            {
                var claimId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (claimId != null) currentUserId = int.Parse(claimId.Value);
            }

            var userProfile = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == id)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    AvatarUrl = u.AvatarUrl,
                    CreatedAt = u.CreatedAt,
                    IsBlocked = u.IsBlocked,
                    IsOnline = u.IsOnline,
                    LastActive = u.LastActive,

                    FollowersCount = u.Followers.Count,
                    FollowingCount = u.Following.Count,

                    IsFollowingByMe = currentUserId.HasValue &&
                                      u.Followers.Any(f => f.ObserverId == currentUserId)
                })
                .FirstOrDefaultAsync();

            if (userProfile == null)
                return NotFound();

            return Ok(userProfile);
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        [HttpPost("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> FollowUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            if (currentUserId == id) return BadRequest("Не можна підписатися на самого себе");

            var existing = await _context.Set<UserFollow>()
                .FirstOrDefaultAsync(f => f.ObserverId == currentUserId && f.TargetId == id);

            if (existing != null) return BadRequest("Вже підписані");

            var follow = new UserFollow
            {
                ObserverId = currentUserId,
                TargetId = id
            };

            _context.Add(follow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Підписано успішно" });
        }

        [HttpDelete("{id}/unfollow")]
        [Authorize]
        public async Task<IActionResult> UnfollowUser(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            var follow = await _context.Set<UserFollow>()
                .FirstOrDefaultAsync(f => f.ObserverId == currentUserId && f.TargetId == id);

            if (follow == null) return NotFound("Підписку не знайдено");

            _context.Remove(follow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Відписано успішно" });
        }

        [HttpGet("{id}/followers")]
        public async Task<ActionResult<List<UserShortDto>>> GetFollowers(int id)
        {
            int? currentUserId = null;
            if (User.Identity.IsAuthenticated)
            {
                currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            }

            var followers = await _context.Set<UserFollow>()
                .Where(f => f.TargetId == id)
                .Include(f => f.Observer)
                .Select(f => new UserShortDto
                {
                    Id = f.Observer.Id,
                    Username = f.Observer.Username,
                    AvatarUrl = f.Observer.AvatarUrl,
                    IsFollowing = currentUserId.HasValue &&
                                  _context.Set<UserFollow>().Any(x => x.ObserverId == currentUserId && x.TargetId == f.Observer.Id)
                })
                .ToListAsync();

            return Ok(followers);
        }

        [HttpGet("{id}/following")]
        public async Task<ActionResult<List<UserShortDto>>> GetFollowing(int id)
        {
            int? currentUserId = null;
            if (User.Identity.IsAuthenticated)
            {
                currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            }

            var following = await _context.Set<UserFollow>()
                .Where(f => f.ObserverId == id)
                .Include(f => f.Target)
                .Select(f => new UserShortDto
                {
                    Id = f.Target.Id,
                    Username = f.Target.Username,
                    AvatarUrl = f.Target.AvatarUrl,
                    IsFollowing = currentUserId.HasValue &&
                                  _context.Set<UserFollow>().Any(x => x.ObserverId == currentUserId && x.TargetId == f.Target.Id)
                })
                .ToListAsync();

            return Ok(following);
        }
    }
}
