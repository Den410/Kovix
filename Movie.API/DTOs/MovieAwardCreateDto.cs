using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class MovieAwardCreateDto
    {
        [Required]
        public int MovieId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Icon { get; set; } = string.Empty;
    }
}