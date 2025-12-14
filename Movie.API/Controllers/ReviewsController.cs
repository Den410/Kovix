using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetMovieReviews(int movieId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.MovieId == movieId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetUserReviews(int userId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Movie)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview(Review review)
        {
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == review.UserId && r.MovieId == review.MovieId);

            if (existingReview != null)
            {
                return BadRequest("User has already reviewed this movie");
            }

            review.CreatedAt = DateTime.UtcNow;
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            await UpdateMovieRating(review.MovieId);

            return CreatedAtAction(nameof(GetMovieReviews), new { movieId = review.MovieId }, review);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, Review review)
        {
            if (id != review.Id)
            {
                return BadRequest();
            }

            _context.Entry(review).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                await UpdateMovieRating(review.MovieId);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            var movieId = review.MovieId;
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            await UpdateMovieRating(movieId);

            return NoContent();
        }

        private async Task UpdateMovieRating(int movieId)
        {
            var movie = await _context.Movies.FindAsync(movieId);
            if (movie != null)
            {
                var reviews = await _context.Reviews
                    .Where(r => r.MovieId == movieId)
                    .ToListAsync();

                movie.TotalReviews = reviews.Count;
                movie.AverageRating = reviews.Count > 0
                    ? Math.Round(reviews.Average(r => r.Rating), 1)
                    : 0;

                await _context.SaveChangesAsync();
            }
        }

        private bool ReviewExists(int id)
        {
            return _context.Reviews.Any(e => e.Id == id);
        }
    }
}
