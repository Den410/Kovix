namespace Movie.API.DTOs
{
    public class MovieDetailDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int Year { get; set; }
        public string? Genre { get; set; }
        public string? Director { get; set; }
        public string? PosterUrl { get; set; }
        public string? TrailerUrl { get; set; }
        public bool IsSeries { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<string, int> ReactionCounts { get; set; } = new Dictionary<string, int>();
        public int? CurrentUserVote { get; set; } 
        public int? CurrentUserEmotion { get; set; }
        public string? Type { get; set; } 
        public List<EpisodeDto> Episodes { get; set; } = new List<EpisodeDto>();
        public List<CastDto>? Cast { get; set; }
        public int ViewsCount { get; set; }
    }
}
