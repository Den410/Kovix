using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ActorsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActorDto>>> GetActors()
        {
            return await _context.Actors
                .Select(a => new ActorDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    BirthDate = a.BirthDate,
                    PhotoUrl = a.PhotoUrl
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ActorDto>> GetActor(int id)
        {
            var actor = await _context.Actors
                .Include(a => a.MovieActors)
                .ThenInclude(ma => ma.Movie) 
                .FirstOrDefaultAsync(a => a.Id == id);

            if (actor == null)
            {
                return NotFound();
            }

            return new ActorDto
            {
                Id = actor.Id,
                Name = actor.Name,
                Bio = actor.Bio,
                BirthDate = actor.BirthDate,
                PhotoUrl = actor.PhotoUrl,

                Movies = actor.MovieActors.Select(ma => new ActorMovieDto
                {
                    MovieId = ma.MovieId,
                    Title = ma.Movie.Title,
                    PosterUrl = ma.Movie.PosterUrl,
                    Year = ma.Movie.Year,
                    Role = ma.Role
                }).ToList()
            };
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ActorDto>> CreateActor(ActorDto actorDto)
        {
            var existingActor = await _context.Actors
             .FirstOrDefaultAsync(a => a.Name.ToLower() == actorDto.Name.ToLower());

            if (existingActor != null)
            {
                return Ok(existingActor);
            }

            string localPhotoUrl = await DownloadAndSaveImage(actorDto.PhotoUrl);

            var actor = new Actor
            {
                Name = actorDto.Name,
                Bio = actorDto.Bio,
                BirthDate = actorDto.BirthDate,
                PhotoUrl = localPhotoUrl ?? actorDto.PhotoUrl
            };

            _context.Actors.Add(actor);
            await _context.SaveChangesAsync();

            actorDto.Id = actor.Id;
            actorDto.PhotoUrl = actor.PhotoUrl;

            return CreatedAtAction("GetActor", new { id = actor.Id }, actorDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateActor(int id, ActorDto actorDto)
        {
            if (id != actorDto.Id)
            {
                return BadRequest();
            }

            var actor = await _context.Actors.FindAsync(id);
            if (actor == null) return NotFound();

            actor.Name = actorDto.Name;
            actor.Bio = actorDto.Bio;
            actor.BirthDate = actorDto.BirthDate;

            if (actor.PhotoUrl != actorDto.PhotoUrl)
            {
                if (!string.IsNullOrEmpty(actorDto.PhotoUrl) && actorDto.PhotoUrl.StartsWith("http"))
                {
                    actor.PhotoUrl = await DownloadAndSaveImage(actorDto.PhotoUrl);
                }
                else
                {
                    actor.PhotoUrl = actorDto.PhotoUrl;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActorExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteActor(int id)
        {
            var actor = await _context.Actors.FindAsync(id);
            if (actor == null)
            {
                return NotFound();
            }

            _context.Actors.Remove(actor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ActorExists(int id)
        {
            return _context.Actors.Any(e => e.Id == id);
        }

        private async Task<string> DownloadAndSaveImage(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl) || !imageUrl.StartsWith("http")) return null;

                using (var client = new HttpClient())
                {
                    var imageBytes = await client.GetByteArrayAsync(imageUrl);
                    var fileName = $"actor-{Guid.NewGuid()}.jpg"; 

                    var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    var filePath = Path.Combine(uploadsFolder, fileName);
                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                    return $"/uploads/{fileName}";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error downloading image: {ex.Message}");
                return null;
            }
        }

        [HttpGet("lookup")]
        public async Task<ActionResult<IEnumerable<ActorLookupDto>>> GetActorsForDropdown()
        {
            var actors = await _context.Actors 
                .OrderBy(a => a.Name) 
                .Select(a => new ActorLookupDto
                {
                    Id = a.Id,
                    Name = a.Name
                })
                .ToListAsync();

            return Ok(actors);
        }
    }
}