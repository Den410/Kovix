namespace Movie.API.Models
{
    public class WatchHistoryItem
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int MovieId { get; set; }
        public MovieEntity? Movie { get; set; }

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
