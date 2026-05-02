using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class UserAwardCreateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Icon { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Description { get; set; }
    }
}