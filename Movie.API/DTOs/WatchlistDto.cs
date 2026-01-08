using Movie.API.Models;

namespace Movie.API.DTOs
{
    public class WatchlistDto
    {
        public WatchStatus Status { get; set; }
        public bool IsFavorite { get; set; }
    }
}
