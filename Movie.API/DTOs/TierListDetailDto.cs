using Movie.API.Models.Enums;

namespace Movie.API.DTOs
{
    public class TierListDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Username { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public TierListStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ModeratedAt { get; set; }
        public string? AdminComment { get; set; }
        public List<TierListItemDto> Items { get; set; } = new List<TierListItemDto>();
        public List<TierConfigDto>? TiersConfig { get; set; }
    }
}