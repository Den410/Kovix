using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public int SenderId { get; set; }
        [ForeignKey("SenderId")]
        public User? Sender { get; set; }

        public int? ReceiverId { get; set; }
        [ForeignKey("ReceiverId")]
        public User? Receiver { get; set; }
    }
}
