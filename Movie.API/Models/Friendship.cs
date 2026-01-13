using Movie.API.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class Friendship
    {
        public int Id { get; set; }

        public int RequesterId { get; set; }
        [ForeignKey("RequesterId")]
        public User? Requester { get; set; }

        public int ReceiverId { get; set; }
        [ForeignKey("ReceiverId")]
        public User? Receiver { get; set; }

        public FriendshipStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
