namespace Movie.API.Models
{
    public class UserFollow
    {
        public int ObserverId { get; set; } 
        public User? Observer { get; set; }

        public int TargetId { get; set; }
        public User? Target { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
