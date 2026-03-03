using Movie.API.Models.Enums;

namespace Movie.API.Models
{
    public class Appeal
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string? Content { get; set; }
        public AppealStatus Status { get; set; } = AppealStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? AdminComment { get; set; } 
    }
}
