using System.ComponentModel.DataAnnotations;

namespace Movie.API.Models
{
    public class CriticReview
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public MovieEntity? Movie { get; set; }
        public int UserId { get; set; } 
        public User? User { get; set; }
        [Range(1, 10)]
        public int StoryScore { get; set; }

        [Range(1, 10)]
        public int ActingScore { get; set; }
        [Range(1, 10)]
        public int VisualsScore { get; set; }
        [Range(1, 10)]
        public int AudioScore { get; set; }
        [MaxLength(150)]
        public string Verdict { get; set; } = string.Empty;
        public string FullText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public double OverallScore => Math.Round((StoryScore + ActingScore + VisualsScore + AudioScore) / 4.0, 1);
    }
}