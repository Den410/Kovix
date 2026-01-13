using Movie.API.Models.Enums;

namespace Movie.API.Models
{
    public class Watchlist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public bool IsFavorite { get; set; }
        public WatchStatus Status { get; set; } = WatchStatus.None;
        public DateTime AddedAt { get; set; }

        public User? User { get; set; }
        public MovieEntity? Movie { get; set; }
    }
}