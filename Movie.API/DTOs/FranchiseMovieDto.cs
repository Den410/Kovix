namespace Movie.API.DTOs
{
    public class FranchiseMovieDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public int Order { get; set; }
        public bool IsCurrent { get; set; }
    }
}
