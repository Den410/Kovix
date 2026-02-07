using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class CreateMovieDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(1895, 2100)]
        public int Year { get; set; }

        [MaxLength(100)]
        public string? Genre { get; set; }

        [MaxLength(100)]
        public string? Director { get; set; }

        public string? PosterUrl { get; set; }
        public string? TrailerUrl { get; set; }
        public bool IsSeries { get; set; }
    }
}
