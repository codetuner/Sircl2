using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Data.Content
{
    /// <summary>
    /// A content document holding properties.
    /// </summary>
    [Table(nameof(Document), Schema = "content")]
    public class Document
    {
        #region Fields
        private string path;
        #endregion

        /// <summary>
        /// States a document can have.
        /// </summary>
        public static readonly string[] States = new string[] { "New", "To publish", "Published", "Deleted" };

        /// <summary>
        /// Identifier of the document.
        /// </summary>
        [Key]
        public virtual int Id { get; set; }

        /// <summary>
        /// Name of the document.
        /// </summary>
        [Required, MaxLength(200)]
        public virtual string Name { get; set; }

        /// <summary>
        /// Culture of the document.
        /// </summary>
        [MaxLength(200)]
        public virtual string Culture { get; set; }

        /// <summary>
        /// SortKey used to sort child douments of the same parent (according to path).
        /// </summary>
        [MaxLength(200)]
        public virtual string SortKey { get; set; }

        /// <summary>
        /// Path of the document.
        /// </summary>
        /// <remarks>Automatically recalculates the PathSegmentsCount.</remarks>
        [MaxLength(2000)]
        [BackingField(nameof(path))]
        public virtual string Path
        {
            get
            {
                return this.path;
            }
            set
            {
                value = value?.Trim();
                if (value != null && value.StartsWith("/"))
                {
                    while (value.Length > 1 && value.EndsWith("/")) value = value[0..^1]; // Trim trailing slash.
                    if (value.Length == 1)
                        this.PathSegmentsCount = 0;
                    else
                        this.PathSegmentsCount = value.Count(c => c == '/');
                }
                else
                {
                    this.PathSegmentsCount = null;
                }

                this.path = value;
            }
        }

        /// <summary>
        /// [NotMapped] Segments the path is made of, provided the path starts with a "/".
        /// I.e. if the path is "/Home/About", would return ["Home", "About"].
        /// </summary>
        [NotMapped]
        public string[] PathSegments
        {
            get
            {
                if (this.Path != null && this.Path.StartsWith("/"))
                {
                    if (this.Path.Length == 1)
                    {
                        return Array.Empty<string>();
                    }
                    else
                    {
                        return this.Path[0..^1].Split('/');
                    }
                }
                else
                {
                    return null;
                }
            }
        }

        /// <summary>
        /// Number of segments that make up the path, provided the path starts with a "/".
        /// Used for querying direct children quickly.
        /// </summary>
        public virtual int? PathSegmentsCount { get; set; }

        /// <summary>
        /// Type of the document.
        /// </summary>
        public virtual int TypeId { get; set; }

        /// <summary>
        /// Type of the document.
        /// </summary>
        [ForeignKey(nameof(TypeId))]
        public virtual DocumentType Type { get; set; }

        /// <summary>
        /// Properties of this document.
        /// </summary>
        [InverseProperty(nameof(Property.Document))]
        public virtual List<Property> Properties { get; set; } = new List<Property>();

        /// <summary>
        /// [NotMapped] Returns the property with the given name.
        /// Requires the Properties collection to be loaded.
        /// </summary>
        /// <remarks>
        /// If no property is found with that name, one is created with an empty type definition.
        /// This to cover the case where a document is created and later on property types are added
        /// to its document type or one of its base types.
        /// </remarks>
        [NotMapped]
        public Property this[string name]
        {
            get
            {
                return this.Properties.FirstOrDefault(p => p.Type.Name == name)
                    ?? new Property() { Document = this, Type = new PropertyType() { Name = name } };
            }
        }

        /// <summary>
        /// Internal notes.
        /// </summary>
        public virtual string Notes { get; set; }

        /// <summary>
        /// UTC date/time this document was created.
        /// </summary>
        public virtual DateTime CreatedOnUtc { get; set; }

        /// <summary>
        /// User this document was created by.
        /// </summary>
        [MaxLength(256)]
        public virtual string CreatedBy { get; set; }

        /// <summary>
        /// UTC date/time this document was last modified.
        /// </summary>
        public virtual DateTime ModifiedOnUtc { get; set; }

        /// <summary>
        /// User this document was last modified by.
        /// </summary>
        [MaxLength(256)]
        public virtual string ModifiedBy { get; set; }

        /// <summary>
        /// UTC date/time this document was requested publication by.
        /// </summary>
        public virtual DateTime? PublicationRequestedOnUtc { get; set; }

        /// <summary>
        /// User this document was requested publication by.
        /// </summary>
        [MaxLength(256)]
        public virtual string PublicationRequestedBy { get; set; }

        /// <summary>
        /// UTC date/time this document was published.
        /// </summary>
        public virtual DateTime? PublishedOnUtc { get; set; }

        /// <summary>
        /// User this document was published by.
        /// </summary>
        [MaxLength(256)]
        public virtual string PublishedBy { get; set; }

        /// <summary>
        /// UTC date/time this document was deleted.
        /// </summary>
        public virtual DateTime? DeletedOnUtc { get; set; }

        /// <summary>
        /// User this document was deleted by.
        /// </summary>
        [MaxLength(256)]
        public virtual string DeletedBy { get; set; }

        /// <summary>
        /// Current state of this document.
        /// </summary>
        public string State { get; private set; }

        /// <summary>
        /// Tries to request publication.
        /// </summary>
        public bool TryRequestPublication(string byUserName)
        {
            if (this.PublishedOnUtc == null && this.PublicationRequestedOnUtc == null)
            {
                this.PublicationRequestedOnUtc = DateTime.UtcNow;
                this.PublicationRequestedBy = byUserName;
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Tries to publish. Publication must have been requested.
        /// </summary>
        public bool TryPublish(string byUserName)
        {
            if (this.PublishedOnUtc == null && this.PublicationRequestedOnUtc != null)
            {
                this.PublishedOnUtc = DateTime.UtcNow;
                this.PublishedBy = byUserName;
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Tries to cancel a publication or request for publication.
        /// </summary>
        public bool TryUnpublish(string byUserName)
        {
            if (this.PublishedOnUtc != null || this.PublicationRequestedOnUtc != null)
            {
                this.PublishedOnUtc = null;
                this.PublishedBy = null;
                this.PublicationRequestedOnUtc = null;
                this.PublicationRequestedBy = null;
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
