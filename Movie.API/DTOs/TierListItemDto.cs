namespace Movie.API.DTOs
{
    public class TierListItemDto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public string? MovieTitle { get; set; }
        public string? MoviePosterUrl { get; set; }
        public string? Tier { get; set; }
        public int Position { get; set; }
    }
}
