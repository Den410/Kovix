namespace Movie.API.Models.TMdb
{
    public class TmdbMovieResult
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Release_Date { get; set; }
        public string? Poster_Path { get; set; }
    }
}
