namespace Movie.API.DTOs
{
    public class ReviewWithVotesDto
    {
        public int Id { get; set; }
        public string? Comment { get; set; }
        public int Rating { get; set; }
        public string? UserName { get; set; }
        public string? UserAvatar { get; set; } 
        public DateTime CreatedAt { get; set; }
        public int MovieId { get; set; }
        public int UserId { get; set; }

        public int LikesCount { get; set; }
        public int DislikesCount { get; set; }
        public int CurrentUserVote { get; set; }

        public string? MovieTitle { get; set; }
        public string? MoviePosterUrl { get; set; }
    }
}
