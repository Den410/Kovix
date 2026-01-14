using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.API.Models
{
    public class MessageDelete
    {
        public int Id { get; set; }

        public int MessageId { get; set; }
        [ForeignKey(nameof(MessageId))]
        public Message? Message { get; set; }

        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
