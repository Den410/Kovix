using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class UserBlock
    {
        public int Id { get; set; }

        public int BlockerId { get; set; }
        [ForeignKey("BlockerId")]
        public User? Blocker { get; set; }

        public int BlockedId { get; set; } 
        [ForeignKey("BlockedId")]
        public User? Blocked { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
