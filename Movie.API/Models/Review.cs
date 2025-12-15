using Movie.API.DTOs;

namespace Movie.API.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        public User? User { get; set; }
        public MovieEntity? Movie { get; set; }
        public ICollection<ReviewVote> Votes { get; set; } = new List<ReviewVote>();
    }
}