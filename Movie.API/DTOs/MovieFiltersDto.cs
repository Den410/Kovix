namespace Movie.API.DTOs
{
    public class MovieFiltersDto
    {
        public List<string>? Genres { get; set; }
        public List<int>? Years { get; set; }
        public List<AwardDto>? Awards { get; set; }
    }
}
