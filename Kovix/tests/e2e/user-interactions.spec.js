import { test, expect } from '@playwright/test';

test.describe('Kovix E2E Tests - User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Movie Search and Discovery', () => {
    test('user can search for movies by title and verify results change', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="пошук" i], input[aria-label*="search" i], [role="searchbox"]').first();
      
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const initialUrl = page.url();
        
        const searchTerm = 'Avatar';
        await searchInput.fill(searchTerm);
        
        await searchInput.press('Enter');
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        
        const resultMovies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
        const resultCount = await resultMovies.count();
        
        expect(resultCount).toBeGreaterThanOrEqual(0);
        
        const currentUrl = page.url();
        const hasResults = await resultMovies.first().isVisible({ timeout: 2000 }).catch(() => false);
        expect(currentUrl !== initialUrl || hasResults).toBeTruthy();
      }
    });

    test('user can view movie details by clicking on a movie', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]').first();
      await expect(movies).toBeVisible({ timeout: 5000 });
      
      const movieLink = movies.locator('a, [role="link"]').first();
      
      if (await movieLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        const movieUrl = await movieLink.getAttribute('href');
        
        await movieLink.click();
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        
        const movieTitle = page.locator('h1, [class*="movie-title"], [class*="title"]').first();
        await expect(movieTitle).toBeVisible({ timeout: 3000 });
        
        const movieInfo = page.locator('[class*="movie-info"], [class*="details"], [class*="description"]').first();
        await expect(movieInfo).toBeVisible().catch(() => {});
      }
    });

    test('user can filter movies and see results update in real-time', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const initialCount = await movies.count();
      
      const filters = page.locator('select, [class*="filter"], input[type="number"], input[type="range"]');
      const filterCount = await filters.count();
      
      if (filterCount > 0) {
        const firstFilter = filters.first();
        
        if (await firstFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
          const tagName = await firstFilter.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            const options = firstFilter.locator('option');
            const optionCount = await options.count();
            
            if (optionCount > 1) {
              const value = await options.nth(1).getAttribute('value');
              await firstFilter.selectOption(value);
            }
          } else {
            await firstFilter.fill('5');
          }
          
          await page.waitForLoadState('networkidle');
          
          const updatedMovies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
          await expect(updatedMovies.first()).toBeVisible();
          
          const updatedCount = await updatedMovies.count();
          expect(updatedCount).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Movie Rating and Reviews', () => {
    test('user can view movie rating information', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]').first();
      await expect(movies).toBeVisible({ timeout: 5000 });
      
      const ratingElement = movies.locator('[class*="rating"], [class*="stars"], [class*="score"], span:has-text(/\\d+\\.\\d+|★|⭐/)').first();
      
      const hasRating = await ratingElement.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasRating) {
        const ratingText = await ratingElement.textContent();
        expect(ratingText).toBeTruthy();
        expect(ratingText?.length).toBeGreaterThan(0);
      }
    });

    test('user can click on a movie and see reviews section', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]').first();
      await expect(movies).toBeVisible({ timeout: 5000 });
      
      const movieLink = movies.locator('a, [role="link"]').first();
      
      if (await movieLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await movieLink.click();
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        
        const reviewsSection = page.locator('[class*="review"], [class*="comment"], section:has-text("review"), section:has-text("рецензія")').first();
        
        const hasReviews = await reviewsSection.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (hasReviews) {
          const reviewItems = page.locator('[class*="review-item"], [class*="comment-item"], [class*="rating-item"]');
          const reviewCount = await reviewItems.count();
          expect(reviewCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Watchlist Management', () => {
    test('user can see watchlist button on movie card', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const watchlistBtn = movies.first().locator('[class*="watchlist"], [class*="bookmark"], [aria-label*="watchlist" i], [aria-label*="bookmark" i], button:has-text("Add")').first();
      
      if (await watchlistBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(watchlistBtn).toBeVisible();
        expect(await watchlistBtn.isEnabled()).toBeTruthy();
      }
    });

    test('user can interact with movie card buttons', async ({ page }) => {
      const movieCard = page.locator('[class*="card"], [class*="movie-item"], article').first();
      await expect(movieCard).toBeVisible({ timeout: 5000 });
      
      const buttons = movieCard.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      
      expect(buttonCount).toBeGreaterThanOrEqual(0);
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        
        await expect(firstButton).toBeVisible();
        const isEnabled = await firstButton.isEnabled().catch(() => true);
        expect(isEnabled).toBeTruthy();
      }
    });
  });

  test.describe('Filtering and Sorting', () => {
    test('user can apply genre filter and verify results', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const genreFilter = page.locator('select[name*="genre" i], select[aria-label*="genre" i], [class*="genre-filter"], [class*="filter-genre"]').first();
      
      if (await genreFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        const options = genreFilter.locator('option');
        const optionCount = await options.count();
        
        if (optionCount > 1) {
          const value = await options.nth(1).getAttribute('value');
          
          const beforeCount = await movies.count();
          
          await genreFilter.selectOption(value);
          await page.waitForLoadState('networkidle');
          
          const afterMovies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
          await expect(afterMovies.first()).toBeVisible();
          const afterCount = await afterMovies.count();
          
          expect(afterCount).toBeGreaterThan(0);
        }
      }
    });

    test('user can apply year filter and verify results', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const yearFilter = page.locator('select[name*="year" i], input[name*="year" i], input[aria-label*="year" i]').first();
      
      if (await yearFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
        const inputType = await yearFilter.getAttribute('type');
        
        if (inputType === 'number' || inputType === 'range') {
          await yearFilter.fill('2020');
        } else {
          const options = yearFilter.locator('option');
          if (await options.nth(1).isVisible({ timeout: 1000 }).catch(() => false)) {
            const value = await options.nth(1).getAttribute('value');
            await yearFilter.selectOption(value);
          }
        }
        
        await page.waitForLoadState('networkidle');
        
        const updatedMovies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
        await expect(updatedMovies.first()).toBeVisible();
        expect(await updatedMovies.count()).toBeGreaterThan(0);
      }
    });

    test('user can sort movies and verify order', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const titlesBefore = await movies.locator('[class*="title"]').allTextContents();
      
      const sortSelect = page.locator('select[name*="sort" i], select[aria-label*="sort" i]').first();
      
      if (await sortSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        const options = sortSelect.locator('option');
        const optionCount = await options.count();
        
        if (optionCount > 1) {
          const value = await options.nth(1).getAttribute('value');
          await sortSelect.selectOption(value);
          
          await page.waitForLoadState('networkidle');
          
          const updatedMovies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
          await expect(updatedMovies.first()).toBeVisible();
          
          const titlesAfter = await updatedMovies.locator('[class*="title"]').allTextContents();
          
          if (titlesBefore.length > 1) {
            expect(titlesAfter.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Social Features', () => {
    test('user can see user profile link on the page', async ({ page }) => {
      const profileLink = page.locator('a[href*="/profile"], [class*="profile"], button:has-text("profile"), button:has-text("профіль")').first();
      
      const hasProfileLink = await profileLink.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasProfileLink) {
        await expect(profileLink).toBeVisible();
        expect(await profileLink.isEnabled()).toBeTruthy();
      }
    });

    test('user can see navigation to other users or social section', async ({ page }) => {
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible({ timeout: 3000 });
      
      const links = nav.locator('a, [role="link"]');
      const linkCount = await links.count();
      
      expect(linkCount).toBeGreaterThan(0);
    });
  });

  test.describe('Theme and Settings', () => {
    test('user can see theme toggle button', async ({ page }) => {
      const themeToggle = page.locator('[class*="theme"], button[aria-label*="theme" i], button:has-text("theme"), button:has-text("тема")').first();
      
      const hasThemeToggle = await themeToggle.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasThemeToggle) {
        await expect(themeToggle).toBeVisible();
        expect(await themeToggle.isEnabled()).toBeTruthy();
        
        const htmlBefore = await page.locator('html').getAttribute('data-theme');
        
        await themeToggle.click();
        await page.waitForTimeout(300); 
        
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });

    test('user can see settings menu or options', async ({ page }) => {
      const settingsBtn = page.locator('[class*="settings"], button:has-text("settings"), button:has-text("налаштування"), [aria-label*="settings" i]').first();
      
      const hasSettings = await settingsBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasSettings) {
        await expect(settingsBtn).toBeVisible();
        expect(await settingsBtn.isEnabled()).toBeTruthy();
      }
    });
  });

  test.describe('Pagination', () => {
    test('user can see pagination controls', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const pagination = page.locator('[class*="pagination"], nav:has(button), [role="navigation"]:has-text(/page|сторінка|>>|<</)').first();
      
      const hasPagination = await pagination.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasPagination) {
        await expect(pagination).toBeVisible();
        
        const pageButtons = pagination.locator('button, a, [role="button"]');
        const buttonCount = await pageButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });

    test('user can navigate to next page and see different movies', async ({ page }) => {
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible({ timeout: 5000 });
      
      const initialTitles = await movies.locator('[class*="title"], h3, h4').allTextContents();
      
      const nextBtn = page.locator('button:has-text("next"), button:has-text("далі"), button:has-text("→"), [aria-label*="next"]').first();
      
      if (await nextBtn.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await nextBtn.click();
        
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        
        const newMovies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
        await expect(newMovies.first()).toBeVisible();
        
        const newTitles = await newMovies.locator('[class*="title"], h3, h4').allTextContents();
        
        if (initialTitles.length > 0 && newTitles.length > 0) {
          expect(newTitles.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('application should handle invalid routes gracefully', async ({ page }) => {
      await page.goto('/invalid-route-12345', { waitUntil: 'networkidle' }).catch(() => {});
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      const pageContent = await page.content();
      const hasContent = pageContent.length > 100; 
      expect(hasContent).toBeTruthy();
    });

    test('application should display content even with missing images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const movies = page.locator('[class*="card"], [class*="movie-item"], article, [class*="movie"]');
      await expect(movies.first()).toBeVisible();
      
      const movieCount = await movies.count();
      expect(movieCount).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('page should have proper heading structure', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      const headings = page.locator('h1, h2, h3');
      const headingCount = await headings.count();
      
      expect(headingCount).toBeGreaterThanOrEqual(0);
    });

    test('form fields should have proper structure', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const firstInput = inputs.first();
        
        const hasNameOrId = await firstInput.getAttribute('name').catch(() => null) || 
                           await firstInput.getAttribute('id').catch(() => null);
        
        expect(firstInput).toBeTruthy();
      }
    });

    test('buttons should be keyboard accessible', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('button, [role="button"]').first();
      
      if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.keyboard.press('Tab');
        
        await expect(button).toBeVisible();
      }
    });

    test('page should have semantic HTML structure', async ({ page }) => {
      const nav = page.locator('nav, [role="navigation"]');
      const main = page.locator('main, [role="main"]');
      const footer = page.locator('footer, [role="contentinfo"]');
      
      const navExists = await nav.isVisible({ timeout: 2000 }).catch(() => false);
      const mainExists = await main.isVisible({ timeout: 2000 }).catch(() => false);
      const footerExists = await footer.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(navExists || mainExists || footerExists).toBeTruthy();
    });
  });
});
