using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Sircl.Website.Data.Content
{
    public class ContentDbContext : DbContext
    {
        public ContentDbContext(DbContextOptions<ContentDbContext> options)
            : base(options)
        { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Document>()
                .Property(d => d.State)
                .HasComputedColumnSql("CASE WHEN [DeletedOnUtc] IS NOT NULL THEN 'Deleted' WHEN [PublishedOnUtc] IS NOT NULL THEN 'Published' WHEN [PublicationRequestedOnUtc] IS NOT NULL THEN 'Published' ELSE 'New' END");

            modelBuilder.Entity<Property>()
                .Property(p => p.Settings)
                .HasConversion(
                    v => ContentDbContext.ToString(v),
                    s => ContentDbContext.ToDictionary(s),
                    new ValueComparer<Dictionary<string, string>>(
                        (v1, v2) => String.Equals(ContentDbContext.ToString(v1), ContentDbContext.ToString(v2)),
                        v => ContentDbContext.ToString(v).GetHashCode(),
                        v => v.ToDictionary(p => p.Key, p => p.Value)
                    )
                );
        }

        public DbSet<Content.Property> ContentProperties { get; set; }

        public DbSet<Content.PropertyType> ContentPropertyTypes { get; set; }

        public DbSet<Content.DataType> ContentDataTypes { get; set; }

        public DbSet<Content.Document> ContentDocuments { get; set; }

        public DbSet<Content.DocumentType> ContentDocumentTypes { get; set; }

        public DbSet<Content.SecuredPath> ContentSecuredPaths { get; set; }

        public DbSet<Content.PathRedirection> ContentPathRedirections { get; set; }

        #region Conversion helpers

        static string ToString(Dictionary<string, string> data)
        {
            if (data == null) return null;
            var sb = new StringBuilder();
            foreach (var pair in data)
            {
                if (sb.Length > 0) sb.Append('&');
                sb.Append(WebUtility.UrlEncode(pair.Key));
                sb.Append('=');
                sb.Append(WebUtility.UrlEncode(pair.Value));
            }
            return sb.ToString();
        }

        static Dictionary<string, string> ToDictionary(string data)
        {
            if (data == null) return null;
            var result = new Dictionary<string, string>();
            foreach (var pair in data.Split('&').Where(p => p.Contains('=')))
            {
                var parts = pair.Split('=');
                result[WebUtility.UrlDecode(parts[0])] = WebUtility.UrlDecode(parts[1]);
            }
            return result;
        }

        #endregion
    }
}
