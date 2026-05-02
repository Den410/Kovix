using System.ComponentModel.DataAnnotations;

namespace Movie.API.Models
{
    public class MovieAward
    {
        public int Id { get; set; }

        public int MovieId { get; set; }
        public MovieEntity? Movie { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; 

        [Required]
        public string Icon { get; set; } = string.Empty;

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    }
}