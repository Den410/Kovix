using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class UserEpisodeRating
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public int EpisodeId { get; set; }
        [ForeignKey("EpisodeId")]
        public Episode? Episode { get; set; }

        public int Rating { get; set; }
    }
}
