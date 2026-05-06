using Movie.API.Models.Enums;

namespace Movie.API.Models
{
    public class TierList
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool IsPublic { get; set; } = false; 
        public TierListStatus Status { get; set; } = TierListStatus.Pending; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ModeratedAt { get; set; }
        public int? ModeratedByAdminId { get; set; }
        public string? AdminComment { get; set; }

        public User? User { get; set; }
        public User? ModeratedByAdmin { get; set; }
        public ICollection<TierListItem> Items { get; set; } = new List<TierListItem>();
    }
}
