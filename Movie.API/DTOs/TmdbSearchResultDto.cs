namespace Movie.API.DTOs
{
    public class TmdbSearchResultDto
    {
        public int TmdbId { get; set; }
        public string? Title { get; set; }
        public string? ReleaseDate { get; set; }
        public string? PosterUrl { get; set; }
    }
}
