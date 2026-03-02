using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class UserBlockedActor
    {
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public int ActorId { get; set; }
        [ForeignKey("ActorId")]
        public Actor? Actor { get; set; } 

        public DateTime BlockedAt { get; set; } = DateTime.UtcNow;
    }
}
