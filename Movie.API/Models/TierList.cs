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
        public string? TiersConfig { get; set; } = GetDefaultTiersConfig();

        public User? User { get; set; }
        public User? ModeratedByAdmin { get; set; }
        public ICollection<TierListItem> Items { get; set; } = new List<TierListItem>();

        private static string GetDefaultTiersConfig()
        {
            var defaultTiers = new[]
            {
                new { id = "S", name = "S", color = "#FF6B6B" },
                new { id = "A", name = "A", color = "#4ECDC4" },
                new { id = "B", name = "B", color = "#45B7D1" },
                new { id = "C", name = "C", color = "#FFA502" },
                new { id = "D", name = "D", color = "#95E1D3" },
                new { id = "F", name = "F", color = "#C7CEEA" }
            };
            return System.Text.Json.JsonSerializer.Serialize(defaultTiers);
        }
    }
}