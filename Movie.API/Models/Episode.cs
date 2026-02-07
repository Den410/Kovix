using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class Episode
    {
        public int Id { get; set; }

        public int MovieId { get; set; }
        public MovieEntity Movie { get; set; }

        public int SeasonNumber { get; set; }
        public int EpisodeNumber { get; set; }

        public string? Title { get; set; }

        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }

        public ICollection<UserEpisodeRating>? Ratings { get; set; }
    }
}
