using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Sircl.Website.Controllers
{
    public class ContentController : Controller
    {
        #region Construction

        private readonly ContentDbContext context;
        private readonly IMemoryCache cache;
        private readonly ILogger<ContentController> logger;

        private static readonly Dictionary<string, Regex> compiledRedirectRegex = new Dictionary<string, Regex>();

        public ContentController(ContentDbContext context, IMemoryCache cache, ILogger<ContentController> logger)
        {
            this.context = context;
            this.cache = cache;
            this.logger = logger;
        }

        #endregion

        public async Task<IActionResult> Render(string path)
        {
            // Get current path:
            path = "/" + path;

            // Get current culture:
            var currentUICulture = System.Threading.Thread.CurrentThread.CurrentUICulture.Name;

            // Check for redirections first:
            if (!cache.TryGetValue("Content:PathRedirections", out List<PathRedirection> redirections))
            {
                redirections = context.ContentPathRedirections.AsNoTracking().OrderBy(r => r.Position).ThenBy(r => r.Id).ToList();
                cache.Set("Content:PathRedirections", redirections);
            }

            // Apply first found matching redirection, if any:
            foreach(var redirection in redirections)
            {
                // If FromPath is not a regular expression:
                if (!redirection.IsRegex)
                {
                    // If match: redirect:
                    if (path.Equals(redirection.FromPath, StringComparison.OrdinalIgnoreCase))
                    {
                        Response.Headers.Add("Location", redirection.ToPath);
                        return StatusCode(redirection.StatusCode);
                    }
                }
                else // If FromPath is a regular expression:
                {
                    // Cache compiled version of FromPath regex in cache:
                    if (!compiledRedirectRegex.TryGetValue(redirection.FromPath, out Regex fromPathRegex)) 
                    {
                        fromPathRegex = new Regex(redirection.FromPath, RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
                        compiledRedirectRegex[redirection.FromPath] = fromPathRegex;
                    }
                    // Test the FromPath regex:
                    var match = fromPathRegex.Match(path);
                    // If match: redirect:
                    if (match.Success)
                    {
                        Response.Headers.Add("Location", match.Result(redirection.ToPath));
                        return StatusCode(redirection.StatusCode);
                    }
                }
            }      

            // Apply security:
            var securedPaths = await context.ContentSecuredPaths.Where(p => path.StartsWith(p.Path) && p.Roles != null).ToListAsync();
            if (securedPaths.Any())
            {
                // Check roles:
                foreach (var securedPath in securedPaths)
                {
                    var roles = securedPath.Roles.Split(',').Select(r => r.Trim()).Where(r => r.Length > 0).ToList();
                    if (roles.Any(r => r == "*"))
                    {
                        if (!this.User.Identity.IsAuthenticated) return Forbid();
                    }
                    else
                    {
                        if (!roles.Any(r => this.User.IsInRole(r))) return Forbid();
                    }
                }
            }

            // Retrieve candidate documents:
            var model = new Models.Content.ContentModel();
            model.Document = await context.ContentDocuments
                .Include(d => d.Type)
                .Include(d => d.Properties).ThenInclude(p => p.Type).ThenInclude(t => t.DataType)
                // Where path matches, document type has viewname, is published and not deleted:
                .Where(d => d.Path == path && d.Type.ViewName != null && d.PublishedOnUtc <= DateTime.UtcNow && d.DeletedOnUtc == null)
                // Get the best match for the current UI culture:
                .Where(d => d.Culture == currentUICulture || d.Culture == null)
                .OrderByDescending(d => d.Culture)
                .FirstOrDefaultAsync();

            if (model.Document == null)
            {
                return new NotFoundObjectResult(null);
            }
            else
            {
                // Retrieve published ancestors and children of document;
                if (model.Document.PathSegmentsCount.HasValue)
                {
                    var childPathSegmentsCount = model.Document.PathSegmentsCount + 1;
                    model.Children = await context.ContentDocuments
                        .Include(d => d.Type)
                        .Include(d => d.Properties).ThenInclude(p => p.Type).ThenInclude(t => t.DataType)
                        .Where(d => d.Path.StartsWith(path) && d.PathSegmentsCount == childPathSegmentsCount && d.PublishedOnUtc <= DateTime.UtcNow && d.DeletedOnUtc == null)
                        .Where(d => d.Culture == model.Document.Culture)
                        .OrderBy(d => d.SortKey).ThenBy(d => d.Name)
                        .ToListAsync();

                    model.Ancestors = await context.ContentDocuments
                        .Include(d => d.Type)
                        .Include(d => d.Properties).ThenInclude(p => p.Type).ThenInclude(t => t.DataType)
                        .Where(d => path.StartsWith(d.Path) && d.PublishedOnUtc <= DateTime.UtcNow && d.DeletedOnUtc == null)
                        .OrderBy(d => d.SortKey).ThenBy(d => d.Name)
                        .ToListAsync();
                }

                return View(model.Document.Type.ViewName, model);
            }
        }
    }
}
