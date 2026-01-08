using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WatchlistController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WatchlistController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<WatchlistDto>> GetForMovie(int movieId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var entry = await _context.Watchlists
                .FirstOrDefaultAsync(w => w.MovieId == movieId && w.UserId == userId);

            if (entry == null)
            {
                return Ok(new WatchlistDto { Status = WatchStatus.None, IsFavorite = false });
            }

            return Ok(new WatchlistDto { Status = entry.Status, IsFavorite = entry.IsFavorite });
        }

        [HttpPost("movie/{movieId}")]
        public async Task<IActionResult> Update(int movieId, [FromBody] WatchlistDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var entry = await _context.Watchlists
                .FirstOrDefaultAsync(w => w.MovieId == movieId && w.UserId == userId);

            if (entry == null)
            {
                entry = new Watchlist
                {
                    UserId = userId,
                    MovieId = movieId,
                    Status = dto.Status,
                    IsFavorite = dto.IsFavorite,
                    AddedAt = DateTime.UtcNow
                };
                _context.Watchlists.Add(entry);
            }
            else
            {
                entry.Status = dto.Status;
                entry.IsFavorite = dto.IsFavorite;

                if (entry.Status != dto.Status)
                {
                    entry.AddedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(entry);
        }

        [HttpGet("my-list")]
        public async Task<ActionResult> GetMyList()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var list = await _context.Watchlists
                .Where(w => w.UserId == userId && (w.Status != WatchStatus.None || w.IsFavorite))
                .Include(w => w.Movie)
                .Select(w => new
                {
                    MovieId = w.MovieId,
                    Title = w.Movie.Title,
                    PosterUrl = w.Movie.PosterUrl,
                    Status = w.Status,
                    IsFavorite = w.IsFavorite
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}