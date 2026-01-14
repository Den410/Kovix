using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class Message
    {
        public int Id { get; set; }

        public string? Content { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public bool IsEdited { get; set; } = false;

        public bool IsDeleted { get; set; } = false; 

        public int SenderId { get; set; }
        [ForeignKey(nameof(SenderId))]
        public User? Sender { get; set; }

        public int? ReceiverId { get; set; }
        [ForeignKey(nameof(ReceiverId))]
        public User? Receiver { get; set; }

        public ICollection<MessageDelete> DeletedFor { get; set; } = new List<MessageDelete>();
    }
}
