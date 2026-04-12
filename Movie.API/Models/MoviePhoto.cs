namespace Movie.API.Models
{
    public class MoviePhoto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public MovieEntity? Movie { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
