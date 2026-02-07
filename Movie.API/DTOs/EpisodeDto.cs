namespace Movie.API.DTOs
{
    public class EpisodeDto
    {
        public int Id { get; set; }
        public int SeasonNumber { get; set; }
        public int EpisodeNumber { get; set; }
        public string? Title { get; set; }
        public double AverageRating { get; set; }
        public int? CurrentUserRating { get; set; }
    }
}
