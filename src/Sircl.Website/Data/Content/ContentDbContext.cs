using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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
        }

        public DbSet<Content.Property> ContentProperties { get; set; }

        public DbSet<Content.PropertyType> ContentPropertyTypes { get; set; }

        public DbSet<Content.DataType> ContentDataTypes { get; set; }

        public DbSet<Content.Document> ContentDocuments { get; set; }

        public DbSet<Content.DocumentType> ContentDocumentTypes { get; set; }

        public DbSet<Content.SecuredPath> ContentSecuredPaths { get; set; }
    }
}
