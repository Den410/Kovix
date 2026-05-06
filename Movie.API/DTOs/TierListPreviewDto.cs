using Movie.API.Models.Enums;

namespace Movie.API.DTOs
{
    public class TierListPreviewDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public TierListStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ItemCount { get; set; }
    }
}
