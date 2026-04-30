using Movie.API.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Movie.API.Models
{
    public class ReviewerApplication
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [MaxLength(500)]
        public string MotivationText { get; set; } = string.Empty;

        public AppealStatus Status { get; set; } = AppealStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
