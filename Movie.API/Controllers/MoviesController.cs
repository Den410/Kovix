using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MoviesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetMovies(
            [FromQuery] string search = "",
            [FromQuery] string genre = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Movies.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m => m.Title.Contains(search) || m.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(genre))
            {
                query = query.Where(m => m.Genre.Contains(genre));
            }

            var movies = await query
                .OrderByDescending(m => m.AverageRating)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(movies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MovieEntity>> GetMovie(int id)
        {
            var movie = await _context.Movies
                .Include(m => m.Reviews)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return NotFound();
            }

            return Ok(movie);
        }

        [HttpPost]
        public async Task<ActionResult<MovieEntity>> CreateMovie(MovieEntity movie)
        {
            movie.CreatedAt = DateTime.UtcNow;
            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, movie);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(int id, MovieEntity movie)
        {
            if (id != movie.Id)
            {
                return BadRequest();
            }

            _context.Entry(movie).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound();
            }

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("trending")]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetTrending()
        {
            var movies = await _context.Movies
                .OrderByDescending(m => m.TotalReviews)
                .ThenByDescending(m => m.AverageRating)
                .Take(10)
                .ToListAsync();

            return Ok(movies);
        }

        [HttpGet("top-rated")]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetTopRated()
        {
            var movies = await _context.Movies
                .Where(m => m.TotalReviews >= 5)
                .OrderByDescending(m => m.AverageRating)
                .Take(10)
                .ToListAsync();

            return Ok(movies);
        }

        private bool MovieExists(int id)
        {
            return _context.Movies.Any(e => e.Id == id);
        }
    }
}
