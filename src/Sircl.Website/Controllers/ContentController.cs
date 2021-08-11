using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Controllers
{
    public class ContentController : Controller
    {
        #region Construction

        private readonly ContentDbContext context;
        private readonly ILogger<ContentController> logger;

        public ContentController(ContentDbContext context, ILogger<ContentController> logger)
        {
            this.context = context;
            this.logger = logger;
        }

        #endregion

        public async Task<IActionResult> Render(string path)
        {
            // Get current path:
            path = "/" + path;

            // Get current culture:
            var currentUICulture = System.Threading.Thread.CurrentThread.CurrentUICulture.Name;

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
