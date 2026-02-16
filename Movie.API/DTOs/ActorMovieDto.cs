namespace Movie.API.DTOs
{
    public class ActorMovieDto
    {
        public int MovieId { get; set; }
        public string? Title { get; set; }
        public string? PosterUrl { get; set; }
        public string? Role { get; set; }
        public int Year { get; set; }
    }
}
