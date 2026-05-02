using System.ComponentModel.DataAnnotations;

namespace Movie.API.Models
{
    public class UserAward
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Icon { get; set; } = string.Empty; 

        [MaxLength(100)]
        public string? Description { get; set; }

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    }
}