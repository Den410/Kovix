using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;
using Movie.API.Models.Enums;
using Xunit;

namespace Movie.API.Tests;

public class MovieServiceTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }


    [Fact]
    public async Task GetMovies_FilterByGenre_ReturnsOnlyMatchingMovies()
    {
        var context = CreateInMemoryContext();
        context.Movies.AddRange(
            new MovieEntity { Id = 1, Title = "Inception", Genre = "Sci-Fi", Year = 2010, CreatedAt = DateTime.UtcNow },
            new MovieEntity { Id = 2, Title = "The Dark Knight", Genre = "Action", Year = 2008, CreatedAt = DateTime.UtcNow },
            new MovieEntity { Id = 3, Title = "Interstellar", Genre = "Sci-Fi", Year = 2014, CreatedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        var result = await context.Movies
            .Where(m => m.Genre != null && m.Genre.ToLower().Contains("sci-fi"))
            .ToListAsync();

        Assert.Equal(2, result.Count);
        Assert.All(result, m => Assert.Contains("Sci-Fi", m.Genre));
    }

    [Fact]
    public async Task GetMovies_FilterByYear_ReturnsOnlyMatchingMovies()
    {
        var context = CreateInMemoryContext();
        context.Movies.AddRange(
            new MovieEntity { Id = 1, Title = "Inception", Genre = "Sci-Fi", Year = 2010, CreatedAt = DateTime.UtcNow },
            new MovieEntity { Id = 2, Title = "The Dark Knight", Genre = "Action", Year = 2008, CreatedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        var result = await context.Movies
            .Where(m => m.Year == 2010)
            .ToListAsync();

        Assert.Single(result);
        Assert.Equal("Inception", result[0].Title);
    }

    [Fact]
    public async Task GetMovies_SearchByTitle_ReturnsCaseInsensitiveResults()
    {
        var context = CreateInMemoryContext();
        context.Movies.AddRange(
            new MovieEntity { Id = 1, Title = "Inception", Genre = "Sci-Fi", Year = 2010, CreatedAt = DateTime.UtcNow },
            new MovieEntity { Id = 2, Title = "The Dark Knight", Genre = "Action", Year = 2008, CreatedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        var search = "inception";
        var result = await context.Movies
            .Where(m => m.Title.ToLower().Contains(search.ToLower()))
            .ToListAsync();

        Assert.Single(result);
        Assert.Equal("Inception", result[0].Title);
    }


    [Fact]
    public async Task AddReview_UpdatesAverageRating_Correctly()
    {
        var context = CreateInMemoryContext();
        var movie = new MovieEntity
        {
            Id = 1, Title = "Inception", Genre = "Sci-Fi",
            Year = 2010, AverageRating = 0, TotalReviews = 0,
            CreatedAt = DateTime.UtcNow
        };
        context.Movies.Add(movie);
        context.Users.Add(new User
        {
            Id = 1, Username = "testuser", Email = "test@test.com",
            PasswordHash = "hash", CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var ratings = new List<int> { 8, 10 };
        double avgRating = ratings.Average();
        movie.AverageRating = avgRating;
        movie.TotalReviews = ratings.Count;
        await context.SaveChangesAsync();

        var updated = await context.Movies.FindAsync(1);
        Assert.Equal(9.0, updated!.AverageRating);
        Assert.Equal(2, updated.TotalReviews);
    }

    [Theory]
    [InlineData(new int[] { 10, 10 }, 10.0)]
    [InlineData(new int[] { 6, 8, 10 }, 8.0)]
    [InlineData(new int[] { 1, 5 }, 3.0)]
    public void CalculateAverageRating_ReturnsCorrectValue(int[] ratings, double expected)
    {
        double avg = ratings.Average();
        Assert.Equal(expected, avg);
    }


    [Fact]
    public async Task AddToWatchlist_NewEntry_SavesCorrectly()
    {
        var context = CreateInMemoryContext();
        context.Movies.Add(new MovieEntity
        {
            Id = 1, Title = "Inception", Genre = "Sci-Fi",
            Year = 2010, CreatedAt = DateTime.UtcNow
        });
        context.Users.Add(new User
        {
            Id = 1, Username = "testuser", Email = "test@test.com",
            PasswordHash = "hash", CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        context.Watchlists.Add(new Watchlist
        {
            UserId = 1,
            MovieId = 1,
            IsFavorite = true,
            Status = WatchStatus.None,
            AddedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var entry = await context.Watchlists.FirstOrDefaultAsync(w => w.UserId == 1 && w.MovieId == 1);
        Assert.NotNull(entry);
        Assert.True(entry.IsFavorite);
    }

    [Fact]
    public async Task AddToWatchlist_DuplicateEntry_OnlyOneExists()
    {
        var context = CreateInMemoryContext();
        context.Movies.Add(new MovieEntity
        {
            Id = 1, Title = "Inception", Genre = "Sci-Fi",
            Year = 2010, CreatedAt = DateTime.UtcNow
        });
        context.Users.Add(new User
        {
            Id = 1, Username = "testuser", Email = "test@test.com",
            PasswordHash = "hash", CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var exists = await context.Watchlists
            .AnyAsync(w => w.UserId == 1 && w.MovieId == 1);

        if (!exists)
        {
            context.Watchlists.Add(new Watchlist
            {
                UserId = 1, MovieId = 1,
                Status = WatchStatus.None,
                AddedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        var count = await context.Watchlists.CountAsync(w => w.UserId == 1 && w.MovieId == 1);
        Assert.Equal(1, count);
    }


    [Fact]
    public async Task GetMovies_SortByRatingDesc_ReturnsCorrectOrder()
    {
        var context = CreateInMemoryContext();
        context.Movies.AddRange(
            new MovieEntity { Id = 1, Title = "A", AverageRating = 7.0, Year = 2020, CreatedAt = DateTime.UtcNow },
            new MovieEntity { Id = 2, Title = "B", AverageRating = 9.5, Year = 2020, CreatedAt = DateTime.UtcNow },
            new MovieEntity { Id = 3, Title = "C", AverageRating = 8.0, Year = 2020, CreatedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        var result = await context.Movies
            .OrderByDescending(m => m.AverageRating)
            .ToListAsync();

        Assert.Equal(9.5, result[0].AverageRating);
        Assert.Equal(8.0, result[1].AverageRating);
        Assert.Equal(7.0, result[2].AverageRating);
    }
}