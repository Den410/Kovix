namespace Movie.API.Models
{
    public class MovieEntity
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
        public int ViewsCount { get; set; } = 0;
        public int? FranchiseId { get; set; } 
        public Franchise? Franchise { get; set; }

        public int? OrderInFranchise { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<Review>? Reviews { get; set; }
        public ICollection<Watchlist>? Watchlists { get; set; }
        public ICollection<Episode> Episodes { get; set; } = new List<Episode>();
        public List<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
    }
}