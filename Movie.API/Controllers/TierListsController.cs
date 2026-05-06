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
    public class TierListsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TierListsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<TierListPreviewDto>>> GetAllTierLists(
            [FromQuery] int? userId = null,
            [FromQuery] bool? isPublic = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.TierLists.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(tl => tl.UserId == userId.Value);
            }
            else
            {
                query = query.Where(tl => tl.IsPublic && tl.Status == TierListStatus.Approved);
            }

            if (isPublic.HasValue)
            {
                query = query.Where(tl => tl.IsPublic == isPublic.Value);
            }

            var total = await query.CountAsync();

            var tierLists = await query
                .Include(tl => tl.User)
                .Include(tl => tl.Items)
                .OrderByDescending(tl => tl.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = tierLists.Select(tl => new TierListPreviewDto
            {
                Id = tl.Id,
                UserId = tl.UserId,
                Username = tl.User?.Username ?? "Unknown",
                Title = tl.Title,
                Description = tl.Description,
                IsPublic = tl.IsPublic,
                Status = tl.Status,
                CreatedAt = tl.CreatedAt,
                ItemCount = tl.Items.Count
            }).ToList();

            HttpContext.Response.Headers.Add("X-Total-Count", total.ToString());
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<TierListDetailDto>> GetTierListById(int id)
        {
            var tierList = await _context.TierLists
                .Include(tl => tl.User)
                .Include(tl => tl.Items)
                .ThenInclude(tli => tli.Movie)
                .Include(tl => tl.ModeratedByAdmin)
                .FirstOrDefaultAsync(tl => tl.Id == id);

            if (tierList == null)
                return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (tierList.IsPublic && tierList.Status != TierListStatus.Approved)
            {
                if (userIdClaim == null || 
                    (int.Parse(userIdClaim.Value) != tierList.UserId && 
                     !User.IsInRole("Admin")))
                {
                    return Forbid();
                }
            }
            else if (!tierList.IsPublic)
            {
                if (userIdClaim == null || int.Parse(userIdClaim.Value) != tierList.UserId)
                    return Forbid();
            }

            return Ok(MapToDetailDto(tierList));
        }

        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<TierListPreviewDto>>> GetUserTierLists(int userId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            int? currentUserId = userIdClaim != null ? int.Parse(userIdClaim.Value) : null;

            var query = _context.TierLists
                .Where(tl => tl.UserId == userId)
                .Include(tl => tl.User)
                .Include(tl => tl.Items)
                .AsQueryable();

            if (currentUserId != userId)
            {
                query = query.Where(tl => tl.IsPublic && tl.Status == TierListStatus.Approved);
            }

            var tierLists = await query.OrderByDescending(tl => tl.CreatedAt).ToListAsync();

            var result = tierLists.Select(tl => new TierListPreviewDto
            {
                Id = tl.Id,
                UserId = tl.UserId,
                Username = tl.User?.Username ?? "Unknown",
                Title = tl.Title,
                Description = tl.Description,
                IsPublic = tl.IsPublic,
                Status = tl.Status,
                CreatedAt = tl.CreatedAt,
                ItemCount = tl.Items.Count
            }).ToList();

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<TierListDetailDto>> CreateTierList(CreateTierListDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var tierList = new TierList
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                IsPublic = false, 
                Status = TierListStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TierLists.Add(tierList);
            await _context.SaveChangesAsync();

            foreach (var itemDto in dto.Items)
            {
                var movie = await _context.Movies.FindAsync(itemDto.MovieId);
                if (movie == null)
                    continue;

                var item = new TierListItem
                {
                    TierListId = tierList.Id,
                    MovieId = itemDto.MovieId,
                    Tier = itemDto.Tier,
                    Position = itemDto.Position
                };
                _context.TierListItems.Add(item);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTierListById), new { id = tierList.Id }, 
                await MapTierListToDetailDto(tierList.Id));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTierList(int id, EditTierListDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var tierList = await _context.TierLists
                .Include(tl => tl.Items)
                .FirstOrDefaultAsync(tl => tl.Id == id);

            if (tierList == null)
                return NotFound();

            if (tierList.UserId != userId)
                return Forbid();

            if (tierList.IsPublic && tierList.Status == TierListStatus.Approved)
                return BadRequest("Cannot edit an approved public tier list");

            tierList.Title = dto.Title;
            tierList.Description = dto.Description;
            tierList.UpdatedAt = DateTime.UtcNow;

            _context.TierListItems.RemoveRange(tierList.Items);

            foreach (var itemDto in dto.Items)
            {
                var movie = await _context.Movies.FindAsync(itemDto.MovieId);
                if (movie == null)
                    continue;

                var item = new TierListItem
                {
                    TierListId = id,
                    MovieId = itemDto.MovieId,
                    Tier = itemDto.Tier,
                    Position = itemDto.Position
                };
                _context.TierListItems.Add(item);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTierList(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var tierList = await _context.TierLists.FindAsync(id);
            if (tierList == null)
                return NotFound();

            if (tierList.UserId != userId)
                return Forbid();

            _context.TierLists.Remove(tierList);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/share")]
        public async Task<IActionResult> ShareTierList(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var tierList = await _context.TierLists.FindAsync(id);
            if (tierList == null)
                return NotFound();

            if (tierList.UserId != userId)
                return Forbid();

            if (tierList.IsPublic)
                return BadRequest("Tier list is already shared");

            tierList.IsPublic = true;
            tierList.Status = TierListStatus.Pending;
            tierList.ModeratedAt = null;
            tierList.ModeratedByAdminId = null;
            tierList.AdminComment = null;
            tierList.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(await MapTierListToDetailDto(id));
        }

        [HttpPost("{id}/unshare")]
        public async Task<IActionResult> UnshareTierList(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var tierList = await _context.TierLists.FindAsync(id);
            if (tierList == null)
                return NotFound();

            if (tierList.UserId != userId)
                return Forbid();

            tierList.IsPublic = false;
            tierList.Status = TierListStatus.Pending;
            tierList.ModeratedAt = null;
            tierList.ModeratedByAdminId = null;
            tierList.AdminComment = null;
            tierList.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(await MapTierListToDetailDto(id));
        }

        private TierListDetailDto MapToDetailDto(TierList tierList)
        {
            return new TierListDetailDto
            {
                Id = tierList.Id,
                UserId = tierList.UserId,
                Username = tierList.User?.Username ?? "Unknown",
                Title = tierList.Title,
                Description = tierList.Description,
                IsPublic = tierList.IsPublic,
                Status = tierList.Status,
                CreatedAt = tierList.CreatedAt,
                UpdatedAt = tierList.UpdatedAt,
                ModeratedAt = tierList.ModeratedAt,
                AdminComment = tierList.AdminComment,
                Items = tierList.Items.Select(tli => new TierListItemDto
                {
                    Id = tli.Id,
                    MovieId = tli.MovieId,
                    MovieTitle = tli.Movie?.Title ?? "Unknown",
                    MoviePosterUrl = tli.Movie?.PosterUrl,
                    Tier = tli.Tier,
                    Position = tli.Position
                }).ToList()
            };
        }

        private async Task<TierListDetailDto> MapTierListToDetailDto(int tierListId)
        {
            var tierList = await _context.TierLists
                .Include(tl => tl.User)
                .Include(tl => tl.Items)
                .ThenInclude(tli => tli.Movie)
                .FirstOrDefaultAsync(tl => tl.Id == tierListId);

            if (tierList == null)
                return null;

            return MapToDetailDto(tierList);
        }
    }
}
