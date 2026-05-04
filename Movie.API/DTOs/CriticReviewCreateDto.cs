using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class CriticReviewCreateDto
    {
        [Required]
        public int MovieId { get; set; }

        [Range(1, 10)]
        public int StoryScore { get; set; }

        [Range(1, 10)]
        public int ActingScore { get; set; }

        [Range(1, 10)]
        public int VisualsScore { get; set; }

        [Range(1, 10)]
        public int AudioScore { get; set; }

        [Required, MaxLength(150)]
        public string Verdict { get; set; } = string.Empty;

        [Required]
        public string FullText { get; set; } = string.Empty;
    }
}