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
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetByMovie(int movieId)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.MovieId == movieId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Review>> Create(CreateReviewDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim.Value);

            var movie = await _context.Movies
                .Include(m => m.Reviews)
                .FirstOrDefaultAsync(m => m.Id == dto.MovieId);

            if (movie == null) return NotFound("Фільм не знайдено");

            bool alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.MovieId == dto.MovieId && r.UserId == userId);

            if (alreadyReviewed)
            {
                return BadRequest("Ви вже залишили відгук до цього фільму.");
            }

            var review = new Review
            {
                MovieId = dto.MovieId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);

            movie.Reviews ??= new List<Review>();
            movie.Reviews.Add(review);

            movie.TotalReviews = movie.Reviews.Count;
            movie.AverageRating = movie.Reviews.Any() ? movie.Reviews.Average(r => r.Rating) : 0;

            await _context.SaveChangesAsync();

            await _context.Entry(review).Reference(r => r.User).LoadAsync();

            return CreatedAtAction(nameof(GetByMovie), new { movieId = review.MovieId }, review);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            if (userRole != "Admin" && review.UserId != userId)
            {
                return Forbid();
            }

            var movieId = review.MovieId;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            var movie = await _context.Movies
                .Include(m => m.Reviews)
                .FirstAsync(m => m.Id == movieId);

            if (movie.Reviews != null && movie.Reviews.Any())
            {
                movie.TotalReviews = movie.Reviews.Count;
                movie.AverageRating = movie.Reviews.Average(r => r.Rating);
            }
            else
            {
                movie.TotalReviews = 0;
                movie.AverageRating = 0;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, UpdateReviewDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();

            if (review.UserId != userId)
            {
                return Forbid();
            }

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;

            await _context.SaveChangesAsync();

            var movie = await _context.Movies
                .Include(m => m.Reviews)
                .FirstOrDefaultAsync(m => m.Id == review.MovieId);

            if (movie != null && movie.Reviews != null)
            {
                movie.AverageRating = movie.Reviews.Average(r => r.Rating);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }
}
