using Microsoft.EntityFrameworkCore;
using Movie.API.DTOs;
using Movie.API.Models;
using Movie.API.Models.Enums;

namespace Movie.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<MovieEntity> Movies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewVote> ReviewVotes { get; set; }
        public DbSet<Watchlist> Watchlists { get; set; }
        public DbSet<MovieReaction> MovieReactions { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<UserBlock> UserBlocks { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ReviewVote>()
                .HasOne(v => v.User)
                .WithMany() 
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovieReaction>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovieEntity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.Genre).HasMaxLength(100);
                entity.Property(e => e.Director).HasMaxLength(100);
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Comment).HasMaxLength(1000);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Reviews)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Movie)
                    .WithMany(m => m.Reviews)
                    .HasForeignKey(e => e.MovieId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Watchlist>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Watchlists)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Movie)
                    .WithMany(m => m.Watchlists)
                    .HasForeignKey(e => e.MovieId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Requester)
            .WithMany()
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Receiver)
                .WithMany()
                .HasForeignKey(f => f.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserBlock>()
            .HasOne(b => b.Blocker)
            .WithMany()
            .HasForeignKey(b => b.BlockerId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserBlock>()
                .HasOne(b => b.Blocked)
                .WithMany()
                .HasForeignKey(b => b.BlockedId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovieEntity>().HasData(
                new MovieEntity
                {
                    Id = 1,
                    Title = "Inception",
                    Description = "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                    Year = 2010,
                    Genre = "Sci-Fi",
                    Director = "Christopher Nolan",
                    PosterUrl = "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
                    TrailerUrl = "https://www.youtube.com/embed/YoHD9XEInc0",
                    AverageRating = 9.0,
                    TotalReviews = 2,
                    CreatedAt = new DateTime(2023, 5, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new MovieEntity
                {
                    Id = 2,
                    Title = "The Shawshank Redemption",
                    Description = "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                    Year = 1994,
                    Genre = "Drama",
                    Director = "Frank Darabont",
                    PosterUrl = "https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                    TrailerUrl = "https://www.youtube.com/embed/6hB3S9bIaco",
                    AverageRating = 10.0,
                    TotalReviews = 1,
                    CreatedAt = new DateTime(2023, 5, 2, 0, 0, 0, DateTimeKind.Utc)
                },
                new MovieEntity
                {
                    Id = 3,
                    Title = "Dune: Part Two",
                    Description = "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
                    Year = 2024,
                    Genre = "Sci-Fi",
                    Director = "Denis Villeneuve",
                    PosterUrl = "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                    TrailerUrl = "https://www.youtube.com/embed/Way9Dexny3w",
                    AverageRating = 8.0,
                    TotalReviews = 1,
                    CreatedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new MovieEntity
                {
                    Id = 4,
                    Title = "The Dark Knight",
                    Description = "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                    Year = 2008,
                    Genre = "Action",
                    Director = "Christopher Nolan",
                    PosterUrl = "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                    TrailerUrl = "https://www.youtube.com/embed/EXeTwQWrcwY",
                    AverageRating = 9.5,
                    TotalReviews = 0,
                    CreatedAt = new DateTime(2023, 6, 15, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<Review>().HasData(
                new Review
                {
                    Id = 1,
                    UserId = 1,
                    MovieId = 1,
                    Rating = 10,
                    Comment = "Masterpiece! Nolan is a genius.",
                    CreatedAt = new DateTime(2023, 6, 1, 14, 30, 0, DateTimeKind.Utc)
                },
                new Review
                {
                    Id = 2,
                    UserId = 2,
                    MovieId = 1,
                    Rating = 8,
                    Comment = "Great visuals, but a bit confusing.",
                    CreatedAt = new DateTime(2023, 6, 2, 10, 0, 0, DateTimeKind.Utc)
                },
                new Review
                {
                    Id = 3,
                    UserId = 1,
                    MovieId = 2,
                    Rating = 10,
                    Comment = "The best movie ever made.",
                    CreatedAt = new DateTime(2023, 6, 5, 9, 15, 0, DateTimeKind.Utc)
                },
                new Review
                {
                    Id = 4,
                    UserId = 2,
                    MovieId = 3,
                    Rating = 8,
                    Comment = "Amazing sound design.",
                    CreatedAt = new DateTime(2024, 3, 5, 18, 20, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<Watchlist>().HasData(
                new Watchlist
                {
                    Id = 1,
                    UserId = 1,
                    MovieId = 3,
                    IsFavorite = true,
                    Status = WatchStatus.None,
                    AddedAt = new DateTime(2024, 3, 1, 10, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}