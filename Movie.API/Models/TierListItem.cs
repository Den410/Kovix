namespace Movie.API.Models
{
    public class TierListItem
    {
        public int Id { get; set; }
        public int TierListId { get; set; }
        public int MovieId { get; set; }
        public string? Tier { get; set; } 
        public int Position { get; set; } 
        public TierList? TierList { get; set; }
        public MovieEntity? Movie { get; set; }
    }
}